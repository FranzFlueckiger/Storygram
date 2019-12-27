import { Config, Data, Actor } from './Types';

function filter(data: Data, config: Config): Data {
  if (config.verbose) console.log('Before Filtering', data);
  // filter xs
  data = filterEvents(data, config);
  // filter ys
  data = filterActors(data, config);
  // remove x points without y points
  data.events = data.events.filter(layer => layer.group.length > 0);
  setLifeCycles(data, config);
  if (config.verbose) console.log('After Filtering', data);
  return data;
}

function isInRange(p: number, range: [number | undefined, number | undefined] | undefined): boolean {
  return range ? (range[0] ? p >= range[0] : true) && (range[1] ? p <= range[1] : true) : true;
}

function filterEvents(data: Data, config: Config): Data {
  const actors: Map<string, Actor> = new Map();
  const events = data.events.filter(event => {
    let contains = true;
    if (config.mustContain && config.mustContain.length) {
      contains = config.mustContain.every(query => {
        return event.group.includes(query);
      });
    }
    if (config.shouldContain && config.shouldContain.length) {
      contains = config.shouldContain.some(query => {
        return event.group.includes(query);
      });
    }
    let isCustomEventFilter = false;
    if (config.filterEventCustom) {
      isCustomEventFilter = !config.filterEventCustom(event);
    }
    if (
      !isInRange(event.group.length, config.filterGroupSize) ||
      !isInRange(event.eventXValue, config.filterEventValue) ||
      event.group.length == 0 ||
      !contains ||
      isCustomEventFilter
    ) {
      event.isHidden = true;
      return false;
    } else {
      event.group.forEach(actorID => {
        const actor = data.actors.get(actorID)!;
        actors.set(actorID, actor);
      });
      return true;
    }
  });
  return { events, actors };
}

function filterActors(data: Data, config: Config): Data {
  Array.from(data.actors).forEach(actorMap => {
    const actor: Actor = actorMap[1];
    const visibleEvents = actor.layers ? actor.layers.filter(event => !event.isHidden) : [];
    let isCustomActorFilter = false;
    if (config.filterActorCustom) {
      isCustomActorFilter = !config.filterActorCustom(actor);
    }
    if (
      // check if y value has an xValue lifetime in the allowed range
      !isInRange(visibleEvents[visibleEvents.length - 1].eventXValue - visibleEvents[0].eventXValue, config.filterEventValueLifeTime) ||
      // check if y value has an amount of non-hidden groups in the allowed range
      !isInRange(visibleEvents.length, config.filterGroupAmt) ||
      actor.isHidden ||
      isCustomActorFilter
    ) {
      actor.isHidden = true;
      actor.layers.forEach(l => {
        l.group = l.group.filter(a => a != actor.actorID);
        l.hiddenActors.push(actor.actorID);
      });
    }
  });
  return data;
}

function setLifeCycles(data: Data, config: Config) {
  data.events.forEach((xLayer, i) => {
    xLayer.index = i;
  });
  Array.from(data.actors).forEach(yMap => {
    const y: Actor = yMap[1];
    const activeLayers = y.layers ? y.layers.filter(l => !l.isHidden) : [];
    if (!y.isHidden) {
      // check where to add the y-point
      if (config.dataFormat === 'ranges' && !config.startField) {
        data.events[0].add.push(y.actorID);
      } else {
        data.events[activeLayers[0].index!].add.push(y.actorID);
      }
      if (config.dataFormat === 'ranges' && !config.endField) {
        data.events[data.events.length - 1].remove.push(y.actorID);
      } else {
        data.events[activeLayers[activeLayers.length - 1].index!].remove.push(y.actorID);
      }
    }
  });
}

export { filter, filterEvents as filterX, filterActors as filterY, isInRange, setLifeCycles };
