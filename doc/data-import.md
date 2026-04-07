# Importing Data

The Storygram accepts three data formats.

## Array

Each object contains an event value (number or date string) and an array of actor IDs.

```typescript
const data = [
  { event: 1, actors: ['a', 'b', 'c'] },
  { event: 2, actors: ['d', 'b', 'e'] },
  { event: 3, actors: ['d', 'a'] },
]

const config: Config = {
  dataFormat: 'array',
  eventField: 'event',
  actorArrayField: 'actors',
}
```

Every field of each object is available on `event.data`, enabling custom filtering and descriptions.

<StorygramMount
  :data="[{event:1,actors:['a','b','c']},{event:2,actors:['d','b','e']},{event:3,actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors'}"
/>

## Table

Each object has an event value and actor IDs spread across individual fields.

```typescript
const data = [
  { event: 1, actor1: 'a', actor2: 'b', actor3: 'c' },
  { event: 2, actor1: 'd', actor2: 'b', actor3: 'e' },
  { event: 3, actor1: 'd', actor2: 'a' },
]

const config: Config = {
  dataFormat: 'table',
  eventField: 'event',
  actorFields: ['actor1', 'actor2', 'actor3'],
}
```

<StorygramMount
  :data="[{event:1,actor1:'a',actor2:'b',actor3:'c'},{event:2,actor1:'d',actor2:'b',actor3:'e'},{event:3,actor1:'d',actor2:'a'}]"
  :config="{dataFormat:'table',eventField:'event',actorFields:['actor1','actor2','actor3']}"
/>

## Range

Each object describes one actor's active period via start and end values. A missing `startField` means the actor is present from the first event; a missing `endField` means it continues until the last.

```typescript
const data = [
  { actor: 'a', end: 1 },
  { actor: 'a', start: 3 },
  { actor: 'b', end: 2 },
  { actor: 'c', end: 1 },
  { actor: 'd', start: 2, end: 3 },
  { actor: 'e', start: 2, end: 2 },
]

const config: Config = {
  dataFormat: 'ranges',
  actorField: 'actor',
  startField: 'start',
  endField: 'end',
}
```

Every field of each object is available on `actor.data`, enabling [custom actor filtering](/filtering#custom-actor-filter).

<StorygramMount
  :data="[{actor:'a',end:1},{actor:'a',start:3},{actor:'b',end:2},{actor:'c',end:1},{actor:'d',start:2,end:3},{actor:'e',start:2,end:2}]"
  :config="{dataFormat:'ranges',actorField:'actor',startField:'start',endField:'end'}"
/>

## Date strings

Pass ISO date strings in the event field. They are parsed with `Date.parse()` — see [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) for supported formats.

```typescript
const data = [
  { event: '2019-04-01', actors: ['a', 'b', 'c'] },
  { event: '2019-04-02', actors: ['d', 'b', 'e'] },
  { event: '2019-04-03', actors: ['d', 'a'] },
]
```

<StorygramMount
  :data="[{event:'2019-04-01',actors:['a','b','c']},{event:'2019-04-02',actors:['d','b','e']},{event:'2019-04-03',actors:['d','a']}]"
  :config="{dataFormat:'array',eventField:'event',actorArrayField:'actors',marginRight:80,marginBottom:70}"
/>

## Actor split callback

If each actor field contains multiple actors joined by a delimiter, use `actorSplitFunction` to split them.

```typescript
const config: Config = {
  dataFormat: 'table',
  eventField: 'event',
  actorFields: ['actors1', 'actors2', 'actors3'],
  actorSplitFunction: (input) => input.split(','),
}
```

<script setup>
const splitData = [
  { event: 0, actors1: 'a,z', actors2: 'b,y', actors3: 'c' },
  { event: 1, actors1: 'd,x', actors2: 'b',   actors3: 'e,y' },
  { event: 2, actors1: 'd,k,z', actors2: 'a,y,x' },
]
const splitConfig = {
  dataFormat: 'table',
  eventField: 'event',
  actorFields: ['actors1', 'actors2', 'actors3'],
  actorSplitFunction: (input) => input.split(','),
}
</script>

<StorygramMount :data="splitData" :config="splitConfig" />
