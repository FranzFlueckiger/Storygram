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

The layout is computed with a **barycenter sweep** algorithm. These weights control how it trades off competing objectives.

```typescript
// Penalty per position switch
amtLoss: number     // Default: 1

// Penalty per unit of switch distance
lengthLoss: number  // Default: 1

// Penalty for state changes between events (compact mode)
linearLoss: number  // Default: 1

// Penalty for chart height (expanded mode)
yExtentLoss: number // Default: 0
```

Raising `amtLoss` discourages unnecessary actor reordering. Raising `lengthLoss` additionally penalises large jumps. In compact mode, `linearLoss` rewards stable actor positions between events.
