import Storygram from '../src/Storygram';
import {Config} from '../src/Types';
import {testArrayData, testTableData, testRangeData} from './testData';

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
