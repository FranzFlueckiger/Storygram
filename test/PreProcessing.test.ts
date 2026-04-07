import Storygram from '../src/Storygram';
import {Config} from '../src/Types';
import {testArrayData, testTableData, testRangeData} from './testData';
import {inferEventValue, inferEventValuesFromFilter, processActorsFirst, processEventsFirst} from '../src/PreProcessing';

test('from array', () => {
  const config: Config = {
    dataFormat: 'array',
    eventField: 'id',
    actorArrayField: 'a',
  };
  const KD = new Storygram(testArrayData(), config);
  expect(KD.data.events.length).toEqual(10);
  const layer4 = "{\"eventValue\":\"4\",\"eventXValue\":4,\"data\":{\"a\":[\"zf\",\"lf\",\"bf\"],\"id\":\"4\"},\"switch\":[],\"isHidden\":false,\"add\":[\"lf\"],\"remove\":[\"lf\"],\"group\":[\"zf\",\"lf\",\"bf\"],\"state\":[],\"hiddenActors\":[],\"index\":4}"
  expect(JSON.stringify(KD.data.events[4])).toEqual(layer4);
  const yFF = "{\"actorID\":\"ff\",\"data\":{},\"isHidden\":false,\"layers\":[{\"eventValue\":\"1\",\"eventXValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":\"1\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\",\"ef\",\"af\",\"zf\"],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenActors\":[],\"index\":1},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenActors\":[],\"index\":2},{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":false,\"add\":[\"cf\",\"pf\"],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenActors\":[],\"index\":3},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"pf\"],\"group\":[\"pf\",\"ff\"],\"state\":[],\"hiddenActors\":[],\"index\":7},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\",\"af\",\"cf\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[],\"index\":8}]}"
  expect(KD.data.actors.size).toEqual(10);
  expect(JSON.stringify(KD.data.actors.get('ff'))).toEqual(yFF);
});

test('from table', () => {
  const config: Config = {
    dataFormat: 'table',
    eventField: 'id',
    actorFields: ['a', 'b', 'c', 'd'],
  };
  const KD = new Storygram(testTableData(), config);
  expect(KD.data.events.length).toEqual(10);
  const layer4 = "{\"eventValue\":14,\"eventXValue\":14,\"data\":{\"id\":14,\"a\":\"zf\",\"b\":\"lf\",\"c\":\"bf\"},\"switch\":[],\"isHidden\":false,\"add\":[\"lf\"],\"remove\":[\"lf\"],\"group\":[\"zf\",\"lf\",\"bf\"],\"state\":[],\"hiddenActors\":[],\"index\":4}"
  expect(JSON.stringify(KD.data.events[4])).toEqual(layer4);
  const yFF = "{\"actorID\":\"ff\",\"data\":{},\"isHidden\":false,\"layers\":[{\"eventValue\":11,\"eventXValue\":11,\"data\":{\"id\":11,\"a\":\"ff\",\"b\":\"ef\",\"c\":\"af\",\"d\":\"zf\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\",\"ef\",\"af\",\"zf\"],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenActors\":[],\"index\":1},{\"eventValue\":12,\"eventXValue\":12,\"data\":{\"id\":12,\"a\":\"ff\",\"b\":\"gf\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenActors\":[],\"index\":2},{\"eventValue\":13,\"eventXValue\":13,\"data\":{\"id\":13,\"a\":\"ff\",\"b\":\"ef\",\"c\":\"cf\",\"d\":\"pf\"},\"switch\":[],\"isHidden\":false,\"add\":[\"cf\",\"pf\"],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenActors\":[],\"index\":3},{\"eventValue\":17,\"eventXValue\":17,\"data\":{\"id\":17,\"a\":\"pf\",\"b\":\"ff\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"pf\"],\"group\":[\"pf\",\"ff\"],\"state\":[],\"hiddenActors\":[],\"index\":7},{\"eventValue\":18,\"eventXValue\":18,\"data\":{\"id\":18,\"a\":\"ff\",\"b\":\"gf\",\"c\":\"cf\",\"d\":\"af\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\",\"af\",\"cf\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[],\"index\":8}]}"
  expect(KD.data.actors.size).toEqual(10);
  expect(JSON.stringify(KD.data.actors.get('ff'))).toEqual(yFF);
});

