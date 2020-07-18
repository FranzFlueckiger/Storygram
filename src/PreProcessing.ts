import {Data, Event, Actors, Actor, InferredEvent, Config, RangeData, BaseConfig} from './Types';

function inferActorID(rawActor: any) {
  return String(rawActor)
}

function autoInferEventType(eventValue: any, index: number, config: Config) {
  switch('number') {
    case typeof parseNumber(eventValue):
      config.inferredEventType = 'number'
      break;
    case typeof parseNumberString(eventValue):
      config.inferredEventType = 'numberstring'
      break;
    case typeof parseDateString(eventValue):
      config.inferredEventType = 'datestring'
      break;
    case typeof parseIndex(eventValue, index):
      config.inferredEventType = 'index'
      break;
    default:
      break;
  }
}

function parseIndex(eventValue: any, index: number) {
  if(index) return index
}

function parseNumberString(eventValue: any) {
  let eventXValue = Number(eventValue)
  if(!Number.isNaN(eventXValue)) return eventXValue
}

function parseNumber(eventValue: any) {
  if(typeof eventValue === 'number') return eventValue
}

function parseDateString(eventValue: any) {
  let eventXValue = Date.parse(eventValue)
  if(!Number.isNaN(eventXValue)) return eventXValue
}

export function inferEventValuesFromFilter(config: Config): [number, number] {
  let firstVal = config.filterEventValue![0]
  let secondVal = config.filterEventValue![1];
  if (config.inferredEventType === 'datestring') {
    if (!firstVal || firstVal === Number.MIN_SAFE_INTEGER) firstVal = '1700-01-02'
    if (!secondVal || secondVal === Number.MAX_SAFE_INTEGER) secondVal = '4000-12-29'
    return [parseDateString(firstVal)!, parseDateString(secondVal)!]
  } else if (config.inferredEventType === 'numberstring') {
    if (typeof firstVal === 'string') firstVal = parseNumberString(firstVal)!
    if (typeof secondVal === 'string') secondVal = parseNumberString(secondVal)!
  }
  return [parseNumber(firstVal)!, parseNumber(secondVal)!]
}

export function inferEventValue(rawEvent: any, eventField: string | undefined, index: number, config: Config, fromRanges?: boolean): InferredEvent | undefined {
  if (!eventField) {
    console.warn('Event field ' + eventField + ' not found, skipping.', rawEvent)
    return undefined
  }
  else {
    let eventValue = rawEvent
    if (typeof rawEvent !== 'number' && eventField in rawEvent) {
      eventValue = rawEvent[eventField]
    }
    if(eventValue === null && fromRanges) return
    if (!config.inferredEventType) autoInferEventType(eventValue, index, config)
    let eventXValue;
    switch (config.inferredEventType) {
      case 'number':
        eventXValue = parseNumber(eventValue)
        if (typeof eventXValue === 'number') return { eventValue, eventXValue }
        else console.log("Event value couldn't be parsed as number.", rawEvent)
        break;
      case 'numberstring':
        eventXValue = parseNumberString(eventValue)
        if (typeof eventXValue === 'number') return { eventValue, eventXValue }
        else console.log("Event value couldn't be parsed as numberstring.", rawEvent)
        break;
      case 'datestring':
        eventXValue = parseDateString(eventValue)
        if (typeof eventXValue === 'number') return { eventValue, eventXValue }
        else console.log("Event value couldn't be parsed as datestring.", rawEvent)
        break;
      case 'index':
        eventXValue = parseIndex(eventValue, index)
        if (typeof eventXValue === 'number') return { eventValue, eventXValue }
        else console.log("Event value couldn't be parsed as index.", rawEvent)
        break;
      default:
        console.error("Event value can't be inferred on field " + eventField, rawEvent)
        break;
    }
  }
}

/**
 * This function prepares the data for the processing from a
 * JSON object array containing two range fields. It ignores
 * undefined and null values. This form of input contains no additional
 * information of the events except for the id.
 */
