import { bestCompactOffset, slopePenalty } from './Compaction';
import { Data, Event, FullConfig } from './Types';

export interface LayoutEvent {
  event: Event;
  index: number;
  state: string[];
  drawn: Set<string>;
  y: Map<string, number>;
  group: string[];
  groupSpan: number;
  groupExtraSpan: number;
  x: number;
}

export interface Layout {
  events: LayoutEvent[];
  xLen: number;
  maxHeight: number;
  yMin: number;
  yMax: number;
}

export interface LayoutMetrics {
  crossings: number;
  moved: number;
  horizontal: number;
  distance: number;
  total: number;
  groupSpan: number;
  groupExtraSpan: number;
  slope: number;
}

const EPSILON = 1e-9;

export function getCompactedLocation(position: number, arrayLength: number): number {
  const offset = (arrayLength % 2) / 2 - 0.5;
  return position - (arrayLength - 1) / 2 + offset;
}

/**
 * Places all members of `group` into one contiguous block inside `order`.
 * The insertion point keeps the block as close as possible to the actors'
 * current/target positions, so existing lines move as little as possible.
 */
export function contiguousGroupState<T>(
  order: T[],
  group: Iterable<T>,
  targetPosition?: (actor: T) => number | undefined,
): T[] {
  const groupSet = new Set(group);
  const rest: T[] = [];
  const block: T[] = [];
  const orderIndex = new Map<T, number>();

  order.forEach((actor, index) => {
    orderIndex.set(actor, index);
    if (groupSet.has(actor)) block.push(actor);
    else rest.push(actor);
  });

  if (block.length < 2 || rest.length === 0) return order.slice();

  const offsets = block.map((actor, index) => {
    const target = targetPosition ? targetPosition(actor) : undefined;
    return (target ?? orderIndex.get(actor)!) - index;
  });
  offsets.sort((a, b) => a - b);
  const middle = offsets.length / 2;
  const median =
    offsets.length % 2 === 1
      ? offsets[Math.floor(middle)]
      : (offsets[middle - 1] + offsets[middle]) / 2;
  const start = Math.max(0, Math.min(rest.length, Math.round(median)));

  return rest.slice(0, start).concat(block, rest.slice(start));
}

export function visibleActors(data: Data): string[] {
  return Array.from(data.actors.values())
    .filter(actor => !actor.isHidden)
    .map(actor => actor.actorID);
}

export function computeActiveSets(events: Event[]): Set<string>[] {
  const active = new Set<string>();
  return events.map((event, index) => {
    if (index > 0) events[index - 1].remove.forEach(actorID => active.delete(actorID));
    event.add.forEach(actorID => active.add(actorID));
    return new Set(active);
  });
}