test('from ranges', () => {
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'c',
    startField: 'from',
    endField: 'to',
    filterGroupAmt: [3, undefined],
    highlight: ['kf', 'af']
  };
  const KD = new Storygram(testRangeData(), config);
  expect(KD.data.events.length).toEqual(10);
  const layer4 = "{\"eventValue\":4,\"eventXValue\":4,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[\"cf\"],\"remove\":[],\"group\":[\"af\",\"af\",\"cf\",\"bf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":4}"
  expect(JSON.stringify(KD.data.events[4])).toEqual(layer4);
  const yFF = "{\"actorID\":\"gf\",\"data\":{\"id\":7,\"from\":7,\"to\":8,\"c\":\"gf\"},\"isHidden\":true,\"layers\":[{\"eventValue\":7,\"eventXValue\":7,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"kf\",\"kf\"],\"state\":[],\"hiddenActors\":[\"gf\"],\"index\":7},{\"eventValue\":8,\"eventXValue\":8,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"kf\"],\"group\":[\"af\",\"kf\",\"kf\"],\"state\":[],\"hiddenActors\":[\"gf\"],\"index\":8}]}"
  expect(KD.data.actors.size).toEqual(6);
  expect(JSON.stringify(KD.data.actors.get('gf'))).toEqual(yFF);
});

// ─── inferEventValue ─────────────────────────────────────────────────────────

describe('inferEventValue', () => {
  function freshConfig(): Config {
    return {dataFormat: 'array', actorArrayField: 'a'};
  }

  test('parses a raw number and sets inferredEventType to "number"', () => {
    const config = freshConfig();
    const result = inferEventValue(42, 'value', 0, config);
    expect(result).toEqual({eventValue: 42, eventXValue: 42});
    expect(config.inferredEventType).toBe('number');
  });

  test('parses a numeric string and sets inferredEventType to "numberstring"', () => {
    const config = freshConfig();
    const result = inferEventValue({id: '42'}, 'id', 0, config);
    expect(result).toEqual({eventValue: '42', eventXValue: 42});
    expect(config.inferredEventType).toBe('numberstring');
  });

  test('parses a date string and sets inferredEventType to "datestring"', () => {
    const config = freshConfig();
    const result = inferEventValue({date: '2021-06-15'}, 'date', 0, config);
    expect(result).toBeDefined();
    expect(result!.eventValue).toBe('2021-06-15');
    expect(typeof result!.eventXValue).toBe('number');
    expect(config.inferredEventType).toBe('datestring');
  });

  test('uses the array index when inferredEventType is "index"', () => {
    const config = freshConfig();
    config.inferredEventType = 'index';
    const result = inferEventValue({label: 'foo'}, 'label', 5, config);
    // eventValue is the extracted field value ('foo'), eventXValue is the index (5)
    expect(result).toEqual({eventValue: 'foo', eventXValue: 5});
  });

  test('returns undefined and warns when eventField is falsy', () => {
    const config = freshConfig();
    const result = inferEventValue({id: 1}, undefined, 0, config);
    expect(result).toBeUndefined();
  });

  test('uses a pre-set inferredEventType without re-inferring', () => {
    const config = freshConfig();
    config.inferredEventType = 'number';
    // '99' would normally infer as numberstring, but type is already fixed
    const result = inferEventValue(99, 'v', 0, config);
    expect(result).toEqual({eventValue: 99, eventXValue: 99});
    expect(config.inferredEventType).toBe('number');
  });

  test('returns undefined when value cannot be parsed under the current type', () => {
    const config = freshConfig();
    config.inferredEventType = 'number';
    const result = inferEventValue({v: 'not-a-number'}, 'v', 0, config);
    expect(result).toBeUndefined();
  });
});

// ─── inferEventValuesFromFilter ───────────────────────────────────────────────

describe('inferEventValuesFromFilter', () => {
  test('returns numeric range as-is for number type', () => {
    const config: Config = {
      dataFormat: 'array', actorArrayField: 'a',
      inferredEventType: 'number',
      filterEventValue: [10, 100],
    };
    const [lo, hi] = inferEventValuesFromFilter(config);
    expect(lo).toBe(10);
    expect(hi).toBe(100);
  });

  test('converts date-string bounds to timestamps for datestring type', () => {
    const config: Config = {
      dataFormat: 'array', actorArrayField: 'a',
      inferredEventType: 'datestring',
      filterEventValue: ['2020-01-01', '2021-01-01'],
    };
    const [lo, hi] = inferEventValuesFromFilter(config);
    expect(lo).toBe(Date.parse('2020-01-01'));
    expect(hi).toBe(Date.parse('2021-01-01'));
  });

  test('uses sentinel dates when bounds are undefined for datestring type', () => {
    const config: Config = {
      dataFormat: 'array', actorArrayField: 'a',
      inferredEventType: 'datestring',
      filterEventValue: [undefined, undefined],
    };
    const [lo, hi] = inferEventValuesFromFilter(config);
    expect(lo).toBe(Date.parse('1700-01-02'));
    expect(hi).toBe(Date.parse('4000-12-29'));
  });

  test('converts numeric string bounds for numberstring type', () => {
    const config: Config = {
      dataFormat: 'array', actorArrayField: 'a',
      inferredEventType: 'numberstring',
      filterEventValue: ['5', '50'],
    };
    const [lo, hi] = inferEventValuesFromFilter(config);
    expect(lo).toBe(5);
    expect(hi).toBe(50);
  });
});