export function processActorsFirst(
  data: any[],
  config: BaseConfig & RangeData
): Data {
  const rawEvents: Map<number, InferredEvent> = new Map();
  const actors: Actors = new Map();
  const fromField = config.startField
  const toField = config.endField
  const actorField = config.actorField
  data.forEach((d, i) => {
    const from = inferEventValue(d, fromField, i, config, true)
    const to = inferEventValue(d, toField, i, config, true)
    if(from) rawEvents.set(from.eventXValue, from);
    if(to) rawEvents.set(to.eventXValue, to);
    const dActorField = d[actorField];
    if(typeof dActorField != 'string') {
      console.warn(`Value of actorField should be of type string.`, d);
    }
    actors.set(inferActorID(dActorField), new Actor(String(dActorField), d));
  });
  const sortedEvents = Array.from(rawEvents).sort((a, b) => a[0] - b[0]).filter(d => d);
  const events: Event[] = remapEventsFromActors(sortedEvents, data, actorField, fromField, toField, actors, config)
  return {events, actors};
}

function remapEventsFromActors(
  sortedEvents: [number, InferredEvent][],
  data: any[],
  actorField: string,
  fromField: string,
  toField: string,
  actors: Actors,
  config: Config
): Event[] {
  return sortedEvents.map((rawEvent, i) => {
    const event = new Event(rawEvent![1].eventValue, rawEvent[0], {});
    data.forEach((d) => {
      const from = inferEventValue(d, fromField, i, config);
      const to = inferEventValue(d, toField, i, config);
      if(
        ((!from || from.eventXValue <= rawEvent[0])) &&
        ((!to || to.eventXValue >= rawEvent[0]))
      ) {
        const actorID = String(d[actorField]);
        event.group.push(actorID);
        const actor = actors.get(actorID) as Actor;
        actor.layers.push(event);
        actors.set(actorID, actor);
      }
    });
    return event;
  });
}

/**
 * This function prepares the data for the processing from a
 * JSON object array. It removes duplicate actors and ignores
 * undefined and null values. This form of input contains no additional
 * information of the actors except for the id.
 */
export function processEventsFirst(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputData: Record<string, any>[],
  actorField: string | string[],
  splitFunction: ((arg: string) => string[]) | ((arg: string[]) => string[]),
  config: Config,
  eventField: string | undefined
) {
  let data = inputData
    .reduce<Array<[Record<string, any>, InferredEvent]>>((arr, event, i: number) => {
      let moment = inferEventValue(event, eventField, i, config)
      if(moment) {
        arr.push([event, moment])
      }
      return arr
    }, [])
  data.sort((a, b) => a[1].eventXValue - b[1].eventXValue);
  const actors: Actors = new Map();
  const events: Event[] = data.map((rawEvent, i) => {
    let event = new Event(rawEvent[1].eventValue, rawEvent[1].eventXValue, rawEvent[0]);
    event.group = extractActorsFromField(rawEvent[0], actorField as string[], splitFunction);
    event.group = remapEvent(event, actors)
    return event;
  });
  return {events, actors};
}

function remapEvent(event: Event, actors: Map<string, Actor>) {
  return event.group = event.group.map(rawActor => {
    let actor = actors.get(rawActor);
    if(!actor) {
      // create the y object
      actor = new Actor(rawActor, {});
    }
    actor.layers.push(event);
    actors.set(rawActor, actor);
    return rawActor;
  });
}

function extractActorsFromField(
  event: Record<string, string | string[]>,
  actorFields: string[],
  splitFunction: ((arg: string) => string[]) | ((arg: string[]) => string[])
): string[] {
  return actorFields && actorFields.length ? [
    ...Array.from(
      actorFields.reduce<Set<string>>((acc, actorField) => {
        if(event[actorField]) {
          //@ts-ignore
          if(splitFunction && splitFunction(event[actorField]) && Array.isArray(splitFunction(event[actorField]))) {
            // @ts-ignore
            splitFunction(event[actorField])
              .forEach((p: string) => p ? acc.add(p) : undefined);
          } else {
            // @ts-ignore
            acc.add(event[actorField]);
          }
        }
        return acc;
      }, new Set())
    ),
  ] : [];
}
