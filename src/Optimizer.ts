import { FullConfig, Data } from './Types';
import {
  buildLayout,
  computeActiveSets,
  contiguousGroupState,
  getCompactedLocation,
  layoutMetrics,
  visibleActors,
  LayoutMetrics,
} from './Layout';

export { getCompactedLocation } from './Layout';

const EPSILON = 1e-9;
const MAX_PASSES = 50;
const MAX_WORK = 400000000;
const MAX_EVALUATIONS = 300000;
const MAX_TIME_MS = 120;
const MAX_COMPACTION_PASSES = 8;
const MAX_COMPACTION_WORK = 80000000;
const INACTIVE = -1e9;

function now(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

interface Candidate {
  order: number[];
  cost: number;
  metrics: LayoutMetrics;
}

interface CostModel {
  size: number;
  compact: boolean;
  extendEventBar: boolean;
  continuous: boolean;
  events: number;
  active: Uint8Array[];
  groups: number[][];
  linearLoss: number;
  lengthLoss: number;
  amtLoss: number;
  spanLoss: number;
}

/**
 * Optimizes one global actor order, then optionally compacts groups per event.
 *
 * With `extendEventBar` the event connectors may span unrelated actors in
 * between, which keeps expanded-mode lines horizontal. Without it, each
 * event's actors are placed in one contiguous block so the black connector
 * only covers participants; the optimizer then minimises the resulting line
 * movement and crossings.
 */
export function fit(data: Data, config: FullConfig): Data {
  const actorIDs = visibleActors(data);
  if (actorIDs.length === 0) {
    return { events: data.events, actors: data.actors };
  }

  const deadline = now() + MAX_TIME_MS;
  const model = createCostModel(data, actorIDs, config);
  const workPerEvaluation = model.compact
    ? Math.max(1, compactEvaluationWork(model))
    : model.extendEventBar
      ? Math.max(
          1,
          model.groups.reduce((sum, group) => sum + group.length, 0),
        )
      : Math.max(1, model.size * model.size * model.events);
  const budget = Math.max(
    model.compact || model.extendEventBar ? 4000 : 2500,
    Math.min(
      MAX_EVALUATIONS,
      Math.floor(MAX_WORK / workPerEvaluation),
    ),
  );
  let evaluations = 0;
  const hasBudget = () => evaluations < budget && now() < deadline;

  const evaluate = (order: number[]): Candidate => {
    evaluations++;
    const metrics = evaluateOrder(model, order);
    const cost =
      metrics.crossings * model.amtLoss +
      metrics.distance * model.lengthLoss +
      metrics.moved * model.linearLoss +
      metrics.groupSpan * model.spanLoss;
    return { order, cost, metrics };
  };

  const seeds = buildSeeds(model, actorIDs, deadline);
  const seedCandidates: Candidate[] = [];
  for (const seed of seeds) {
    if (seedCandidates.length > 0 && now() >= deadline) break;
    seedCandidates.push(evaluate(seed));
  }
  seedCandidates.sort((a, b) => a.cost - b.cost);
  let best: Candidate | undefined;

  for (const seed of seedCandidates) {
    if (!hasBudget()) break;
    const candidate = improve(seed, evaluate, hasBudget);
    if (!best || candidate.cost < best.cost - EPSILON) {
      best = candidate;
    }
  }

  const baseOrder = (best ? best.order : seedCandidates[0].order).slice();
  const states = buildStates(baseOrder, model);
  const compactionPasses = model.extendEventBar ? compactGroups(states, model, deadline) : 0;
  const refinementPasses = !model.extendEventBar
    ? refineContiguousGroups(states, model, deadline)
    : 0;

  data.events.forEach((event, index) => {
    event.state = states[index].map(actor => actorIDs[actor]);
  });

  if (config.verbose) {
    const layout = buildLayout(data, config);
    const metrics = layoutMetrics(layout, true);
    const cost =
      metrics.crossings * model.amtLoss +
      metrics.distance * model.lengthLoss +
      metrics.moved * model.linearLoss +
      metrics.groupSpan * model.spanLoss;
    console.log(
      `Optimizer: cost=${cost.toFixed(2)}, ` +
        `crossings=${metrics.crossings}, moved=${metrics.moved}, ` +
        `distance=${metrics.distance.toFixed(2)}, groupSpan=${metrics.groupSpan}, ` +
        `evaluations=${evaluations}, compactionPasses=${compactionPasses}, ` +
        `refinementPasses=${refinementPasses}`,
    );
  }

  return { events: data.events, actors: data.actors };
}

function createCostModel(data: Data, actorIDs: string[], config: FullConfig): CostModel {
  const actorIndex = new Map(actorIDs.map((actorID, index) => [actorID, index]));
  const activeSets = computeActiveSets(data.events);
  const active: Uint8Array[] = [];
  const groups: number[][] = [];

  data.events.forEach((event, eventIndex) => {
    const mask = new Uint8Array(actorIDs.length);
    activeSets[eventIndex].forEach(actorID => {
      const index = actorIndex.get(actorID);
      if (index !== undefined) {
        mask[index] = 1;
      }
    });
    active.push(mask);

    const group = new Set<number>();
    event.group.forEach(actorID => {
      const index = actorIndex.get(actorID);
      if (index !== undefined) group.add(index);
    });
    groups.push(Array.from(group));
  });

  return {
    size: actorIDs.length,
    compact: config.compact,
    extendEventBar: config.extendEventBar,
    continuous: config.continuous,
    events: data.events.length,
    active,
    groups,
    linearLoss: config.linearLoss,
    lengthLoss: config.lengthLoss,
    amtLoss: config.amtLoss,
    spanLoss: config.groupSpanLoss ?? 2,
  };
}

// Compact evaluation walks the active set and counts crossings in O(active²)
// per event. Budgeting it as O(size × events) allowed billions of operations
// on tenure-style data where nearly every actor is active at every event.
function compactEvaluationWork(model: CostModel): number {
  let work = 0;
  for (const mask of model.active) {
    let active = 0;
    for (let i = 0; i < mask.length; i++) {
      active += mask[i];
    }
    work += active * active + model.size;
  }
  return work;
}

function evaluateOrder(model: CostModel, order: number[]): LayoutMetrics {
  if (!model.compact && model.extendEventBar) {
    const size = model.size;
    let groupSpan = 0;
    const position = new Int32Array(size);
    for (let i = 0; i < size; i++) position[order[i]] = i;

    for (let eventIndex = 0; eventIndex < model.events; eventIndex++) {
      const group = model.groups[eventIndex];
      if (group.length > 1) {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        group.forEach(actor => {
          const value = position[actor];
          if (value < min) min = value;
          if (value > max) max = value;
        });
        groupSpan += max - min;
      }
    }

    return { crossings: 0, moved: 0, horizontal: 0, distance: 0, total: 0, groupSpan };
  }

  return evaluateSequentialOrder(model, order);
}

function evaluateSequentialOrder(model: CostModel, order: number[]): LayoutMetrics {
  const size = model.size;
  let moved = 0;
  let horizontal = 0;
  let distance = 0;
  let total = 0;
  let groupSpan = 0;
  let crossings = 0;
  let hasPrevious = false;
  let previousState: number[] | undefined;

  let previous = new Float64Array(size);
  let current = new Float64Array(size);
  previous.fill(INACTIVE);

  for (let eventIndex = 0; eventIndex < model.events; eventIndex++) {
    current.fill(INACTIVE);
    const group = model.groups[eventIndex];
    let state: number[];

    if (model.compact) {
      const activeState = order.filter(actor => model.active[eventIndex][actor] === 1);
      if (model.extendEventBar) {
        state = activeState;
      } else {
        const previousRank = hasPrevious
          ? new Map(previousState!.map((actor, rank) => [actor, rank]))
          : undefined;
        state = contiguousGroupState(
          activeState,
          group,
          previousRank ? actor => previousRank.get(actor) : undefined,
        );
      }
    } else {
      state = contiguousGroupState(
        order,
        group,
        hasPrevious ? actor => previous[actor] : undefined,
      );
    }

    if (model.compact) {
      const count = state.length;
      const offset = (count % 2) / 2 - 0.5;
      const half = (count - 1) / 2;
      state.forEach((actor, rank) => {
        current[actor] = rank - half + offset;
      });
    } else {
      state.forEach((actor, rank) => {
        current[actor] = rank;
      });
    }

    if (group.length > 1) {
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      group.forEach(actor => {
        const value = current[actor];
        if (value === INACTIVE) return;
        if (value < min) min = value;
        if (value > max) max = value;
      });
      if (max >= min) groupSpan += max - min;
    }

    if (hasPrevious) {
      const common: number[] = [];
      for (let i = 0; i < state.length; i++) {
        const actor = state[i];
        const before = previous[actor];
        const after = current[actor];
        if (before === INACTIVE || after === INACTIVE) continue;
        if (
          !model.continuous &&
          (!model.active[eventIndex - 1][actor] || !model.active[eventIndex][actor])
        ) {
          continue;
        }
        common.push(actor);
        total++;
        const dy = after - before;
        if (dy <= EPSILON && dy >= -EPSILON) {
          horizontal++;
        } else {
          moved++;
          distance += dy < 0 ? -dy : dy;
        }
      }

      if (common.length > 1) {
        common.sort((a, b) => previous[a] - previous[b]);
        for (let i = 0; i < common.length; i++) {
          for (let j = i + 1; j < common.length; j++) {
            if (current[common[i]] > current[common[j]] + EPSILON) crossings++;
          }
        }
      }
    }

    const swap = previous;
    previous = current;
    current = swap;
    previousState = state;
    hasPrevious = true;
  }

  return { crossings, moved, horizontal, distance, total, groupSpan };
}

function buildStates(order: number[], model: CostModel): number[][] {
  if (model.compact) {
    if (model.extendEventBar) {
      return Array.from({ length: model.events }, (_, eventIndex) =>
        order.filter(actor => model.active[eventIndex][actor] === 1),
      );
    }

    const states: number[][] = [];
    let previousState: number[] | undefined;
    for (let eventIndex = 0; eventIndex < model.events; eventIndex++) {
      const activeState = order.filter(actor => model.active[eventIndex][actor] === 1);
      const previousRank = previousState
        ? new Map(previousState.map((actor, rank) => [actor, rank]))
        : undefined;
      const state = contiguousGroupState(
        activeState,
        model.groups[eventIndex],
        previousRank ? actor => previousRank.get(actor) : undefined,
      );
      states.push(state);
      previousState = state;
    }
    return states;
  }

  if (model.extendEventBar) {
    return Array.from({ length: model.events }, () => order.slice());
  }

  const states: number[][] = [];
  let previousPositions: Float64Array | undefined;
  for (let eventIndex = 0; eventIndex < model.events; eventIndex++) {
    const state = contiguousGroupState(
      order,
      model.groups[eventIndex],
      previousPositions ? actor => previousPositions![actor] : undefined,
    );
    states.push(state);
    const positions = new Float64Array(model.size);
    fillPositions(state, false, positions);
    previousPositions = positions;
  }
  return states;
}

function compactGroups(states: number[][], model: CostModel, deadline: number): number {
  if (model.spanLoss <= EPSILON || model.events === 0) return 0;

  const work = model.events * model.size * model.size * model.size;
  const passes = Math.min(
    MAX_COMPACTION_PASSES,
    Math.floor(MAX_COMPACTION_WORK / Math.max(1, work)),
  );
  if (passes < 1) return 0;

  const size = model.size;
  const currentY = new Float64Array(size);
  const previousY = new Float64Array(size);
  const nextY = new Float64Array(size);
  const isGroup = new Uint8Array(size);
  let usedPasses = 0;

  for (let pass = 0; pass < passes && now() < deadline; pass++) {
    usedPasses++;
    let changed = false;

    for (let eventIndex = 0; eventIndex < model.events; eventIndex++) {
      if (now() >= deadline) break;
      const group = model.groups[eventIndex];
      if (group.length < 2) continue;

      const state = states[eventIndex];
      fillPositions(state, model.compact, currentY);
      if (groupSpan(group, currentY) <= group.length - 1 + EPSILON) continue;

      const hasPrevious = eventIndex > 0;
      const hasNext = eventIndex + 1 < model.events;
      if (hasPrevious) {
        fillPositions(states[eventIndex - 1], model.compact, previousY);
      }
      if (hasNext) {
        fillPositions(states[eventIndex + 1], model.compact, nextY);
      }

      const previousActive = hasPrevious ? model.active[eventIndex - 1] : undefined;
      const currentActive = model.active[eventIndex];
      const nextActive = hasNext ? model.active[eventIndex + 1] : undefined;

      let currentCost = groupSpan(group, currentY) * model.spanLoss;
      if (previousActive) {
        currentCost += transitionCost(
          previousY,
          state,
          currentY,
          previousActive,
          currentActive,
          model,
        );
      }
      if (nextActive) {
        currentCost += transitionCost(
          currentY,
          states[eventIndex + 1],
          nextY,
          currentActive,
          nextActive,
          model,
        );
      }

      isGroup.fill(0);
      group.forEach(actor => {
        isGroup[actor] = 1;
      });
      const block: number[] = [];
      const rest: number[] = [];
      state.forEach(actor => {
        if (isGroup[actor]) block.push(actor);
        else rest.push(actor);
      });
      if (block.length < 2) continue;

      let bestState: number[] | undefined;
      let bestCost = currentCost;

      for (let start = 0; start <= rest.length; start++) {
        if (now() >= deadline) break;
        const candidate = rest
          .slice(0, start)
          .concat(block, rest.slice(start));
        if (sameOrder(candidate, state)) continue;

        fillPositions(candidate, model.compact, currentY);
        let cost = groupSpan(group, currentY) * model.spanLoss;
        if (previousActive) {
          cost += transitionCost(
            previousY,
            candidate,
            currentY,
            previousActive,
            currentActive,
            model,
          );
        }
        if (nextActive) {
          cost += transitionCost(
            currentY,
            states[eventIndex + 1],
            nextY,
            currentActive,
            nextActive,
            model,
          );
        }

        if (cost < bestCost - EPSILON) {
          bestCost = cost;
          bestState = candidate;
        }
      }

      if (bestState) {
        states[eventIndex] = bestState;
        changed = true;
      }
    }

    if (!changed) break;
  }

  return usedPasses;
}

/**
 * For participant-only event bars, event actors form one contiguous block.
 * This pass chooses the best block position for each event while considering
 * the neighbouring events, keeping lines as straight as possible. It applies
 * to both expanded and compact layouts.
 */
function refineContiguousGroups(states: number[][], model: CostModel, deadline: number): number {
  if (model.extendEventBar || model.events === 0) return 0;

  const work = model.events * model.size * model.size;
  const passes = Math.min(
    MAX_COMPACTION_PASSES,
    Math.floor(MAX_COMPACTION_WORK / Math.max(1, work)),
  );
  if (passes < 1) return 0;

  const size = model.size;
  const currentY = new Float64Array(size);
  const previousY = new Float64Array(size);
  const nextY = new Float64Array(size);
  const isGroup = new Uint8Array(size);
  let usedPasses = 0;

  for (let pass = 0; pass < passes && now() < deadline; pass++) {
    usedPasses++;
    let changed = false;

    for (let eventIndex = 0; eventIndex < model.events; eventIndex++) {
      if (now() >= deadline) break;
      const group = model.groups[eventIndex];
      if (group.length < 2) continue;

      const state = states[eventIndex];
      fillPositions(state, model.compact, currentY);

      const hasPrevious = eventIndex > 0;
      const hasNext = eventIndex + 1 < model.events;
      if (hasPrevious) {
        fillPositions(states[eventIndex - 1], model.compact, previousY);
      }
      if (hasNext) {
        fillPositions(states[eventIndex + 1], model.compact, nextY);
      }

      const previousActive = hasPrevious ? model.active[eventIndex - 1] : undefined;
      const currentActive = model.active[eventIndex];
      const nextActive = hasNext ? model.active[eventIndex + 1] : undefined;

      let currentCost = 0;
      if (previousActive) {
        currentCost += transitionCost(
          previousY,
          state,
          currentY,
          previousActive,
          currentActive,
          model,
        );
      }
      if (nextActive) {
        currentCost += transitionCost(
          currentY,
          states[eventIndex + 1],
          nextY,
          currentActive,
          nextActive,
          model,
        );
      }

      isGroup.fill(0);
      group.forEach(actor => {
        isGroup[actor] = 1;
      });
      const block: number[] = [];
      const rest: number[] = [];
      state.forEach(actor => {
        if (isGroup[actor]) block.push(actor);
        else rest.push(actor);
      });
      if (block.length < 2 || rest.length === 0) continue;

      let bestState: number[] | undefined;
      let bestCost = currentCost;

      for (let start = 0; start <= rest.length; start++) {
        if (now() >= deadline) break;
        const candidate = rest
          .slice(0, start)
          .concat(block, rest.slice(start));
        if (sameOrder(candidate, state)) continue;

        fillPositions(candidate, model.compact, currentY);
        let cost = 0;
        if (previousActive) {
          cost += transitionCost(
            previousY,
            candidate,
            currentY,
            previousActive,
            currentActive,
            model,
          );
        }
        if (nextActive) {
          cost += transitionCost(
            currentY,
            states[eventIndex + 1],
            nextY,
            currentActive,
            nextActive,
            model,
          );
        }

        if (cost < bestCost - EPSILON) {
          bestCost = cost;
          bestState = candidate;
        }
      }

      if (bestState) {
        states[eventIndex] = bestState;
        changed = true;
      }
    }

    if (!changed) break;
  }

  return usedPasses;
}

function fillPositions(
  state: number[],
  compact: boolean,
  positions: Float64Array,
): void {
  positions.fill(INACTIVE);
  state.forEach((actor, rank) => {
    positions[actor] = compact
      ? getCompactedLocation(rank, state.length)
      : rank;
  });
}

function groupSpan(group: number[], positions: Float64Array): number {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  group.forEach(actor => {
    const value = positions[actor];
    if (value === INACTIVE) return;
    if (value < min) min = value;
    if (value > max) max = value;
  });

  return max >= min ? max - min : 0;
}

function transitionCost(
  previousY: Float64Array,
  currentState: number[],
  currentY: Float64Array,
  previousActive: Uint8Array,
  currentActive: Uint8Array,
  model: CostModel,
): number {
  const common: number[] = [];
  let moved = 0;
  let distance = 0;

  currentState.forEach(actor => {
    const before = previousY[actor];
    const after = currentY[actor];
    if (before === INACTIVE || after === INACTIVE) return;
    if (!model.continuous && (!previousActive[actor] || !currentActive[actor])) return;

    common.push(actor);
    const dy = after - before;
    if (dy > EPSILON || dy < -EPSILON) {
      moved++;
      distance += dy < 0 ? -dy : dy;
    }
  });

  let crossings = 0;
  if (common.length > 1) {
    common.sort((a, b) => previousY[a] - previousY[b]);
    for (let i = 0; i < common.length; i++) {
      for (let j = i + 1; j < common.length; j++) {
        if (currentY[common[i]] > currentY[common[j]] + EPSILON) crossings++;
      }
    }
  }

  return (
    moved * model.linearLoss +
    distance * model.lengthLoss +
    crossings * model.amtLoss
  );
}

function sameOrder(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function improve(
  seed: Candidate,
  evaluate: (order: number[]) => Candidate,
  hasBudget: () => boolean,
): Candidate {
  let current = seed;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let next: Candidate | undefined;

    for (let i = 0; i < current.order.length && hasBudget(); i++) {
      for (let j = i + 1; j < current.order.length && hasBudget(); j++) {
        const result = evaluate(swapped(current.order, i, j));
        if (result.cost < current.cost - EPSILON && (!next || result.cost < next.cost)) {
          next = result;
        }
      }
    }

    for (let i = 0; i < current.order.length && hasBudget(); i++) {
      for (let j = 0; j < current.order.length && hasBudget(); j++) {
        if (i === j) continue;
        const result = evaluate(moved(current.order, i, j));
        if (result.cost < current.cost - EPSILON && (!next || result.cost < next.cost)) {
          next = result;
        }
      }
    }

    if (!next) break;
    current = next;
  }

  return current;
}

function swapped(order: number[], i: number, j: number): number[] {
  const result = order.slice();
  const value = result[i];
  result[i] = result[j];
  result[j] = value;
  return result;
}

function moved(order: number[], from: number, to: number): number[] {
  const result = order.slice();
  const value = result.splice(from, 1)[0];
  result.splice(to, 0, value);
  return result;
}

function buildSeeds(model: CostModel, actorIDs: string[], deadline: number): number[][] {
  const first = actorIDs.map((_, index) => index);
  const frequency = frequencyOrder(model, first);
  const seeds = [
    first,
    frequency,
    barycenterOrder(model, first, first, deadline),
    barycenterOrder(model, first, frequency, deadline),
  ];

  const unique: number[][] = [];
  const seen = new Set<string>();
  seeds.forEach(seed => {
    const key = seed.join(',');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(seed);
    }
  });
  return unique;
}

