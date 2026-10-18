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

```typescript
// Penalty for every line segment that is not horizontal
linearLoss: number       // Default: 1

// Penalty per unit of vertical movement
lengthLoss: number       // Default: 1

// Penalty for actor-line crossings introduced by compaction
amtLoss: number          // Default: 1

// Benefit (weight) of shortening an event's group connector
groupSpanLoss: number    // Default: 2
```

Raising `linearLoss` and `lengthLoss` keeps lines straighter and limits compaction to cases with a large group-span saving. Raising `groupSpanLoss` makes the black group connectors tighter. `yExtentLoss` is deprecated and unused.
