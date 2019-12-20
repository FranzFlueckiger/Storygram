import vega from 'vega-embed';
import { Storygram } from './src/index';
import { testRangeData, testArrayData, testTableData } from './test/testData';
import { Config } from './src/Types';
import { MetasonData, KurliData, WarData, BundesratData } from './previewData'

function drawRangeSD() {
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'id',
    startField: 'from',
    endField: 'to',
    continuousStart: false,
    continuousEnd: false
  };
  const SD = new Storygram(testRangeData(), config);
  SD.draw()
}

function drawArraySD() {
  const config: Config = {
    dataFormat: 'array',
    actorArrayField: 'a',
    eventField: 'id',
    filterGroupAmt: [3, undefined],
    continuousStart: false,
    continuousEnd: false,
    compact: false
  };
  const SD = new Storygram(testArrayData(), config);
  SD.draw()
}

function drawTableSD() {
  const config: Config = {
    dataFormat: 'table',
    actorFields: ['a', 'b', 'c', 'd'],
    eventField: 'id',
    continuousStart: false,
    continuousEnd: false,
    compact: false,
    filterGroupAmt: [2, undefined]
  };
  const SD = new Storygram(testTableData(), config);
  SD.draw()
}

/**
 * Data found on https://www.prio.org/Data/Armed-Conflict/
 */
function drawWarData() {
  const data = WarData()
  const config: Config = {
    dataFormat: 'table',
    eventField: 'YEAR',
    actorFields: ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'],
    eventDescription: (event) => 'War in ' + event.data.Location + ', ' + String(event.eventValue),
    filterGroupAmt: [2, undefined],
    actorSplitFunction: (ys) => ys.split(', '),
    shouldContain: ['Russia (Soviet Union)'],
    highlight: ['Afghanistan', 'Russia (Soviet Union)'],
    generationAmt: 100,
    populationSize: 100
  };
  const SD = new Storygram(data, config);
  SD.draw()
}

/**
 * Data found on https://www.metason.net/
 */
function drawMetasonSD() {
  const data = MetasonData()
  const config: Config = {
    dataFormat: 'array',
    eventField: 'year',
    actorArrayField: 'participants',
    filterGroupAmt: [2, undefined],
    filterGroupSize: [3, undefined],
    filterEventValue: [1988, 1993],
    eventDescription: (event) => event.data.releaseName + ", " + event.data.year,
    filterEventCustom: (event) => {
      const name: string = event.data.releaseName
      return !name.includes('compilation') &&
        !name.toLowerCase().includes('best of') &&
        !name.toLowerCase().includes('collection') &&
        !name.toLowerCase().includes('greatest hits') &&
        !name.toLowerCase().includes('super hits') &&
        !name.toLowerCase().includes('remaster')
    },
    verbose: true,
    eventValueScaling: 0,
    generationAmt: 100,
    populationSize: 100
  }
  const SD = new Storygram(data, config);
  SD.draw()
}

function drawKurliSD() {
  const data = KurliData()
  const config: Config = {
    dataFormat: 'array',
    eventField: 'date',
    actorArrayField: 'collocs',
    verbose: true,
    compact: true
  }
  const SD = new Storygram(data, config);
  SD.draw()
}

/**
 * Data found on https://de.wikipedia.org/wiki/Liste_der_Mitglieder_des_Schweizerischen_Bundesrates#Bundesr%C3%A4te
 */
function drawBundesratExample() {
  const data = BundesratData()
  const config: Config = {
    dataFormat: 'ranges',
    startField: 'Amtsantritt',
    endField: 'Amtsende',
    actorField: 'Name',
    eventDescription: (event) => 'Bundesrat im Jahr ' + String(event.eventValue),
    strokeColor: (event, actor) => actor.data.Partei,
    compact: true,
  };
  const SD = new Storygram(data, config);
  SD.draw()
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
  const SD = new Storygram(data, config);
  SD.draw()
}

drawMetasonSD();
