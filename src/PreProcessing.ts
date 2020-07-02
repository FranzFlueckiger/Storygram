import {Data, Event, Actors, Actor, InferredEvent} from './Types';

function inferActorID(rawActor: any) {
  return String(rawActor)
}

function inferEventValue(rawEvent: any, eventField: string | undefined, index: number): InferredEvent | undefined {
  if(!eventField) {
    console.warn('Event field not found, skipping.', rawEvent)
    return undefined
  }
  else {
    let eventValue = rawEvent
    if(eventField in rawEvent) {
      eventValue = rawEvent[eventField]
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
      }
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
function processActorsFirst(
  data: any[],
  actorField: string,
  fromField: string,
  toField: string
): Data {
  const rawEvents: Map<number, InferredEvent> = new Map();
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
  const events: Event[] = remapEventsFromActors(sortedEvents, data, actorField, fromField, toField, actors)
  return {events, actors};
}

function remapEventsFromActors(
  sortedEvents: [number, InferredEvent][],
  data: any[],
  actorField: string,
  fromField: string,
  toField: string,
  actors: Actors
): Event[] {
  return sortedEvents.map((rawEvent, i) => {
    const event = new Event(rawEvent![1].eventValue, rawEvent[0], {});
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
}

/**
 * This function prepares the data for the processing from a
 * JSON object array. It removes duplicate actors and ignores
 * undefined and null values. This form of input contains no additional
 * information of the actors except for the id.
 */
function processEventsFirst(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputData: Record<string, any>[],
  actorField: string | string[],
  splitFunction: ((arg: string) => string[]) | ((arg: string[]) => string[]),
  eventField?: string
) {
  let data = inputData
    .reduce<Array<[Record<string, any>, InferredEvent]>>((arr, event, i: number) => {
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
  return [
    ...Array.from(
      actorFields.reduce<Set<string>>((acc, actorField) => {
        if(event[actorField]) {
          if(splitFunction) {
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
  ];
}

export {processActorsFirst, processEventsFirst, inferEventValue, inferActorID};
