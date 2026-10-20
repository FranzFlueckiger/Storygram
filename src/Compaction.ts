const EPSILON = 1e-9;
const SLOPE_THRESHOLD = 1;

/**
 * Penalises movement that spans more than one actor lane within a single
 * event step. Steep jumps are visually agitating, while ordinary one-lane
 * shifts stay free.
 */
export function slopePenalty(dy: number): number {
  const excess = Math.abs(dy) - SLOPE_THRESHOLD;
  return excess > 0 ? excess * excess : 0;
}

/**
 * Finds the vertical offset for a compacted event block that keeps the block
 * contiguous while making its lines as straight as possible against the
 * previous event. Each target is the offset that would align one shared actor.
 */
export function bestCompactOffset(
  targets: number[],
  linearLoss: number,
  lengthLoss: number,
  slopeLoss = 0,
): number {
  if (targets.length === 0) return 0;

  const sorted = targets.slice().sort((a, b) => a - b);
  const prefix = new Float64Array(sorted.length + 1);
  const prefixSquares = new Float64Array(sorted.length + 1);
  sorted.forEach((value, index) => {
    prefix[index + 1] = prefix[index] + value;
    prefixSquares[index + 1] = prefixSquares[index] + value * value;
  });

  let best = 0;
  let bestCost = Number.POSITIVE_INFINITY;

  for (let start = 0; start < sorted.length; ) {
    let end = start + 1;
    while (end < sorted.length && sorted[end] - sorted[start] <= EPSILON) {
      end++;
    }
    const value = sorted[start];
    const leftDistance = value * start - prefix[start];
    const rightDistance =
      prefix[sorted.length] - prefix[end] - value * (sorted.length - end);
    const moved = sorted.length - (end - start);
    const slope =
      slopeLoss > EPSILON
        ? slopeCost(sorted, value, prefix, prefixSquares)
        : 0;
    const cost =
      moved * linearLoss +
      (leftDistance + rightDistance) * lengthLoss +
      slope * slopeLoss;

    if (
      cost < bestCost - EPSILON ||
      (Math.abs(cost - bestCost) <= EPSILON && Math.abs(value) < Math.abs(best))
    ) {
      best = value;
      bestCost = cost;
    }
    start = end;
  }

  return best;
}

/**
 * Sum of slopePenalty for every target when the chosen offset is `value`.
 * Uses prefix sums of values and squares so each candidate costs O(log n).
 */
function slopeCost(
  sorted: number[],
  value: number,
  prefix: Float64Array,
  prefixSquares: Float64Array,
): number {
  const length = sorted.length;
  const lower = lowerBound(sorted, value - SLOPE_THRESHOLD);
  const upper = upperBound(sorted, value + SLOPE_THRESHOLD);
  const leftBase = value - SLOPE_THRESHOLD;
  const rightBase = value + SLOPE_THRESHOLD;

  let cost =
    lower * leftBase * leftBase -
    2 * leftBase * prefix[lower] +
    prefixSquares[lower];

  const rightCount = length - upper;
  const rightSum = prefix[length] - prefix[upper];
  const rightSquares = prefixSquares[length] - prefixSquares[upper];
  cost +=
    rightSquares -
    2 * rightBase * rightSum +
    rightCount * rightBase * rightBase;

  return cost;
}

function lowerBound(values: number[], target: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (values[middle] < target) low = middle + 1;
    else high = middle;
  }
  return low;
}

function upperBound(values: number[], target: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (values[middle] <= target) low = middle + 1;
    else high = middle;
  }
  return low;
}
