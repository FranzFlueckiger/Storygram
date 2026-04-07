# Installation

Welcome to the Storygram documentation!

## TypeScript

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

## JavaScript (CommonJS)

```javascript
const { Storygram } = require('storygram')

const data = [
  { event: 1, actors: ['a', 'b', 'c'] },
  { event: 2, actors: ['d', 'b', 'e'] },
  { event: 3, actors: ['d', 'a'] },
]

const config = {
  dataFormat: 'array',
  eventField: 'event',
  actorArrayField: 'actors',
}

const sg = new Storygram(data, config)
sg.draw()
```

## Embedding in an HTML page

The browser bundle exposes the library as a global `Storygram` object.

```html
<body>
  <div id="my-storygram"></div>

  <script src="https://unpkg.com/storygram/dist/index.global.js"></script>
  <script>
    const data = [
      { event: 1, actors: ['a', 'b', 'c'] },
      { event: 2, actors: ['d', 'b', 'e'] },
      { event: 3, actors: ['d', 'a'] },
    ]
    const config = {
      dataFormat: 'array',
      eventField: 'event',
      actorArrayField: 'actors',
      root: '#my-storygram',
    }
    const sg = new Storygram.Storygram(data, config)
    sg.draw()
  </script>
</body>
```

The library appends an `<svg>` for the chart and a `<div>` for the tooltip into the element selected by `root`.
