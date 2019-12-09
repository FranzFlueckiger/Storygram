import vega from 'vega-embed';
import { KnotDiagram } from './src/index';
import { testRangeData, testArrayData, testTableData } from './test/testData';
import { Config } from './src/Types';
import { MetasonData, KurliData, WarData, BundesratData } from './previewData'

async function drawRangeKD() {
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'id',
    startField: 'from',
    endField: 'to',
    continuousStart: false,
    continuousEnd: false
  };
  const KD = new KnotDiagram(testRangeData(), config);
  KD.draw()
}

async function drawArrayKD() {
  const config: Config = {
    dataFormat: 'array',
    actorArrayField: 'a',
    eventField: 'id',
    filterGroupAmt: [3, undefined],
    continuousStart: false,
    continuousEnd: false,
    compact: false
  };
  const KD = new KnotDiagram(testArrayData(), config);
  KD.draw()
}

async function drawTableKD() {
  const config: Config = {
    dataFormat: 'table',
    actorFields: ['a', 'b', 'c', 'd'],
    eventField: 'id',
    continuousStart: false,
    continuousEnd: false,
    compact: false,
    filterGroupAmt: [2, undefined]
  };
  const KD = new KnotDiagram(testTableData(), config);
  KD.draw()
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
    actorArrayField: 'politicians',
    eventField: 'election_nr',
    continuousStart: false,
    continuousEnd: false
  };
  const KD = new KnotDiagram(data, config);
  KD.draw()
}

/**
 * Data found on https://www.prio.org/Data/Armed-Conflict/
 */
async function drawWarData() {
  const data = WarData()
  const config: Config = {
    dataFormat: 'table',
    eventField: 'YEAR',
    actorFields: ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'],
    eventDescription: (xLayer) => 'War in ' + xLayer.data.Location + ', ' + String(xLayer.eventValue),
    filterGroupAmt: [2, undefined],
    actorSplitFunction: (ys) => ys.split(', '),
    shouldContain: ['Russia (Soviet Union)'],
    highlight: ['Afghanistan', 'Russia (Soviet Union)'],
    generationAmt: 100,
    populationSize: 100
  };
  const KD = new KnotDiagram(data, config);
  KD.draw()
}

async function drawMetasonKD() {
  const data = MetasonData()
  const config: Config = {
    dataFormat: 'array',
    eventField: 'year',
    actorArrayField: 'participants',
    filterGroupAmt: [2, undefined],
    filterGroupSize: [3, undefined],
    filterEventValue: [1988, 1993],
    filterEventCustom: (xLayer) => {
      const name: string = xLayer.data.releaseName
      return !name.includes('compilation') &&
        !name.toLowerCase().includes('best of') &&
        !name.toLowerCase().includes('collection') &&
        !name.toLowerCase().includes('greatest hits') &&
        !name.toLowerCase().includes('super hits') &&
        !name.toLowerCase().includes('remaster')
    },
    generationAmt: 100,
    populationSize: 100,
    eventValueScaling: 0,
    verbose: true,
    eventDescription: (xLayer) => xLayer.data.releaseName + ", " + xLayer.data.year,
  }
  const KD = new KnotDiagram(data, config);
  KD.draw()
}

async function drawKurliKD() {
  const data = KurliData()
  const config: Config = {
    dataFormat: 'array',
    eventField: 'date',
    actorArrayField: 'collocs',
    verbose: true,
    compact: true
  }
  const KD = new KnotDiagram(data, config);
  KD.draw()
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
    actorField: 'Name',
    eventDescription: (xLayer) => 'Bundesrat im Jahr ' + String(xLayer.eventValue),
    strokeColor: (x, y) => y.data.Partei,
    compact: true,
  };
  const KD = new KnotDiagram(data, config);
  KD.draw()
}

drawBundesratExample();
