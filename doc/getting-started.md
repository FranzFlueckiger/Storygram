# Getting Started

The Storygram lets you explore and visualize sequential groupings in your data.

The example below shows an excerpt of the career of bass player Marcus Miller. Data courtesy of [metason.net](https://metason.net/).

<script setup>
import { MetasonData } from './previewData'

const data = MetasonData()

const config = {
  dataFormat: 'array',
  eventField: 'release_year',
  actorArrayField: 'participants',
  eventDescription: event => event.data.release_title + ', ' + event.data.release_year,
  filterEventValue: [1995, 2001],
  filterGroupAmt: [2, undefined],
}
</script>

<StorygramMount :data="data" :config="config" />

The layout is computed with a deterministic optimizer that first chooses one global actor order. This keeps the base layout straight and crossing-free. A weighted per-event compaction pass may then move a few actors to shorten a group connector, but only when the saved span outweighs the configured movement cost.

## Bug Reports & Questions

The Storygram is MIT-licensed. Source and issue tracker: [github.com/FranzFlueckiger/Storygram](https://github.com/FranzFlueckiger/Storygram).

## Contributors

Invented and developed by Franz Flückiger (ZHaW).  
Many thanks to Stefan Guggisberg and Philipp Ackermann for their contributions.
