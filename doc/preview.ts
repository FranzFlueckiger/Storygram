import {Storygram} from '../src/index';
import {testRangeData, testArrayData, testTableData} from '../test/testData';
import {Config} from '../src/Types';
import {MetasonData} from './previewData'

function drawRangeSD() {
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'id',
    startField: 'from',
    endField: 'to',
    filterGroupAmt: [3, undefined],
    highlight: ['kf', 'af']
  };
  const SD = new Storygram(testRangeData(), config);
  SD.draw()
}

function drawArraySD() {
  const config: Config = {
    dataFormat: 'array',
    actorArrayField: 'a',
    eventField: 'id',
    filterGroupAmt: [4, undefined],
    compact: false,
    verbose: true,
    highlight: ['ef']
  };
  const SD = new Storygram(testArrayData(), config);
  SD.draw()
} 

function drawTableSD() {
  const config: Config = {
    dataFormat: 'table',
    actorFields: ['a', 'b', 'c', 'd'],
    eventField: 'id',
    compact: false,
    filterGroupAmt: [2, undefined]
  };
  const SD = new Storygram(testTableData(), config);
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
    eventDescription: (event) => event.data.releaseName + ", " + event.data.year,
  }
  const SD = new Storygram(data, config);
  SD.draw()
}

/**
 * Data found on https://www.metason.net/
 */
function drawMetasonNarrowSD() {
  const data = MetasonData()
  const config: Config = {
    verbose: true,
    dataFormat: 'array',
    eventField: 'year',
    actorArrayField: 'participants',
    filterGroupAmt: [3, undefined],
    filterEventValue: [2008, 2018],
    eventValueScaling: 0.7,
    eventDescription: (event) => event.data.releaseName + ", " + event.data.year,
    filterEventCustom: (event) => {
      const name: string = event.data.releaseName as string
      return !name.includes('compilation') &&
        !name.toLowerCase().includes('best of') &&
        !name.toLowerCase().includes('collection') &&
        !name.toLowerCase().includes('greatest hits') &&
        !name.toLowerCase().includes('super hits') &&
        !name.toLowerCase().includes('remaster')
    }
  }
  const SD = new Storygram(data, config);
  SD.draw()
}

function drawPaperExample() {
  const data = [
    {politicians: ['y0', 'y1', 'y2'], election_nr: 1990},
    {politicians: ['y0', 'y2', 'y3'], election_nr: 1992},
    {politicians: ['y1', 'y2', 'y3'], election_nr: 1994},
    {politicians: ['y1', 'y3', 'y4'], election_nr: 1996},
  ];
  const config: Config = {
    dataFormat: 'array',
    actorArrayField: 'politicians',
    eventField: 'election_nr'
  };
  const SD = new Storygram(data, config);
  SD.draw()
}

drawArraySD()
 