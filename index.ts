import vega from 'vega-embed';
import { KnotDiagram } from './src/KnotDiagram';
import { DummyData } from './src/DummyData'
import { Config } from './src/Types'

/**
* Advanced Filtering (groupAmt, interactedWith + depth)
* Artistnet Data
* Bug with single rect
* Describe
*/

async function main() {
  let config: Config = {
    xField: 'YEAR',
    yFields: ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'],
    splitFunction: (d => d ? d.split(', ') : []),
    xDescription: (xLayer) => xLayer.xValue + ', ' + xLayer.data.Location,
    xValue: [1992, 1998],
    groupSize: [4, undefined],
  }
  const data = DummyData.warData()
  const KD = new KnotDiagram(data, config)
  await vega("#viz", KD.spec);
}

main();
