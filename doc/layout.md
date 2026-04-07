# Layout

Visual options for the Storygram.

## Continuous

When `true`, all actors are visible from the first to the last event even when not grouped.

```typescript
continuous: boolean
// Default: false
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:2,actors:['e','b']},{event:10,actors:['d','b','e']},{event:12,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',continuous:true}"
/>

## Compact

Centers actors around the x-axis instead of aligning them to the top. Useful for groups of similar size over time (governments, sports teams, …).

```typescript
compact: boolean
// Default: false
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['a','c','d']},{event:2,actors:['c','d','e']},{event:3,actors:['e','f','g']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',compact:true}"
/>

<script setup>
const colorData = [
  { actor: 'a', end: 1,           team: 'one' },
  { actor: 'b', end: 2,           team: 'two' },
  { actor: 'c', start: 0,         team: 'two' },
  { actor: 'd', start: 2, end: 3, team: 'one' },
  { actor: 'e', start: 1, end: 2, team: 'one' },
]
const colorConfig = {
  dataFormat: 'ranges',
  actorField: 'actor',
  startField: 'start',
  endField: 'end',
  actorColor: (event, actor) => actor.data.team,
}

const descData = [
  { event: 0, actors: ['a', 'b', 'c'], description: 'First event' },
  { event: 1, actors: ['d', 'b', 'e'], description: 'Parallel event' },
  { event: 2, actors: ['d', 'a'],       description: 'Second event' },
]
const descConfig = {
  dataFormat: 'array',
  eventField: 'event',
  actorArrayField: 'actors',
  eventDescription: (event) => event.data.event + '. ' + event.data.description,
  marginRight: 150,
}

const urlData = [
  { event: 2002, actors: ['USA', 'Germany', 'Japan'],     description: 'Olympic Games' },
  { event: 2006, actors: ['Greece', 'Senegal', 'Nicaragua'], description: 'FIFA Cup' },
  { event: 2004, actors: ['Greece', 'Germany'],           description: 'UEFA Cup' },
]
const urlConfig = {
  dataFormat: 'array',
  eventField: 'event',
  actorArrayField: 'actors',
  url: (event, actor) =>
    'https://www.google.com/search?q=' +
    String(event.eventValue) + ' ' + event.data.description + ' ' + actor.actorID,
  marginRight: 100,
}
</script>

## Actor color

Callback returning a string or number used as the color category. The actual color comes from the selected [color scheme](#color-scheme).

```typescript
actorColor: (event: Event, actor: Actor) => string | number
// Default: (event, actor) => actor.actorID
```

<StorygramMount :data="colorData" :config="colorConfig" />

## Highlight

Array of actor IDs to highlight with a dashed overlay.

```typescript
highlight: string[]
// Default: []
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['a','c','d']},{event:2,actors:['c','d','e']},{event:3,actors:['e','f','g']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',highlight:['c','d']}"
/>

## Event description

Callback returning the text shown for the selected event. Adjust `marginRight` if descriptions are long.

```typescript
eventDescription: (event: Event) => string
// Default: event => String(event.eventValue)
```

<StorygramMount :data="descData" :config="descConfig" />

## URL (actor)

Callback returning a URL opened when clicking an actor label.

```typescript
url: (event: Event, actor: Actor) => string
// Default: Google search for event value + actor ID
```

<StorygramMount :data="urlData" :config="urlConfig" />

## Event URL

Callback returning a URL opened when clicking the event description at the top.

```typescript
eventUrl: (event: Event) => string
// Default: Google search for the event value
```

## Event value scaling

Blends between pure index spacing (`0`) and true event-value spacing (`1`).

```typescript
eventValueScaling: number  // 0.0 – 1.0
// Default: 0.9
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:2,actors:['e','b']},{event:10,actors:['d','b','e']},{event:12,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',eventValueScaling:0.9}"
/>

## Actor padding

Vertical spacing between actors.

```typescript
actorPadding: number
// Default: 30
```

## Event padding

Horizontal spacing between events.

```typescript
eventPadding: number
// Default: 40
```

## Line size

Stroke width for actor lines and group connectors.

```typescript
lineSize: number
// Default: 9
```

## Color scheme

Name of a [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic) scheme.

```typescript
colorScheme:
  | 'schemeCategory10' | 'schemeAccent' | 'schemeDark2'
  | 'schemePaired'     | 'schemePastel1' | 'schemePastel2'
  | 'schemeSet1'       | 'schemeSet2'    | 'schemeSet3'
// Default: 'schemeAccent'
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['d','b','e']},{event:2,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',colorScheme:'schemeSet1'}"
/>

## Margins

Space around the chart (top / bottom / left / right).

```typescript
marginTop: number     // Default: 50
marginBottom: number  // Default: 50
marginLeft: number    // Default: 50
marginRight: number   // Default: 50
```

## URL opens new tab

Whether clicking a URL opens it in a new tab.

```typescript
urlOpensNewTab: boolean
// Default: true
```

## Hidden actors tooltip title

Title shown in the tooltip listing hidden actors.

```typescript
hiddenActorsTooltipTitle: string
// Default: 'Hidden actors'
```
