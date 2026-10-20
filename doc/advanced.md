# Advanced Settings

## Verbose

Log data import details, filtering steps, and optimizer output to the browser console. Useful for debugging.

```typescript
verbose: boolean
// Default: false
```

## Root

CSS selector for the DOM element the Storygram is appended to.

```typescript
root: string
// Default: 'body'
```

```typescript
// Example — append inside a specific container
const config: Config = {
  dataFormat: 'array',
  eventField: 'event',
  actorArrayField: 'actors',
  root: '#my-chart-container',
}
```

## Optimizer weights

The optimizer first chooses one global actor order for the whole chart. This keeps expanded-mode lines horizontal and crossings impossible. It then runs a weighted per-event compaction pass that may move actors to shorten an event's group connector. A move is accepted only when its weighted benefit is positive, so these weights control the straightness / group-tightness trade-off:

When `extendEventBar` is `false` (the default), every event's participants are forced into one contiguous block so the black connector never covers unrelated actors. This works in both expanded and compact layouts; actors that are merely active (career span) remain drawn but are moved outside the participant block. The optimizer then places those blocks to minimise line movement and crossings; `linearLoss`, `lengthLoss` and `amtLoss` control that trade-off. Set `extendEventBar: true` to allow connectors to span unrelated actors, which keeps the global order perfectly straight.

```typescript
// Penalty for every line segment that is not horizontal
linearLoss: number       // Default: 4

// Penalty per unit of vertical movement
lengthLoss: number       // Default: 2

// Penalty for steep per-step moves in compact mode (squared excess beyond one lane)
slopeLoss: number        // Default: 4

// Penalty for actor-line crossings introduced by compaction
amtLoss: number          // Default: 1

// Penalty per additional y step beyond a group's contiguous block
groupExtraSpanLoss: number // Default: 4
```

Raising `linearLoss` and `lengthLoss` keeps lines straighter and limits compaction. `slopeLoss` only applies in compact mode and specifically discourages lines that jump several actor lanes in one event step; ordinary one-lane moves remain free. `groupExtraSpanLoss` penalises each extra y step an event group spans beyond its minimum contiguous block: a group of `n` actors is free when it occupies exactly `n` consecutive lanes, and every non-group actor between its members adds one penalised step. This makes the optimizer remove even a single extra step. `groupSpanLoss` is deprecated and treated as an alias when `groupExtraSpanLoss` is not set. `yExtentLoss` is deprecated and unused.
