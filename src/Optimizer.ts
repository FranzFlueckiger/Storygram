import { FullConfig, Data, GenePool, Event } from './Types';
import { visit } from './Visitor';

/**
 * Optimizes actor ordering using an iterative barycenter sweep.
 *
 * Each actor is assigned a position seed (gene) in [0, 1]. The visitor
 * translates these seeds into concrete event orderings. We refine the seeds
 * by computing each actor's average normalized position across all events it
 * appears in, then re-visit. This converges quickly (typically < 10 passes)
 * and is fully deterministic — no random restarts needed.
 *
 * Complexity: O(passes × events × actors)  vs  GA's O(gen × pop × events × actors)
 */
export function fit(data: Data, config: FullConfig): Data {
  const MAX_PASSES = 24;

  let genes = initGenePool(data);
  let [events, updatedGenes] = visit(data, genes, config);
  let bestLoss = computeLoss(events, config);
  let bestEvents = events;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const refined = refineGenes(events, updatedGenes);
    const [newEvents, newGenes] = visit(data, refined, config);
    const loss = computeLoss(newEvents, config);

    if (loss < bestLoss) {
      bestLoss = loss;
      bestEvents = newEvents;
      events = newEvents;
      updatedGenes = newGenes;
    } else {
      break; // converged — no improvement this pass
    }
  }

  if (config.verbose) {
    console.log(`Optimizer: converged, loss=${bestLoss}`);
  }

  return { events: bestEvents, actors: data.actors };
}

/** Assign evenly-spaced seeds ordered by first appearance in the event stream. */
function initGenePool(data: Data): GenePool {
  const pool: GenePool = new Map();
  const visible = [...data.actors.values()].filter(a => !a.isHidden);
  const n = visible.length;
  visible.forEach((actor, i) => {
    pool.set(actor.actorID, n <= 1 ? 0.5 : i / (n - 1));
  });
  return pool;
}

/**
 * Barycenter update: replace each actor's gene with its average normalized
 * position across all events where it appears in the current layout.
 */
function refineGenes(events: Event[], currentGenes: GenePool): GenePool {
  const accum = new Map<string, { sum: number; count: number }>();

  events.forEach(event => {
    const len = event.state.length;
    if (len === 0) return;
    event.state.forEach((actorID, i) => {
      if (!accum.has(actorID)) accum.set(actorID, { sum: 0, count: 0 });
      const entry = accum.get(actorID)!;
      entry.sum += len <= 1 ? 0.5 : i / (len - 1);
      entry.count++;
    });
  });

  const newGenes = new Map(currentGenes);
  accum.forEach(({ sum, count }, actorID) => {
    newGenes.set(actorID, sum / count);
  });
  return newGenes;
}

function computeLoss(events: Event[], config: FullConfig): number {
  let score = 0;

  // Penalty: number of position switches
  const switchAmt = events.reduce((acc, e) => acc + e.switch.length, 0);
  score += switchAmt * config.amtLoss;

  // Penalty: total distance of switches (excluding new-actor insertions)
  const switchDist = events.reduce((acc, e) =>
    acc + e.switch.reduce((a, sw) => {
      if (!e.add.includes(e.state[sw.prev])) {
        a += Math.abs(sw.target - sw.prev);
      }
      return a;
    }, 0), 0);
  score += switchDist * config.lengthLoss;

  if (config.compact) {
    for (let i = 1; i < events.length; i++) {
      score += compareCompactedEventStates(events[i - 1].state, events[i].state) * config.linearLoss;
    }
  } else {
    const maxHeight = events.reduce((max, e) => Math.max(max, e.state.length), 0);
    score += maxHeight * config.yExtentLoss;
  }

  return score;
}

function compareCompactedEventStates(vec1: string[], vec2: string[]): number {
  const indexMap = vec1.reduce<Map<number, string>>(
    (map, v, i) => map.set(getCompactedLocation(i, vec1.length), v),
    new Map()
  );
  return vec2.reduce((acc, v, i) => {
    const loc = getCompactedLocation(i, vec2.length);
    if (indexMap.has(loc) && indexMap.get(loc) !== v) acc++;
    return acc;
  }, 0);
}

export function getCompactedLocation(position: number, arrayLength: number): number {
  const offset = (arrayLength % 2) / 2 - 0.5;
  return position - (arrayLength - 1) / 2 + offset;
}