export function buildLayout(
  data: Data,
  config: FullConfig,
  order?: string[],
  activeSets?: Set<string>[],
): Layout {
  const active = activeSets ?? computeActiveSets(data.events);
  const visible = visibleActors(data);
  const visibleSet = new Set(visible);
  const layouts: LayoutEvent[] = [];
  const compactness = Math.min(1, Math.max(0, config.compact));
  const fullyOpen = compactness === 0;
  const fullyCompact = compactness === 1;
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  let maxHeight = 0;
  let previousState: string[] | undefined;
  let previousDrawn: Set<string> | undefined;
  let previousY: Map<string, number> | undefined;
  let previousTightState: string[] | undefined;
  let previousTightDrawn: Set<string> | undefined;
  let previousTightY: Map<string, number> | undefined;

  data.events.forEach((event, index) => {
    let state: string[];
    const y = new Map<string, number>();
    let drawn: Set<string>;
    let heightLength: number;

    if (fullyOpen || fullyCompact) {
      if (order) {
        const previousPosition = previousState
          ? new Map(previousState.map((actorID, position) => [actorID, position]))
          : undefined;
        const targetPosition = previousPosition
          ? (actorID: string) => previousPosition.get(actorID)
          : undefined;

        if (fullyCompact) {
          const compactActors = config.continuous
            ? order.filter(actorID => visibleSet.has(actorID))
            : order.filter(actorID => active[index].has(actorID));
          state = config.extendEventBar
            ? compactActors
            : contiguousGroupState(compactActors, event.group, targetPosition);
        } else if (config.extendEventBar) {
          state = order.filter(actorID => visibleSet.has(actorID));
        } else {
          state = contiguousGroupState(
            order.filter(actorID => visibleSet.has(actorID)),
            event.group,
            targetPosition,
          );
        }
      } else {
        state = fullyCompact
          ? event.state.filter(actorID => actorID !== '')
          : event.state.slice();
      }

      state.forEach((actorID, actorIndex) => {
        y.set(actorID, fullyCompact ? getCompactedLocation(actorIndex, state.length) : actorIndex);
      });

      drawn = new Set(
        state.filter(actorID =>
          data.actors.has(actorID) && (config.continuous || active[index].has(actorID)),
        ),
      );

      if (fullyCompact && previousDrawn && previousY) {
        const targets: number[] = [];
        drawn.forEach(actorID => {
          if (!previousDrawn!.has(actorID)) return;
          const before = previousY!.get(actorID);
          const after = y.get(actorID);
          if (before !== undefined && after !== undefined) targets.push(before - after);
        });
        const offset = bestCompactOffset(
          targets,
          config.linearLoss,
          config.lengthLoss,
          config.slopeLoss ?? 0,
        );
        if (offset !== 0) {
          state.forEach(actorID => y.set(actorID, y.get(actorID)! + offset));
        }
      }

      if (fullyCompact) {
        previousDrawn = drawn;
        previousY = new Map();
        drawn.forEach(actorID => previousY!.set(actorID, y.get(actorID)!));
      }

      previousState = state;
      previousTightState = state;
      heightLength = state.length;
    } else {
      let openState: string[];
      let tightState: string[];

      if (order) {
        const visibleOrder = order.filter(actorID => visibleSet.has(actorID));
        const previousOpenPosition = previousState
          ? new Map(previousState.map((actorID, position) => [actorID, position]))
          : undefined;
        const openTarget = previousOpenPosition
          ? (actorID: string) => previousOpenPosition.get(actorID)
          : undefined;
        openState = config.extendEventBar
          ? visibleOrder
          : contiguousGroupState(visibleOrder, event.group, openTarget);

        const compactActors = config.continuous
          ? visibleOrder
          : order.filter(actorID => active[index].has(actorID));
        const previousTightPosition = previousTightState
          ? new Map(previousTightState.map((actorID, position) => [actorID, position]))
          : undefined;
        const tightTarget = previousTightPosition
          ? (actorID: string) => previousTightPosition.get(actorID)
          : undefined;
        tightState = config.extendEventBar
          ? compactActors
          : contiguousGroupState(compactActors, event.group, tightTarget);
      } else {
        openState = event.state.slice();
        if (event.compactState) {
          tightState = event.compactState.slice();
        } else {
          const compactActors = config.continuous
            ? openState
            : openState.filter(actorID => active[index].has(actorID));
          const previousTightPosition = previousTightState
            ? new Map(previousTightState.map((actorID, position) => [actorID, position]))
            : undefined;
          const tightTarget = previousTightPosition
            ? (actorID: string) => previousTightPosition.get(actorID)
            : undefined;
          tightState = config.extendEventBar
            ? compactActors
            : contiguousGroupState(compactActors, event.group, tightTarget);
        }
      }

      const openY = new Map(openState.map((actorID, actorIndex) => [actorID, actorIndex]));
      const tightY = new Map(
        tightState.map((actorID, actorIndex) => [
          actorID,
          getCompactedLocation(actorIndex, tightState.length),
        ]),
      );

      if (previousTightDrawn && previousTightY) {
        const targets: number[] = [];
        tightState.forEach(actorID => {
          if (!previousTightDrawn!.has(actorID)) return;
          const before = previousTightY!.get(actorID);
          const after = tightY.get(actorID);
          if (before !== undefined && after !== undefined) targets.push(before - after);
        });
        const offset = bestCompactOffset(
          targets,
          config.linearLoss,
          config.lengthLoss,
          config.slopeLoss ?? 0,
        );
        if (offset !== 0) {
          tightState.forEach(actorID =>
            tightY.set(actorID, tightY.get(actorID)! + offset),
          );
        }
      }

      openState.forEach(actorID => {
        const open = openY.get(actorID)!;
        const tight = tightY.get(actorID);
        y.set(
          actorID,
          tight === undefined ? open : open * (1 - compactness) + tight * compactness,
        );
      });

      drawn = new Set(
        openState.filter(actorID =>
          data.actors.has(actorID) && (config.continuous || active[index].has(actorID)),
        ),
      );

      previousState = openState;
      previousTightState = tightState;
      previousTightDrawn = new Set(tightState);
      previousTightY = tightY;
      state = openState;
      heightLength = openState.length * (1 - compactness) + tightState.length * compactness;
    }

    const group = event.group.filter(actorID => drawn.has(actorID));
    let groupSpan = 0;
    let groupExtraSpan = 0;
    if (group.length > 1) {
      const groupY = group.map(actorID => y.get(actorID)!);
      groupSpan = Math.max(...groupY) - Math.min(...groupY);
      groupExtraSpan = Math.max(0, groupSpan - (group.length - 1));
    }

    drawn.forEach(actorID => {
      const value = y.get(actorID)!;
      if (value < yMin) yMin = value;
      if (value > yMax) yMax = value;
    });

    const scaling = config.eventValueScaling;
    const x = Math.pow(scaling, 4) * event.eventXValue + (1 - Math.pow(scaling, 4)) * index;

    if (heightLength > maxHeight) maxHeight = heightLength;

    layouts.push({ event, index, state, drawn, y, group, groupSpan, groupExtraSpan, x });
  });

  return {
    events: layouts,
    xLen: data.events.length,
    maxHeight,
    yMin: Number.isFinite(yMin) ? yMin : 0,
    yMax: Number.isFinite(yMax) ? yMax : 0,
  };
}