// ─── processActorsFirst ───────────────────────────────────────────────────────

describe('processActorsFirst', () => {
  function rangeConfig(overrides = {}) {
    // Use Storygram to get a fully-resolved FullConfig, then override fields for this test
    const sg = new Storygram(testRangeData(), {
      dataFormat: 'ranges', actorField: 'c', startField: 'from', endField: 'to',
    });
    return {...sg.config, ...overrides} as typeof sg.config;
  }

  test('creates one actor per unique actorField value', () => {
    const {actors} = processActorsFirst(testRangeData(), rangeConfig() as any);
    // testRangeData has actors: kf, af, cf, bf, gf, zf
    expect(actors.size).toBe(6);
    expect(actors.has('kf')).toBe(true);
  });

  test('creates events at each unique start/end boundary', () => {
    const {events} = processActorsFirst(testRangeData(), rangeConfig() as any);
    expect(events.length).toBe(10);
  });

  test('each event group contains all actors active at that timestamp', () => {
    const data = [
      {actor: 'a', from: 0, to: 2},
      {actor: 'b', from: 1, to: 3},
    ];
    const cfg = rangeConfig({actorField: 'actor', startField: 'from', endField: 'to', inferredEventType: undefined});
    const {events} = processActorsFirst(data, cfg as any);
    // event at t=1: both 'a' (0–2) and 'b' (1–3) are active
    const at1 = events.find(e => e.eventXValue === 1)!;
    expect(at1.group).toContain('a');
    expect(at1.group).toContain('b');
  });

  test('actor data object is preserved on the Actor', () => {
    const row = {actor: 'x', from: 0, to: 5, extra: 'hello'};
    const cfg = rangeConfig({actorField: 'actor', startField: 'from', endField: 'to', inferredEventType: undefined});
    const {actors} = processActorsFirst([row], cfg as any);
    expect(actors.get('x')!.data).toEqual(row);
  });
});

// ─── processEventsFirst ───────────────────────────────────────────────────────

describe('processEventsFirst', () => {
  test('sorts events by eventXValue', () => {
    const data = [
      {id: 3, actors: ['c']},
      {id: 1, actors: ['a']},
      {id: 2, actors: ['b']},
    ];
    const config: Config = {dataFormat: 'array', actorArrayField: 'actors', eventField: 'id', inferredEventType: 'number'};
    const {events} = processEventsFirst(data, ['actors'], (a: string[]) => a, config, 'id');
    expect(events.map(e => e.eventXValue)).toEqual([1, 2, 3]);
  });

  test('deduplicates actors within a single event', () => {
    const data = [{id: 1, a: 'x', b: 'x'}];
    const config: Config = {dataFormat: 'table', actorFields: ['a', 'b'], eventField: 'id', inferredEventType: 'number'};
    const {events} = processEventsFirst(data, ['a', 'b'], (s: string) => [s], config, 'id');
    expect(events[0].group).toEqual(['x']);
  });

  test('creates actors map with one entry per unique actor', () => {
    const data = [
      {id: 1, actors: ['a', 'b']},
      {id: 2, actors: ['b', 'c']},
    ];
    const config: Config = {dataFormat: 'array', actorArrayField: 'actors', eventField: 'id', inferredEventType: 'number'};
    const {actors} = processEventsFirst(data, ['actors'], (a: string[]) => a, config, 'id');
    expect(actors.size).toBe(3);
    expect(actors.has('a')).toBe(true);
    expect(actors.has('b')).toBe(true);
    expect(actors.has('c')).toBe(true);
  });

  test('each actor tracks the events it appears in via layers', () => {
    const data = [
      {id: 1, actors: ['a', 'b']},
      {id: 2, actors: ['b']},
    ];
    const config: Config = {dataFormat: 'array', actorArrayField: 'actors', eventField: 'id', inferredEventType: 'number'};
    const {actors} = processEventsFirst(data, ['actors'], (a: string[]) => a, config, 'id');
    expect(actors.get('a')!.layers.length).toBe(1);
    expect(actors.get('b')!.layers.length).toBe(2);
  });

  test('skips events whose eventField cannot be parsed', () => {
    const data = [
      {id: 1, actors: ['a']},
      {id: 'bad', actors: ['b']},  // 'bad' can't be parsed as number
    ];
    const config: Config = {dataFormat: 'array', actorArrayField: 'actors', eventField: 'id', inferredEventType: 'number'};
    const {events} = processEventsFirst(data, ['actors'], (a: string[]) => a, config, 'id');
    expect(events.length).toBe(1);
  });
});
