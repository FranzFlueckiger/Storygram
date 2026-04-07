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

The layout is computed with a deterministic **barycenter sweep** algorithm that minimises actor crossings — so the result is always stable.

## Bug Reports & Questions

The Storygram is MIT-licensed. Source and issue tracker: [github.com/FranzFlueckiger/Storygram](https://github.com/FranzFlueckiger/Storygram).

## Contributors

Invented and developed by Franz Flückiger (ZHaW).  
Many thanks to Stefan Guggisberg and Philipp Ackermann for their contributions.
