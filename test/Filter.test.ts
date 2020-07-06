import {filter} from '../src/Filter';
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
