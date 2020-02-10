import {Storygram} from '../src/index';
import {testRangeData, testArrayData, testTableData} from '../test/testData';
import {Config} from '../src/Types';
import {MetasonData, KurliData, WarData, BundesratData, BlockBusterdata, deNationalElf, chNationalElfFrauen} from './previewData'

function drawRangeSD() {
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'id',
    startField: 'from',
    endField: 'to',
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
    compact: false,
    verbose: true
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

/**
 * Data found on https://www.metason.net/
 */
function drawMetasonNarrowSD() {
  const data = MetasonData()
  const config: Config = {
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

function drawKurliSD() {
  const data = KurliData()
  const config: Config = {
    dataFormat: 'array',
    eventField: 'date',
    actorArrayField: 'collocs',
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
    startField: 'Amtsbeginn',
    endField: 'Amtsende',
    actorField: 'Name',
    eventDescription: (event) => 'Bundesrat im Jahr ' + String(event.eventValue),
    strokeColor: (event, actor) => actor.data.Partei as string,
    compact: true,
    eventValueScaling: 0.00000000002,
  };
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

function drawBlockbusterData() {
  const data = BlockBusterdata()
  const config: Config = {
    dataFormat: 'array',
    actorArrayField: 'people',
    eventField: 'release_date',
    eventDescription: (l) => l.data.original_title + ' (' + l.data.vote_average + '/10)' as string,
    filterGroupAmt: [2, undefined],
    //filterEventValue: ['1 Jan 1990', '1 Jan 2010'],
    shouldContain: ['Leonardo DiCaprio', 'James Cameron'],
    eventValueScaling: 0.00000000005,
    url: (event, actor) => 'https://www.google.ch/search?q=' + String(event.data.original_title) + ' ' + actor.actorID,
    verbose: true
  };
  const SD = new Storygram(data, config);
  SD.draw()
}

function drawNarrowBlockbusterData() {
  const data = BlockBusterdata()
  const config: Config = {
    dataFormat: 'array',
    actorArrayField: 'people',
    eventField: 'release_date',
    eventDescription: (l) => l.data.original_title + ' (' + l.data.vote_average + '/10)' as string,
    filterGroupAmt: [5, undefined],
    shouldContain: ['Leonardo DiCaprio', 'Tim Burton'],
    eventValueScaling: 0.00000000005,
    url: (event, actor) => 'https://www.google.ch/search?q=' + String(event.data.original_title) + ' ' + actor.actorID,
    verbose: true
  };
  const SD = new Storygram(data, config);
  SD.draw()
}

function drawNationalElfDEData() {
  const data = deNationalElf()
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'Name',
    startField: 'von',
    endField: 'bis',
    filterGroupAmt: [8, undefined],
    compact: true,
    verbose: true
  };
  const SD = new Storygram(data, config);
  SD.draw()
}

function drawNationalElfCHFrauenData() {
  const data = chNationalElfFrauen()
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'Name',
    startField: 'Debüt',
    endField: 'letzter Einsatz',
    compact: true,
    eventValueScaling: 0.0000000001,
    verbose: true
  };
  const SD = new Storygram(data, config);
  SD.draw()
}

drawBlockbusterData()

setTimeout(function() {
  drawNarrowBlockbusterData()
}, 1000);
