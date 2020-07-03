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
  const layer4 = "{\"eventValue\":\"4\",\"eventXValue\":4,\"data\":{\"a\":[\"zf\",\"lf\",\"bf\"],\"id\":\"4\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"zf\",\"lf\",\"bf\"],\"state\":[],\"hiddenActors\":[]}"
  expect(JSON.stringify(KD.data.events[4])).toEqual(layer4);
  const yFF = "{\"actorID\":\"ff\",\"data\":{},\"isHidden\":false,\"layers\":[{\"eventValue\":\"1\",\"eventXValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":\"1\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"2\",\"eventXValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":\"2\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"3\",\"eventXValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":\"3\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"pf\",\"ff\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":\"6\",\"eventXValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":\"6\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[]}]}"
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
  const layer4 = "{\"eventValue\":14,\"eventXValue\":14,\"data\":{\"id\":14,\"a\":\"zf\",\"b\":\"lf\",\"c\":\"bf\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"zf\",\"lf\",\"bf\"],\"state\":[],\"hiddenActors\":[]}"
  expect(JSON.stringify(KD.data.events[4])).toEqual(layer4);
  const yFF = "{\"actorID\":\"ff\",\"data\":{},\"isHidden\":false,\"layers\":[{\"eventValue\":11,\"eventXValue\":11,\"data\":{\"id\":11,\"a\":\"ff\",\"b\":\"ef\",\"c\":\"af\",\"d\":\"zf\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":12,\"eventXValue\":12,\"data\":{\"id\":12,\"a\":\"ff\",\"b\":\"gf\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":13,\"eventXValue\":13,\"data\":{\"id\":13,\"a\":\"ff\",\"b\":\"ef\",\"c\":\"cf\",\"d\":\"pf\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":17,\"eventXValue\":17,\"data\":{\"id\":17,\"a\":\"pf\",\"b\":\"ff\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"pf\",\"ff\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":18,\"eventXValue\":18,\"data\":{\"id\":18,\"a\":\"ff\",\"b\":\"gf\",\"c\":\"cf\",\"d\":\"af\"},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenActors\":[]}]}"
  expect(KD.data.actors.size).toEqual(10);
  expect(JSON.stringify(KD.data.actors.get('ff'))).toEqual(yFF);
});

test('from ranges', () => {
  const config: Config = {
    dataFormat: 'ranges',
    actorField: 'id',
    startField: 'from',
    endField: 'to',
  };
  const KD = new Storygram(testRangeData(), config);
  expect(KD.data.events.length).toEqual(10);
  const layer4 = "{\"eventValue\":4,\"eventXValue\":4,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"1\",\"2\",\"3\",\"4\",\"6\"],\"state\":[],\"hiddenActors\":[]}"
  expect(JSON.stringify(KD.data.events[4])).toEqual(layer4);
  const yFF = "{\"actorID\":\"4\",\"data\":{\"id\":4,\"from\":1,\"to\":5,\"c\":\"bf\"},\"isHidden\":false,\"layers\":[{\"eventValue\":1,\"eventXValue\":1,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"0\",\"1\",\"4\",\"9\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":2,\"eventXValue\":2,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"0\",\"1\",\"2\",\"4\",\"9\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":3,\"eventXValue\":3,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"0\",\"1\",\"2\",\"4\",\"6\",\"9\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":4,\"eventXValue\":4,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"1\",\"2\",\"3\",\"4\",\"6\"],\"state\":[],\"hiddenActors\":[]},{\"eventValue\":5,\"eventXValue\":5,\"data\":{},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"1\",\"3\",\"4\",\"6\"],\"state\":[],\"hiddenActors\":[]}]}"
  expect(KD.data.actors.size).toEqual(10);
  expect(JSON.stringify(KD.data.actors.get('4'))).toEqual(yFF);
});
