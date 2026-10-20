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
linearLoss: number       // Default: 1

// Penalty per unit of vertical movement
lengthLoss: number       // Default: 1

// Penalty for steep per-step moves in compact mode (squared excess beyond one lane)
slopeLoss: number        // Default: 0.25

// Penalty for actor-line crossings introduced by compaction
amtLoss: number          // Default: 1

// Benefit (weight) of shortening an event's group connector
groupSpanLoss: number    // Default: 2
```

Raising `linearLoss` and `lengthLoss` keeps lines straighter and limits compaction to cases with a large group-span saving. `slopeLoss` only applies in compact mode and specifically discourages lines that jump several actor lanes in one event step; ordinary one-lane moves remain free. Raising `groupSpanLoss` makes the black group connectors tighter. `yExtentLoss` is deprecated and unused.
