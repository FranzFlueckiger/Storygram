import {Data, Event, Actors, Actor} from './Types';

interface inferredEvent {
  eventValue: number | string | undefined,
  eventXValue: number,
  type: "index" | "number" | 'datestring' | 'numberstring'
}

function inferActorID(rawActor: any) {
  return String(rawActor)
}

function inferEventValue(rawEvent: any, eventField: string | 'self' | undefined, index: number): inferredEvent | undefined {
  if(!eventField && eventField != 'self') {
    console.warn('Event field not found, using index (' + index + 'instead.')
    return {eventValue: index, eventXValue: index, type: 'index'}
  }
  else {
    let eventValue = rawEvent
    if(eventField != 'self' && eventField in rawEvent) {
      eventValue = rawEvent[eventField]
    }
    if(typeof eventValue === "number") {
      return {eventValue: eventValue, eventXValue: eventValue, type: 'number'}
    } else if(typeof eventValue === "string") {
      let eventXValue = Number(eventValue)
      if(!Number.isNaN(eventXValue)) {
        return {eventValue: eventValue, eventXValue, type: 'numberstring'}
      }
      eventXValue = Date.parse(eventValue)
      if(Number.isNaN(eventXValue)) {
        console.error("Event value " + rawEvent + ', ' + eventValue + " at index " + index + " couldn't be parsed as number or date.")
      }
      return {eventValue: eventValue, eventXValue, type: 'datestring'}
    } else {
      console.error("Event value " + rawEvent + ', ' + eventValue + " at index " + index + " can't be inferred.")
      return undefined
    }
  }
}

/**
 * This function prepares the data for the processing from a
 * JSON object array containing two range fields. It ignores
 * undefined and null values. This form of input contains no additional
 * information of the events except for the id.
 */
function fromRanges<T extends Record<string, unknown>>(
  data: T[],
  actorField: string,
  fromField: string,
  toField: string
): Data {
  const rawEvents: Map<number, inferredEvent> = new Map();
  const actors: Actors = new Map();
  data.forEach((d, i) => {
    const from = inferEventValue(d, fromField, i)
    const to = inferEventValue(d, toField, i)
    if(from) rawEvents.set(from.eventXValue, from);
    if(to) rawEvents.set(to.eventXValue, to);
    const dActorField = d[actorField];
    if(typeof dActorField != 'string') {
      console.warn(`Value of actorField (${dActorField}) of actor nr. ${i} should be of type string.`);
    }
    actors.set(inferActorID(dActorField), new Actor(String(dActorField), d));
  });
  const sortedEvents = Array.from(rawEvents).sort((a, b) => a[0] - b[0]).filter(d => d);
  const events: Event[] = sortedEvents.map((rawEvent, i) => {
    const event = new Event(rawEvent[1].eventValue, rawEvent[0], {});
    data.forEach((d) => {
      const from = inferEventValue(d, fromField, i);
      const to = inferEventValue(d, toField, i);
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
  return {events, actors};
}

/**
 * This function prepares the data for the processing from a
 * JSON object array. It removes duplicates in groups and ignores
 * undefined and null values. This form of input contains no additional
 * information of the actors except for the id.
 */
function fromTable(
  inputData: Record<string, number>[],
  actorFields: string[],
  eventField?: string,
  splitFunction?: (arg: string) => string[]
): Data {
  return processEventsFirst('table', inputData, actorFields, eventField, splitFunction);
}

function fromArray(
  inputData: Record<string, number>[],
  actorField: string,
  eventField?: string,
  splitFunction?: (arg: string) => string[]
): Data {
  return processEventsFirst('array', inputData, actorField, eventField, splitFunction);
}

function processEventsFirst(
  format: 'table' | 'array',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputData: Record<string, any>[],
  actorField: string | string[],
  eventField?: string,
  splitFunction?: ((arg: string) => string[]) | undefined
) {
  let data: Array<Record<string, any> & inferredEvent> = inputData.reduce<Record<string, any> & inferredEvent>((arr, event, i) => {
    let moment = inferEventValue(event, eventField, i)
    if(moment) {
      arr.push([event, moment])
    }
    return arr
  }, [])
  data.sort((a, b) => a[1].eventXValue - b[1].eventXValue);
  const actors: Actors = new Map();
  const events: Event[] = data.map((rawEvent, i) => {
    let event = new Event(rawEvent[1].eventValue, rawEvent[1].eventXValue, rawEvent[0]);
    if(format === 'table') {
      event.group = extractActorsFromTable(rawEvent[0], actorField as string[], splitFunction);
    }
    if(format === 'array') {
      event.group = extractActorsFromArray(rawEvent[0] as Record<string, string[]>, actorField as string, splitFunction);
    }
    event.group = event.group.map(rawActor => {
      let actor = actors.get(rawActor);
      if(!actor) {
        // create the y object
        actor = new Actor(rawActor, {});
      }
      actor.layers.push(event);
      actors.set(rawActor, actor);
      return rawActor;
    });
    return event;
  });
  return {events, actors};
}

function extractActorsFromTable(
  event: Record<string, string>,
  actorFields: string[],
  splitFunction: ((arg: string) => string[]) | undefined
): string[] {
  return [
    ...Array.from(
      actorFields.reduce<Set<string>>((acc, actorField) => {
        if(event[actorField]) {
          if(splitFunction) {
            splitFunction(event[actorField]).forEach(p => {
              if(p) {
                acc.add(p);
              }
            });
          } else {
            acc.add(event[actorField]);
          }
        }
        return acc;
      }, new Set())
    ),
  ];
}

function extractActorsFromArray(
  event: Record<string, string[]>,
  actorField: string,
  splitFunction: ((arg: string) => string[]) | undefined
): string[] {
  if(actorField in event) {
    return [
      ...Array.from(
        event[actorField].reduce<Set<string>>((acc: Set<string>, rawActor: string) => {
          if(rawActor) {
            if(splitFunction) {
              splitFunction(rawActor).forEach(splitActor => {
                if(splitActor) {
                  acc.add(splitActor);
                }
              });
            } else {
              acc.add(rawActor);
            }
          }
          return acc;
        }, new Set())
      ),
    ];
  }
  return [];
}

export {fromTable, fromRanges, fromArray};