export function layoutMetrics(layout: Layout, countCrossings = true): LayoutMetrics {
  let crossings = 0;
  let moved = 0;
  let horizontal = 0;
  let distance = 0;
  let total = 0;
  let groupSpan = 0;
  let groupExtraSpan = 0;
  let slope = 0;

  layout.events.forEach(event => {
    groupSpan += event.groupSpan;
    groupExtraSpan += event.groupExtraSpan;
  });

  for (let i = 1; i < layout.events.length; i++) {
    const previous = layout.events[i - 1];
    const current = layout.events[i];
    const common = previous.state.filter(
      actorID =>
        previous.drawn.has(actorID) && current.drawn.has(actorID) && current.y.has(actorID),
    );

    total += common.length;
    common.forEach(actorID => {
      const dy = Math.abs(current.y.get(actorID)! - previous.y.get(actorID)!);
      if (dy <= EPSILON) {
        horizontal++;
      } else {
        moved++;
        distance += dy;
        slope += slopePenalty(dy);
      }
    });

    if (countCrossings && common.length > 1) {
      const ordered = common
        .slice()
        .sort((a, b) => previous.y.get(a)! - previous.y.get(b)!);
      for (let a = 0; a < ordered.length; a++) {
        for (let b = a + 1; b < ordered.length; b++) {
          if (current.y.get(ordered[a])! > current.y.get(ordered[b])!) crossings++;
        }
      }
    }
  }

  return { crossings, moved, horizontal, distance, total, groupSpan, groupExtraSpan, slope };
}
