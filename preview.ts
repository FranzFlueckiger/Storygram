import vega from 'vega-embed';
import { KnotDiagram } from './src/index';
import { testRangeData, testArrayData, testTableData } from './test/testData';
import { Config } from './src/Types';
import { MetasonData, KurliData, WarData, BundesratData } from './previewData'

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
    filterGroupAmt: [3, undefined],
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
    centered: false,
    filterGroupAmt: [2, undefined]
  };
  const KD = new KnotDiagram(testTableData(), config);
  await vega('#viz', KD.getSpec());
}

async function drawPaperExample() {
  const data = [
    { politicians: ['y0', 'y1', 'y2'], election_nr: 1990 },
    { politicians: ['y0', 'y2', 'y3'], election_nr: 1992 },
    { politicians: ['y1', 'y2', 'y3'], election_nr: 1994 },
    { politicians: ['y1', 'y3', 'y4'], election_nr: 1996 },
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

/**
 * Data found on https://de.wikipedia.org/wiki/Liste_der_Mitglieder_des_Schweizerischen_Bundesrates#Bundesr%C3%A4te
 */
async function drawBundesratExample() {
  const data = BundesratData()
  const config: Config = {
    dataFormat: 'ranges',
    startField: 'Amtsantritt',
    endField: 'Amtsende',
    yField: 'Name',
    xDescription: (xLayer) => 'Bundesrat im Jahr ' + String(xLayer.xValue),
    centered: true,
    verbose: true
  };
  const KD = new KnotDiagram(data, config);
  await vega('#viz', KD.getSpec());
}

/**
 * Data found on https://www.prio.org/Data/Armed-Conflict/
 */
async function drawWarData() {
  const data = WarData()
  const config: Config = {
    dataFormat: 'table',
    xField: 'YEAR',
    yFields: ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'],
    xDescription: (xLayer) => 'War in ' + xLayer.data.Location + ', ' + String(xLayer.xValue),
    filterGroupAmt: [2, undefined],
    //filterCustomX: (xLayer) => xLayer.data.Int > 8,
    splitFunction: (ys) => ys.split(', '),
    shouldContain: ['Russia (Soviet Union)'],
    generationAmt: 100,
    populationSize: 100
  };
  const KD = new KnotDiagram(data, config);
  await vega('#viz', KD.getSpec());
}

async function drawMetasonKD() {
  const data = MetasonData()
  const config: Config = {
    dataFormat: 'array',
    xField: 'year',
    yArrayField: 'participants',
    filterGroupAmt: [2, undefined],
    filterGroupSize: [3, 6],
    filterXValue: [1988, 1995],
    filterCustomX: (xLayer) => {
      const name: string = xLayer.data.releaseName
      return !name.includes('compilation') &&
        !name.toLowerCase().includes('best of') &&
        !name.toLowerCase().includes('collection') &&
        !name.toLowerCase().includes('greatest hits') &&
        !name.toLowerCase().includes('super hits') &&
        !name.toLowerCase().includes('remaster')
    },
    generationAmt: 100,
    xValueScaling: 0,
    xDescription: (xLayer) => xLayer.data.releaseName + ", " + xLayer.data.year,
  }
  const KD = new KnotDiagram(data, config);
  await vega('#viz', KD.getSpec());
}

async function drawKurliKD() {
  const data = KurliData()
  const config: Config = {
    dataFormat: 'array',
    xField: 'date',
    yArrayField: 'collocs',
    xValueScaling: 0,
    verbose: true
  }
  const KD = new KnotDiagram(data, config);
  await vega('#viz', KD.getSpec());
}

drawKurliKD();
