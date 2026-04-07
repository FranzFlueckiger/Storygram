import {filterX, filterY, isInRange} from '../src/Filter';
import Storygram from '../src/Storygram';
import {Data, Config} from '../src/Types';
import {testArrayData} from './testData';

test('filter group size and amt', () => {
  const config: Config = {
    dataFormat: 'array',
    eventField: 'id',
    actorArrayField: 'a',
    filterGroupSize: [0, 2],
    filterGroupAmt: [2, 2],
  };
  const KD = new Storygram(testArrayData(), config);
  const newData: Data = KD.processedData;
  expect(newData.events.length).toEqual(2);
  const layersFF = "[{\"eventValue\":\"1\",\"eventXValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":\"1\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"gf\"],\"index\":0},{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\"],\"state\":[],\"hiddenActors\":[\"pf\"]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"pf\"],\"index\":1},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[\"gf\"]}]"
  expect(newData.actors.get('ff')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('ff')!.layers)).toEqual(layersFF);
  const layersGF = "[{\"eventValue\":\"0\",\"eventXValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"0\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"kf\"],\"state\":[],\"hiddenActors\":[\"gf\"]},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"gf\"],\"index\":0},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"pf\"]},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"kf\"],\"state\":[],\"hiddenActors\":[\"gf\"]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[\"gf\"]},{\"eventValue\":\"7\",\"eventXValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":\"7\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"zf\"],\"state\":[],\"hiddenActors\":[\"gf\"]}]"
  expect(newData.actors.get('gf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.actors.get('gf')!.layers)).toEqual(layersGF);
  const layersPF = "[{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\"],\"state\":[],\"hiddenActors\":[\"pf\"]},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"pf\"]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"pf\"],\"index\":1}]"
  expect(newData.actors.get('pf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.actors.get('pf')!.layers)).toEqual(layersPF);
});

test('filter XValue and XValue lifetime', () => {
  const config: Config = {
    dataFormat: 'array',
    eventField: 'id',
    actorArrayField: 'a',
    filterEventValueLifeTime: [1, 3],
    filterEventValue: [2, 4],
  };
  const KD = new Storygram(testArrayData(), config);
  const newData = KD.processedData;
  expect(newData.events.length).toEqual(2);
  const layersFF = "[{\"eventValue\":\"1\",\"eventXValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":\"1\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenActors\":[\"ef\",\"zf\"]},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"gf\"],\"index\":0},{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"ef\",\"cf\",\"pf\"],\"index\":1},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"pf\"]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"cf\"]}]"
  expect(newData.actors.get('ff')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('ff')!.layers)).toEqual(layersFF);
  const layersGF = "[{\"eventValue\":\"0\",\"eventXValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"0\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"kf\"],\"state\":[],\"hiddenActors\":[\"gf\",\"bf\"]},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"gf\"],\"index\":0},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"ef\",\"pf\"]},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"kf\"],\"state\":[],\"hiddenActors\":[\"gf\",\"bf\"]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"cf\"]},{\"eventValue\":\"7\",\"eventXValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":\"7\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenActors\":[\"gf\",\"ef\",\"zf\"]}]"
  expect(newData.actors.get('gf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.actors.get('gf')!.layers)).toEqual(layersGF);
  const layersEF = "[{\"eventValue\":\"1\",\"eventXValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":\"1\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenActors\":[\"ef\",\"zf\"]},{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"ef\",\"cf\",\"pf\"],\"index\":1},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"ef\",\"pf\"]},{\"eventValue\":\"7\",\"eventXValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":\"7\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenActors\":[\"gf\",\"ef\",\"zf\"]}]"
  expect(newData.actors.get('ef')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.actors.get('ef')!.layers)).toEqual(layersEF);
  const layersCF = "[{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"ef\",\"cf\",\"pf\"],\"index\":1},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"cf\"]}]"
  expect(newData.actors.get('cf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.actors.get('cf')!.layers)).toEqual(layersCF);
  const layersPF = "[{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"ef\",\"cf\",\"pf\"],\"index\":1},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"af\"],\"state\":[],\"hiddenActors\":[\"gf\",\"ef\",\"pf\"]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenActors\":[\"pf\"]}]"
  expect(newData.actors.get('pf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.actors.get('pf')!.layers)).toEqual(layersPF);
});

test('filter custom X filter', () => {
  const config: Config = {
    dataFormat: 'array',
    eventField: 'id',
    actorArrayField: 'a',
    filterEventCustom: event => Number(event.eventValue) % 2 === 0,
  };
  const KD = new Storygram(testArrayData(), config);
  const newData: Data = KD.processedData;
  expect(newData.events.length).toEqual(5);
  const layersFF = "[{\"eventValue\":\"1\",\"eventXValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":\"1\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenActors\":[],\"index\":1},{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[\"pf\"],\"remove\":[\"pf\"],\"group\":[\"pf\",\"ff\"],\"state\":[],\"hiddenActors\":[],\"index\":3},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[\"cf\",\"af\"],\"remove\":[\"gf\",\"ff\",\"cf\",\"af\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[],\"index\":4}]"
  expect(newData.actors.get('ff')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('ff')!.layers)).toEqual(layersFF);
  const layersGF = "[{\"eventValue\":\"0\",\"eventXValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"0\"},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\"],\"remove\":[\"kf\"],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":0},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenActors\":[],\"index\":1},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"gf\",\"ef\",\"af\",\"pf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[\"cf\",\"af\"],\"remove\":[\"gf\",\"ff\",\"cf\",\"af\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[],\"index\":4},{\"eventValue\":\"7\",\"eventXValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":\"7\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"gf\",\"zf\"],\"state\":[],\"hiddenActors\":[]}]"
  expect(newData.actors.get('gf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('gf')!.layers)).toEqual(layersGF);
  const layersCF = "[{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[\"cf\",\"af\"],\"remove\":[\"gf\",\"ff\",\"cf\",\"af\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[],\"index\":4}]"
  expect(newData.actors.get('cf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('cf')!.layers)).toEqual(layersCF);
});

test('filter custom Y filter', () => {
  const config: Config = {
    dataFormat: 'array',
    eventField: 'id',
    actorArrayField: 'a',
    filterActorCustom: actor => actor.layers.some(l => l.eventValue === '0'),
  };
  const KD = new Storygram(testArrayData(), config);
  const newData: Data = KD.processedData;
  expect(newData.events.length).toEqual(7);
  const layersGF = "[{\"eventValue\":\"0\",\"eventXValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"0\"},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":0},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenActors\":[\"ff\"],\"index\":1},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenActors\":[\"ef\",\"af\",\"pf\"],\"index\":3},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"kf\"],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":4},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenActors\":[\"ff\",\"af\",\"cf\"],\"index\":5},{\"eventValue\":\"7\",\"eventXValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":\"7\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"gf\"],\"group\":[\"gf\"],\"state\":[],\"hiddenActors\":[\"ef\",\"zf\"],\"index\":6}]"
  expect(newData.actors.get('gf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('gf')!.layers)).toEqual(layersGF);
  const layersBF = "[{\"eventValue\":\"0\",\"eventXValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"0\"},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":0},{\"eventValue\":\"4\",\"eventXValue\":4,\"data\":{\"a\":[\"zf\",\"lf\",\"bf\"],\"id\":\"4\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"bf\"],\"state\":[],\"hiddenActors\":[\"zf\",\"lf\"],\"index\":2},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"kf\"],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":4}]"
  expect(newData.actors.get('bf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('bf')!.layers)).toEqual(layersBF);
  const layersKF = "[{\"eventValue\":\"0\",\"eventXValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"0\"},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":0},{\"eventValue\":\"5\",\"eventXValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":\"5\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"kf\"],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenActors\":[],\"index\":4}]"
  expect(newData.actors.get('kf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.actors.get('kf')!.layers)).toEqual(layersKF);
  const layersFF = "[{\"eventValue\":1,\"eventXValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenActors\":[\"ff\",\"ef\",\"af\",\"zf\"]},{\"eventValue\":2,\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenActors\":[\"ff\"],\"index\":1},{\"eventValue\":3,\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenActors\":[\"ff\",\"ef\",\"cf\",\"pf\"]},{\"eventValue\":6,\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenActors\":[\"ff\",\"pf\"]},{\"eventValue\":6,\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenActors\":[\"ff\",\"af\",\"cf\"],\"index\":5}]"
  expect(newData.actors.get('ff')!.isHidden).toEqual(true);
  expect(newData.actors.get('pf')!.isHidden).toEqual(true);
});

// ─── isInRange ───────────────────────────────────────────────────────────────

describe('isInRange', () => {
  test('returns true when value is within range', () => {
    expect(isInRange(5, [1, 10])).toBe(true);
  });

  test('returns true at the inclusive lower bound', () => {
    expect(isInRange(1, [1, 10])).toBe(true);
  });

  test('returns true at the inclusive upper bound', () => {
    expect(isInRange(10, [1, 10])).toBe(true);
  });

  test('returns false when value is above the upper bound', () => {
    expect(isInRange(11, [1, 10])).toBe(false);
  });

  test('returns false when value is below the lower bound', () => {
    expect(isInRange(0, [1, 10])).toBe(false);
  });

  test('returns true when range is undefined', () => {
    expect(isInRange(5, undefined)).toBe(true);
  });

  test('returns true when upper bound is undefined', () => {
    expect(isInRange(9999, [1, undefined])).toBe(true);
  });

  test('lower bound of 0 is treated as "no minimum" (falsy shortcut in implementation)', () => {
    // The implementation uses `range[0] ? p >= range[0] : true`, so 0 is treated as absent
    expect(isInRange(-1, [0, 10])).toBe(true);
  });
});

// ─── filterX (filterEvents) ──────────────────────────────────────────────────

describe('filterX', () => {
  function buildData() {
    const sg = new Storygram(testArrayData(), {
      dataFormat: 'array', eventField: 'id', actorArrayField: 'a',
    });
    return {data: sg.data, config: sg.config};
  }

  test('hides events outside filterEventValue range', () => {
    const {data, config} = buildData();
    const filtered = filterX(data, {...config, filterEventValue: [2, 4], inferredEventType: 'numberstring'});
    filtered.events.forEach(e => {
      expect(e.eventXValue).toBeGreaterThanOrEqual(2);
      expect(e.eventXValue).toBeLessThanOrEqual(4);
    });
  });

  test('removes events whose group is smaller than filterGroupSize minimum', () => {
    const {data, config} = buildData();
    const filtered = filterX(data, {...config, filterGroupSize: [3, undefined]});
    filtered.events.forEach(e => expect(e.group.length).toBeGreaterThanOrEqual(3));
  });

  test('removes events whose group exceeds filterGroupSize maximum', () => {
    const {data, config} = buildData();
    const filtered = filterX(data, {...config, filterGroupSize: [undefined, 2]});
    filtered.events.forEach(e => expect(e.group.length).toBeLessThanOrEqual(2));
  });

  test('mustContain keeps only events that include all specified actors', () => {
    const {data, config} = buildData();
    const filtered = filterX(data, {...config, mustContain: ['ff', 'gf']});
    filtered.events.forEach(e => {
      expect(e.group).toContain('ff');
      expect(e.group).toContain('gf');
    });
  });

  test('shouldContain keeps only events that include at least one specified actor', () => {
    const {data, config} = buildData();
    const filtered = filterX(data, {...config, shouldContain: ['lf']});
    filtered.events.forEach(e => expect(e.group).toContain('lf'));
  });

  test('filterEventCustom removes events for which the predicate returns false', () => {
    const {data, config} = buildData();
    const filtered = filterX(data, {
      ...config,
      filterEventCustom: e => Number(e.eventValue) % 2 === 0,
    });
    filtered.events.forEach(e => expect(Number(e.eventValue) % 2).toBe(0));
  });
});

// ─── filterY (filterActors) ──────────────────────────────────────────────────

describe('filterY', () => {
  function buildFilteredData() {
    // Run filterX first so events have proper hidden flags, matching real usage
    const sg = new Storygram(testArrayData(), {
      dataFormat: 'array', eventField: 'id', actorArrayField: 'a',
    });
    const afterX = filterX(sg.data, sg.config);
    return {data: afterX, config: sg.config};
  }

  test('hides actors appearing in fewer events than filterGroupAmt minimum', () => {
    const {data, config} = buildFilteredData();
    const result = filterY(data, {...config, filterGroupAmt: [3, undefined]});
    Array.from(result.actors.values()).forEach(actor => {
      if (!actor.isHidden) {
        const visibleLayers = actor.layers.filter(l => !l.isHidden);
        expect(visibleLayers.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  test('filterActorCustom hides actors for which the predicate returns false', () => {
    const {data, config} = buildFilteredData();
    const result = filterY(data, {
      ...config,
      filterActorCustom: actor => actor.actorID === 'ff',
    });
    Array.from(result.actors.values()).forEach(actor => {
      if (actor.actorID !== 'ff') expect(actor.isHidden).toBe(true);
    });
    expect(result.actors.get('ff')!.isHidden).toBe(false);
  });

  test('hidden actors are removed from event groups and recorded in hiddenActors', () => {
    const {data, config} = buildFilteredData();
    const result = filterY(data, {
      ...config,
      filterActorCustom: actor => actor.actorID === 'ff',
    });
    // Every event group should only contain 'ff'
    result.actors.get('ff')!.layers.forEach(layer => {
      if (!layer.isHidden) {
        expect(layer.group.every(id => id === 'ff')).toBe(true);
      }
    });
  });
});

// ─── setLifeCycles ───────────────────────────────────────────────────────────

describe('setLifeCycles', () => {
  test('assigns sequential index to each visible event', () => {
    const sg = new Storygram(testArrayData(), {
      dataFormat: 'array', eventField: 'id', actorArrayField: 'a',
    });
    const processed = sg.processedData;
    processed.events.forEach((e, i) => expect(e.index).toBe(i));
  });

  test('first visible event for an actor has the actor in its add array', () => {
    const sg = new Storygram(testArrayData(), {
      dataFormat: 'array', eventField: 'id', actorArrayField: 'a',
    });
    const {processedData} = sg;
    Array.from(processedData.actors.values())
      .filter(a => !a.isHidden)
      .forEach(actor => {
        const firstLayer = actor.layers.find(l => !l.isHidden)!;
        expect(firstLayer.add).toContain(actor.actorID);
      });
  });

  test('last visible event for an actor has the actor in its remove array', () => {
    const sg = new Storygram(testArrayData(), {
      dataFormat: 'array', eventField: 'id', actorArrayField: 'a',
    });
    const {processedData} = sg;
    Array.from(processedData.actors.values())
      .filter(a => !a.isHidden)
      .forEach(actor => {
        const visibleLayers = actor.layers.filter(l => !l.isHidden);
        const lastLayer = visibleLayers[visibleLayers.length - 1];
        expect(lastLayer.remove).toContain(actor.actorID);
      });
  });
});
