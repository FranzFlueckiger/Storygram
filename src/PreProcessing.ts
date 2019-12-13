import { Data, EventData, Event, YData as ActorData, Actor } from './Types';

function inferEventValues () {

}

/**
 * This function prepares the data for the processing from a
 * JSON object array containing two range fields. It ignores
 * undefined and null values. This form of input contains no additional
 * information of the events except for the id.
 */
function fromRanges<T extends Record<string, unknown>> (
  data: T[],
  actorField: string,
  fromField: string,
  toField: string
): Data {
  const rawEvents: Set<number> = new Set();
  const actors: ActorData = new Map();
  data.forEach( ( d, i ) => {
    const dFromField = d[ fromField ];
    if ( typeof dFromField === 'number' ) {
      rawEvents.add( dFromField );
    } else {
      console.warn( `Value of fromField (${ dFromField }) of actor nr. ${ i } should be of type number.` );
    }
    const dToField = d[ toField ];
    if ( typeof dToField === 'number' ) {
      rawEvents.add( dToField );
    } else {
      console.warn( `Value of toField (${ dToField }) of actor nr. ${ i } should be of type number.` );
    }
    const dActorField = d[ actorField ];
    if ( typeof dActorField != 'string' ) {
      console.warn( `Value of actorField (${ dActorField }) of actor nr. ${ i } should be of type string.` );
    }
    actors.set( String( dActorField ), new Actor( String( dActorField ), d ) );
  } );
  const sortedEvents: number[] = Array.from( rawEvents ).sort( ( a, b ) => a - b );
  const events: EventData = sortedEvents.map( rawEvent => {
    const event = new Event( rawEvent, {} );
    data.forEach( d => {
      const dFromField = d[ fromField ];
      const dToField = d[ toField ];
      if (
        ( ( typeof dFromField === 'number' && dFromField <= rawEvent ) || !dFromField ) &&
        ( ( typeof dToField === 'number' && dToField >= rawEvent ) || !dToField )
      ) {
        const actorID = String(d[actorField]);
        event.group.push(actorID);
        const actor = actors.get(actorID) as Actor;
        actor.layers.push(event);
        actors.set(actorID, actor);
      }
    } );
    return event;
  } );
  return { events, actors };
}

/**
 * This function prepares the data for the processing from a
 * JSON object array. It removes duplicates in groups and ignores
 * undefined and null values. This form of input contains no additional
 * information of the actors except for the id.
 */
function fromTable (
  inputData: Record<string, number>[],
  actorFields: string[],
  eventField?: string,
  splitFunction?: ( arg: string ) => string[]
): Data {
  return processXFirst( 'table', inputData, actorFields, eventField, splitFunction );
}

function fromArray (
  inputData: Record<string, number>[],
  actorField: string,
  eventField?: string,
  splitFunction?: ( arg: string ) => string[]
): Data {
  return processXFirst( 'array', inputData, actorField, eventField, splitFunction );
}

function processXFirst (
  format: 'table' | 'array',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputData: Record<string, any>[],
  actorField: string | string[],
  eventField?: string,
  splitFunction?: ( ( arg: string ) => string[] ) | undefined
) {
  inputData.sort( ( a, b ) => ( eventField ? a[ eventField ] - b[ eventField ] : -1 ) );
  const actors: ActorData = new Map();
  const events: EventData = inputData.map( ( rawEvent, i ) => {
    let event: Event;
    if ( eventField && eventField in rawEvent ) {
      event = new Event( rawEvent[ eventField ], rawEvent );
    } else {
      event = new Event( i, rawEvent );
      console.warn( 'xField not found on layer ' + i + ', using index instead.', rawEvent );
    }
    event.id = i;
    if ( format === 'table' ) {
      event.group = extractActorsFromTable( rawEvent, actorField as string[], splitFunction );
    }
    if ( format === 'array' ) {
      event.group = extractActorsFromArray( rawEvent as Record<string, string[]>, actorField as string, splitFunction );
    }
    event.group = event.group.map( rawActor => {
      let actor = actors.get( rawActor );
      if ( !actor ) {
        // create the y object
        actor = new Actor( rawActor, {} );
      }
      actor.layers.push( event );
      actors.set( rawActor, actor );
      return rawActor;
    } );
    return event;
  } );
  return { events, actors };
}

function extractActorsFromTable (
  event: Record<string, string>,
  actorFields: string[],
  splitFunction: ( ( arg: string ) => string[] ) | undefined
): string[] {
  return [
    ...Array.from(
      actorFields.reduce<Set<string>>( ( acc, actorField ) => {
        if ( event[ actorField ] ) {
          if ( splitFunction ) {
            splitFunction( event[ actorField ] ).forEach( p => {
              if ( p ) {
                acc.add( p );
              }
            } );
          } else {
            acc.add( event[ actorField ] );
          }
        }
        return acc;
      }, new Set() )
    ),
  ];
}

function extractActorsFromArray (
  event: Record<string, string[]>,
  actorField: string,
  splitFunction: ( ( arg: string ) => string[] ) | undefined
): string[] {
  if ( actorField in event ) {
    return [
      ...Array.from(
        event[ actorField ].reduce<Set<string>>( ( acc: Set<string>, rawActor: string ) => {
          if ( rawActor ) {
            if ( splitFunction ) {
              splitFunction( rawActor ).forEach( splitActor => {
                if ( splitActor ) {
                  acc.add( splitActor );
                }
              } );
            } else {
              acc.add( rawActor );
            }
          }
          return acc;
        }, new Set() )
      ),
    ];
  }
  return [];
}

export { fromTable, fromRanges, fromArray };
