# Data Structure

Internal types exposed by the library — useful when writing typed callbacks.

## Storygram

```typescript
class Storygram {
  // Filtered and optimised data (populated after construction)
  public processedData: Data

  // Raw preprocessed data (before filtering)
  public data: Data

  // Merged user config + defaults
  public config: FullConfig

  constructor(rawData: any[], config: Config)

  // Re-run filtering (called automatically in the constructor)
  public calculate(): void

  // Run the optimizer, render the grid, and draw to the DOM
  public draw(): void

  // Remove the SVG and tooltip from the DOM
  public remove(): void
}
```

## Event

```typescript
class Event {
  // Sequential index among visible events
  public index?: number

  // Whether this event is hidden by a filter
  public isHidden: boolean

  // Actor IDs entering at this event
  public add: string[]

  // Actor IDs leaving at this event
  public remove: string[]

  // Actor IDs grouped at this event
  public group: string[]

  // All actor IDs present (grouped or continuous)
  public state: string[]

  // Position switches applied by the optimizer
  public switch: Switch[]

  // Actor IDs hidden by filterGroupAmt / filterActorCustom
  public hiddenActors: string[]

  constructor(
    public eventValue: number | string | undefined,
    public eventXValue: number,
    public data: Record<string, unknown>,
  )
}
```

`event.data` contains every field of the original input object, making it available inside `eventDescription`, `filterEventCustom`, and other callbacks.

## Actor

```typescript
class Actor {
  // All events this actor participates in
  public layers: Event[]

  // Whether this actor is hidden by a filter
  public isHidden: boolean

  constructor(
    public actorID: string,
    public data: Record<string, unknown>,
  )
}
```

`actor.data` contains every field of the original input object (range format), or is empty `{}` for array/table formats.
