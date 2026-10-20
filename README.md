# The Storygram

<p align="center">
    <img alt="The Storygram" src="https://raw.githubusercontent.com/FranzFlueckiger/Storygram/master/doc/src/components/storyGram_Blockbuster.png" width="749">
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/storygram"><img alt="npm" src="https://img.shields.io/npm/v/storygram"></a>
    <a href="https://github.com/FranzFlueckiger/Storygram/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/FranzFlueckiger/Storygram"></a>
</p>

The Storygram lets you explore and visualize **sequential groupings** in your data: every event consists of a group of actors, actors join and leave between events, and the Storygram draws the story of how these groups evolve over time.

Band lineups, governments, boards of directors, sports teams, conference participants — anywhere a changing set of entities is tied to a sequence of events, a Storygram turns it into an instantly readable chart.

<p align="center">
    <img alt="Political groups across elections" src="https://raw.githubusercontent.com/FranzFlueckiger/Storygram/master/doc/images/example-simple.png" width="280">
    <img alt="Marcus Miller collaborations 1995-2001" src="https://raw.githubusercontent.com/FranzFlueckiger/Storygram/master/doc/images/example-metason.png" width="640">
</p>

*Left: fictional political groups across four elections. Right: excerpt of bass player Marcus Miller's collaborations, 1995–2001 (data: [metason.net](https://metason.net/)).*

<p align="center">
    <img alt="Swiss Federal Council since 1983" src="https://raw.githubusercontent.com/FranzFlueckiger/Storygram/master/doc/images/example-bundesrat.png" width="1490">
</p>

*The Swiss Federal Council since 1983 — compact layout, actors colored by party.*

<p align="center">
    <img alt="Event bar extent comparison" src="https://raw.githubusercontent.com/FranzFlueckiger/Storygram/master/doc/images/example-event-bars.png" width="1200">
</p>

*Left: participant-only event bars (`extendEventBar: false`). Right: extended event bars (default), where connectors span unrelated actors to keep lines straighter.*

## Features

- **Three data formats** — array, table, and range-shaped input (see below)
- **Deterministic layout** — one optimized global actor order keeps lines straight; weighted group compaction can trade a little movement for tighter group connectors
- **Extended or participant-only event bars** — by default connectors span unrelated actors to keep lines straighter; set `extendEventBar: false` to cover only an event's participants; works in compact and expanded layouts
- **Powerful filtering** — filter by event value, group size, actor frequency, actor lifetime, must/should-contain queries, or fully custom callbacks
- **Compact & continuous modes** — keep actor blocks compact with movement-aware offsets, or keep actors visible between events
- **Fully configurable** — colors, highlights, margins, spacing, event labels, clickable URLs, tooltips, and d3 color schemes
- **TypeScript first** — complete typings for config and callbacks
- **Runs anywhere** — ESM, CommonJS, and a browser bundle usable via a `<script>` tag

## Installation

```sh
npm i storygram
```

## Quick start

```typescript
import { Storygram } from 'storygram'
import type { Config } from 'storygram'

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

const sg = new Storygram(data, config)
sg.draw()
```

JavaScript (CommonJS) works the same way:

```javascript
const { Storygram } = require('storygram')

const sg = new Storygram(data, {
  dataFormat: 'array',
  eventField: 'event',
  actorArrayField: 'actors',
})
sg.draw()
```

In the browser, the bundle exposes a global `Storygram` object:

```html
<div id="my-storygram"></div>

<script src="https://unpkg.com/storygram/dist/index.global.js"></script>
<script>
  const sg = new Storygram.Storygram(data, {
    dataFormat: 'array',
    eventField: 'event',
    actorArrayField: 'actors',
    root: '#my-storygram',
  })
  sg.draw()
</script>
```

## Data formats

The Storygram accepts data in three shapes:

| Format | Shape | Example |
| --- | --- | --- |
| `array` | one object per event with an array of actors | `{ event: 2010, actors: ['a', 'b'] }` |
| `table` | one object per event with actors in individual fields | `{ event: 2010, actor1: 'a', actor2: 'b' }` |
| `ranges` | one object per actor with start/end event values | `{ actor: 'a', start: 2001, end: 2010 }` |

Event values may be numbers or ISO date strings. Every field of your input objects stays available as `event.data` / `actor.data` for custom filtering, descriptions, and colors.

## Configuration highlights

```typescript
const config: Config = {
  // show events between 1995 and 2001, keep only actors
  // appearing in at least two events
  filterEventValue: [1995, 2001],
  filterGroupAmt: [2, undefined],

  // keep groups compact while minimizing line movement
  compact: true,

  // let event bars span unrelated actors to keep lines straighter (default)
  extendEventBar: true,

  // color actors by a data field
  actorColor: (event, actor) => actor.data.party,

  // custom event labels and click-through URLs
  eventDescription: event => event.data.title + ', ' + event.eventValue,
  url: (event, actor) => 'https://example.com/' + actor.actorID,
}
```

See the full documentation for all [data formats](https://storygram.netlify.com/data-import), [filters](https://storygram.netlify.com/filtering), [layout options](https://storygram.netlify.com/layout), and [advanced settings](https://storygram.netlify.com/advanced).

## Documentation & demo

- **Live demo:** [storygram-demo.netlify.com](https://storygram-demo.netlify.com/)
- **Documentation:** [storygram.netlify.com](https://storygram.netlify.com/)

## Development

```sh
pnpm install     # install dependencies (pnpm is enforced)
pnpm dev         # interactive playground (vite dev server)
pnpm test        # run the jest test suite
pnpm build       # build the npm package (tsc)
pnpm build_browser  # build the IIFE browser bundle (tsup)
```

## License

MIT — invented and developed by **Franz Flückiger** (ZHaW), with contributions from Stefan Guggisberg and Philipp Ackermann. See [LICENSE](LICENSE).
