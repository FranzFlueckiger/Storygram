import vega from 'vega-embed';
import { KnotDiagram } from './src/KnotDiagram';
import { Config } from './src/Types'
import { DummyData } from './src/DummyData';

/**
* Testing
* Gui: Highlighting, Stability
* xScaling
*/

async function main() {
  const template = getTemplate1()
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
    // mustContain: ['Yugoslavia (Serbia)'],
    filterXValue: [1992, 1998],
    filterGroupSize: [4, undefined],
    filterGroupAmt: [4, undefined],
  }
  return [DummyData.warData(), config]
}

function getTemplate2(): [any[], Config] {
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a',
    xDescription: (xLayer) => String(xLayer.xValue),
    filterGroupAmt: [3, undefined],
    continuousStart: false,
    continuousEnd: false,
    centered: false
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
    continuousEnd: false,
  }
  return [DummyData.bundesraete(), config]
}

main()
