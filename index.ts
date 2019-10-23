import vega from 'vega-embed';
import { KnotDiagram } from './src/KnotDiagram';
import { Data, Config } from './src/Types'
import { fromArray, fromRanges } from './src/PreProcessing';
import { DummyData } from './src/DummyData';

/**
* Testing
* Gui: Highlighting, Stability
* xScaling
*/

async function main() {
  const template = getTemplate3()
  const KD = new KnotDiagram(template[0], template[1])
  await vega("#viz", KD.spec);
}

function getTemplate1(): [Data, Config] {
  let data: Data = fromArray(DummyData.warData(), 'YEAR', ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'], (d => d ? d.split(', ') : []))
  let config: Config = {
    xDescription: (xLayer) => xLayer.data.YEAR + ', ' + xLayer.data.Location,
    mustContain: ['India'],
    filterXValue: [undefined, undefined],
    filterGroupSize: [1, undefined],
    filterGroupAmt: [2, undefined],
    xValueScaling: 0.5
  }
  return [data, config]
}

function getTemplate2(): [Data, Config] {
  let data: Data = fromArray(DummyData.testData(), 'id', ['a', 'b', 'c', 'd'])
  let config: Config = {
    xDescription: (xLayer) => String(xLayer.xValue),
    filterGroupAmt: [3, undefined]
  }
  return [data, config]
}

function getTemplate3(): [Data, Config] {
  let data: Data = fromRanges(DummyData.bundesraete(), 'Name', 'Amtsantritt', 'Amtsende')
  let config: Config = {
    xDescription: (xLayer) => 'Wahl im ' + String(xLayer.xValue),
    xValueScaling: 0.,
    continuousStart: false,
    continuousEnd: false,
    generationAmt: 10,
    populationSize: 10
  }
  return [data, config]
}

main()
