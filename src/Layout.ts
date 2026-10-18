import { Data, Event, FullConfig } from './Types';

export interface LayoutEvent {
  event: Event;
  index: number;
  state: string[];
  drawn: Set<string>;
  y: Map<string, number>;
  group: string[];
  groupSpan: number;
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
}

const EPSILON = 1e-9;

export function getCompactedLocation(position: number, arrayLength: number): number {
  const offset = (arrayLength % 2) / 2 - 0.5;
  return position - (arrayLength - 1) / 2 + offset;
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
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  let maxHeight = 0;

  data.events.forEach((event, index) => {
    let state: string[];
    if (order) {
      state = config.compact
        ? order.filter(actorID => active[index].has(actorID))
        : order.filter(actorID => visibleSet.has(actorID));
    } else {
      state = config.compact
        ? event.state.filter(actorID => actorID !== '')
        : event.state.slice();
    }

    const y = new Map<string, number>();
    state.forEach((actorID, actorIndex) => {
      y.set(actorID, config.compact ? getCompactedLocation(actorIndex, state.length) : actorIndex);
    });

    const drawn = new Set(
      state.filter(actorID =>
        data.actors.has(actorID) && (config.continuous || active[index].has(actorID)),
      ),
    );

    const group = event.group.filter(actorID => drawn.has(actorID));
    let groupSpan = 0;
    if (group.length > 1) {
      const groupY = group.map(actorID => y.get(actorID)!);
      groupSpan = Math.max(...groupY) - Math.min(...groupY);
    }

    drawn.forEach(actorID => {
      const value = y.get(actorID)!;
      if (value < yMin) yMin = value;
      if (value > yMax) yMax = value;
    });

    const scaling = config.eventValueScaling;
    const x = Math.pow(scaling, 4) * event.eventXValue + (1 - Math.pow(scaling, 4)) * index;

    if (state.length > maxHeight) maxHeight = state.length;

    layouts.push({ event, index, state, drawn, y, group, groupSpan, x });
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

  layout.events.forEach(event => {
    groupSpan += event.groupSpan;
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

  return { crossings, moved, horizontal, distance, total, groupSpan };
}
