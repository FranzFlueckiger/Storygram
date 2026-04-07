# Filtering

Events and actors can be filtered in several ways.

## Event value filter

Hides all events outside the given range.

```typescript
filterEventValue: [number | string | undefined, number | string | undefined]
// Default: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['d','b','e']},{event:2,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',filterEventValue:[1,undefined]}"
/>

## Group size filter

Hides events that have fewer or more actors than the given range.

```typescript
filterGroupSize: [number | undefined, number | undefined]
// Default: [0, Number.MAX_SAFE_INTEGER]
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['d','b','e']},{event:2,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',filterGroupSize:[3,undefined]}"
/>

## Grouping amount filter

Hides actors that appear in fewer or more events than the given range. Hidden actors are accessible via the red badge shown on top of the group.

```typescript
filterGroupAmt: [number | undefined, number | undefined]
// Default: [0, Number.MAX_SAFE_INTEGER]
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['d','b','e']},{event:2,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',filterGroupAmt:[2,undefined]}"
/>

## Event lifetime filter

Hides actors whose first-to-last event span is outside the given range.

```typescript
filterEventValueLifeTime: [number | string | undefined, number | string | undefined]
// Default: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
```

## Must-contain filter

Hides events that do not include **all** of the specified actors.

```typescript
mustContain: string[]
// Default: []
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['d','b','e']},{event:2,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',mustContain:['a','b']}"
/>

## Should-contain filter

Hides events that include **none** of the specified actors.

```typescript
shouldContain: string[]
// Default: []
```

<StorygramMount
  :data="[{event:0,actors:['a','b','c']},{event:1,actors:['d','b','e']},{event:2,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',shouldContain:['c','e']}"
/>

<script setup>
const customEventData = [
  { event: 0, actors: ['a', 'b', 'c'], type: 'one' },
  { event: 1, actors: ['d', 'b', 'e'], type: 'two' },
  { event: 2, actors: ['d', 'a'],       type: 'one' },
]
const customEventConfig = {
  dataFormat: 'array',
  eventField: 'event',
  actorArrayField: 'actors',
  filterEventCustom: (event) => event.data.type === 'one',
}

const customActorData = [
  { actor: 'a', start: 0, end: 2, type: 'one' },
  { actor: 'b', start: 1, end: 2, type: 'one' },
  { actor: 'c', start: 0, end: 3, type: 'two' },
]
const customActorConfig = {
  dataFormat: 'ranges',
  actorField: 'actor',
  startField: 'start',
  endField: 'end',
  filterActorCustom: (actor) => actor.data.type === 'one',
}
</script>

## Custom event filter

A callback returning `true` keeps the event; `false` hides it.

```typescript
filterEventCustom: (event: Event) => boolean
// Default: () => true
```

<StorygramMount :data="customEventData" :config="customEventConfig" />

## Custom actor filter

A callback returning `true` keeps the actor; `false` hides it.

```typescript
filterActorCustom: (actor: Actor) => boolean
// Default: () => true
```

<StorygramMount :data="customActorData" :config="customActorConfig" />