function frequencyOrder(model: CostModel, first: number[]): number[] {
  const firstIndex = new Int32Array(model.size);
  first.forEach((actor, index) => {
    firstIndex[actor] = index;
  });
  const counts = new Int32Array(model.size);
  model.groups.forEach(group => {
    group.forEach(actor => counts[actor]++);
  });
  return first
    .slice()
    .sort((a, b) => counts[b] - counts[a] || firstIndex[a] - firstIndex[b]);
}

function barycenterOrder(
  model: CostModel,
  first: number[],
  seed: number[],
  deadline: number,
): number[] {
  const firstIndex = new Int32Array(model.size);
  first.forEach((actor, index) => {
    firstIndex[actor] = index;
  });
  let order = seed.slice();
  let positions = new Float64Array(model.size);
  order.forEach((actor, index) => {
    positions[actor] = index;
  });

  for (let pass = 0; pass < 24 && now() < deadline; pass++) {
    const sum = new Float64Array(model.size);
    const count = new Int32Array(model.size);

    model.groups.forEach(group => {
      if (group.length === 0) return;
      let total = 0;
      group.forEach(actor => {
        total += positions[actor];
      });
      const mean = total / group.length;
      group.forEach(actor => {
        sum[actor] += mean;
        count[actor]++;
      });
    });

    const next = order
      .map(actor => ({
        actor,
        value: count[actor] > 0 ? sum[actor] / count[actor] : positions[actor],
      }))
      .sort((a, b) => a.value - b.value || firstIndex[a.actor] - firstIndex[b.actor])
      .map(entry => entry.actor);

    if (next.every((actor, index) => actor === order[index])) break;
    order = next;
    positions = new Float64Array(model.size);
    order.forEach((actor, index) => {
      positions[actor] = index;
    });
  }

  return order;
}
