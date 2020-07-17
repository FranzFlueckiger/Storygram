import {MetasonData, BundesratData} from './previewData'
import { Config, Storygram } from 'storygram';
import { Actor, Event } from 'storygram/dist/Types';

/**
 * Data found on https://www.metason.net/
 */
function drawMetasonSD() {
  const data = MetasonData()
  const config: Config = {
    dataFormat: 'array',
    eventField: 'release_year',
    actorArrayField: 'participants',
    eventDescription: (event: Event) => event.data.release_title + ", " + event.data.release_year,
    filterEventValue: [1995, 2001],
    filterGroupAmt: [2, undefined]
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
    eventField: 'release_year',
    actorArrayField: 'participants',
    filterGroupAmt: [3, undefined],
    filterEventValue: [2008, 2018],
    eventValueScaling: 0.7,
    eventDescription: (event: Event) => event.data.release_title + ", " + event.data.release_year,
    filterEventCustom: (event: Event) => {
      const name: string = event.data.release_title as string
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

function drawBundesratExample() {
  const data = BundesratData
  const config: Config = {
    dataFormat: 'ranges',
    startField: 'Gewaehlt',
    endField: 'Zuruecktritt',
    actorField: 'Name',
    eventDescription: (event: Event) => 'Bundesrat im Jahr ' + String(event.eventValue),
    actorColor: (event: Event, actor: Actor) => actor.data.Partei as string,
    compact: true,
    verbose: true,
    eventValueScaling: 0.002,
    filterEventValue: [undefined, '1998-11-03']
  };
  const SD = new Storygram(data, config);
  SD.draw()
}

drawBundesratExample()
