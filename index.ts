import vega from 'vega-embed';
import { KnotDiagram } from './src/KnotDiagram';
import { Data, Config } from './src/Types'
import { fromTable } from './src/PreProcessing';
import { DummyData } from './src/DummyData';

/**
* Testing
* Gui: Highlighting, Stability
* xScaling
*/

async function main() {
  const template = getTemplate3()
  const KD = new KnotDiagram(template[1])
  KD.setData(template[0])
  KD.getSpec()
  await vega("#viz", KD.spec);
}

function getTemplate1(): [any[], Config] {
  let config: Config = {
    dataFormat: 'table',
    xField: 'YEAR', 
    yField: ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'], 
    splitFunction: (d => d ? d.split(', ') : []),
    xDescription: (xLayer) => xLayer.data.YEAR + ', ' + xLayer.data.Location,
    mustContain: ['Senegal'],
    filterXValue: [undefined, undefined],
    filterGroupSize: [1, undefined],
    filterGroupAmt: [2, undefined]
  }
  return [DummyData.warData(), config]
}

function getTemplate2(): [any[], Config] {
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a',
    xDescription: (xLayer) => String(xLayer.xValue),
    filterGroupAmt: [3, undefined]
  }
  return [DummyData.testData(), config]
}

function getTemplate3(): [any[], Config] {
  let config: Config = {
    dataFormat: 'ranges',
    yField: 'Name', 
    startField: 'Amtsantritt', 
    endField: 'Amtsende',
    xDescription: (xLayer) => 'Wahl im ' + String(xLayer.xValue),
    continuousStart: false,
    continuousEnd: false
  }
  return [DummyData.bundesraete(), config]
}

main()
