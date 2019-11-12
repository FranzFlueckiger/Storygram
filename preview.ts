import vega from 'vega-embed';
import { KnotDiagram } from './src/index';
import { testRangeData,testArrayData, testTableData } from './test/testData';
import { Config } from './src/Types';

async function drawRangeKD() {
  const config: Config = {
    dataFormat: 'ranges',
    yField: 'id',
    startField: 'from',
    endField: 'to',
    continuousStart: false,
    continuousEnd: false
  };
  const KD = new KnotDiagram(testRangeData(), config);
  await vega('#viz', KD.getSpec());
}

async function drawArrayKD() {
  const config: Config = {
    dataFormat: 'array',
    yArrayField: 'a',
    xField: 'id',
    continuousStart: false,
    continuousEnd: false,
    centered: false
  };
  const KD = new KnotDiagram(testArrayData(), config);
  await vega('#viz', KD.getSpec());
}

async function drawTableKD() {
  const config: Config = {
    dataFormat: 'table',
    yFields: ['a', 'b', 'c', 'd'],
    xField: 'id',
    continuousStart: false,
    continuousEnd: false,
    filterGroupAmt: [2, undefined]
  };
  const KD = new KnotDiagram(testTableData(), config);
  await vega('#viz', KD.getSpec());
}

async function drawPaperExample() {
  const data = [
    { politicians: ['y0', 'y1', 'y2'], election_nr: 0 },
    { politicians: ['y0', 'y2', 'y3'], election_nr: 1},
    { politicians: ['y1', 'y2', 'y3'], election_nr: 2 },
    { politicians: ['y1', 'y3', 'y4'], election_nr: 3 },
  ];
  const config: Config = {
    dataFormat: 'array',
    yArrayField: 'politicians',
    xField: 'election_nr',
    continuousStart: false,
    continuousEnd: false
  };
  const KD = new KnotDiagram(data, config);
  await vega('#viz', KD.getSpec());
}

drawArrayKD();
