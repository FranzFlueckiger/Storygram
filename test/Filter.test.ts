import { filter } from '../src/Filter';
import KnotDiagram from '../src/KnotDiagram';
import { Data, Config } from '../src/Types';
import { testArrayData } from './testData';

test('filter group size and amt', () => {
  const config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yArrayField: 'a',
    filterGroupSize: [0, 2],
    filterGroupAmt: [2, 2],
  };
  const KD = new KnotDiagram(testArrayData(), config);
  const newData: Data = filter(KD.data, KD.config);
  expect(newData.xData.length).toEqual(2);
  const layersFF = "[{\"xValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenYs\":[],\"id\":1},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":2,\"index\":0},{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\"],\"state\":[],\"hiddenYs\":[\"pf\"],\"id\":3},{\"xValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"pf\"],\"id\":7,\"index\":1},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"cf\",\"af\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":8}]"
  expect(newData.yData.get('ff')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('ff')!.layers)).toEqual(layersFF);
  const layersGF = "[{\"xValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":0},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"kf\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":0},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":2,\"index\":0},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"pf\"],\"id\":5},{\"xValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"kf\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":6},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"cf\",\"af\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":8},{\"xValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":7},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"zf\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":9}]"
  expect(newData.yData.get('gf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('gf')!.layers)).toEqual(layersGF);
  const layersPF = "[{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\"],\"state\":[],\"hiddenYs\":[\"pf\"],\"id\":3},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"pf\"],\"id\":5},{\"xValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"pf\"],\"id\":7,\"index\":1}]"
  expect(newData.yData.get('pf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('pf')!.layers)).toEqual(layersPF);
});

test('filter XValue and XValue lifetime', () => {
  const config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yArrayField: 'a',
    filterXValueLifeTime: [1, 3],
    filterXValue: [2, 4],
  };
  const KD = new KnotDiagram(testArrayData(), config);
  const newData = filter(KD.data, KD.config);
  expect(newData.xData.length).toEqual(2);
  const layersFF = "[{\"xValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenYs\":[\"ef\",\"zf\"],\"id\":1},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":2,\"index\":0},{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"ef\",\"cf\",\"pf\"],\"id\":3,\"index\":1},{\"xValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"pf\"],\"id\":7},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"cf\"],\"id\":8}]"
  expect(newData.yData.get('ff')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('ff')!.layers)).toEqual(layersFF);
  const layersGF = "[{\"xValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":0},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"kf\"],\"state\":[],\"hiddenYs\":[\"gf\",\"bf\"],\"id\":0},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[\"ff\"],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"gf\"],\"id\":2,\"index\":0},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"ef\",\"pf\"],\"id\":5},{\"xValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"kf\"],\"state\":[],\"hiddenYs\":[\"gf\",\"bf\"],\"id\":6},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"cf\"],\"id\":8},{\"xValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":7},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"gf\",\"ef\",\"zf\"],\"id\":9}]"
  expect(newData.yData.get('gf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('gf')!.layers)).toEqual(layersGF);
  const layersEF = "[{\"xValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenYs\":[\"ef\",\"zf\"],\"id\":1},{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"ef\",\"cf\",\"pf\"],\"id\":3,\"index\":1},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"ef\",\"pf\"],\"id\":5},{\"xValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":7},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"gf\",\"ef\",\"zf\"],\"id\":9}]"
  expect(newData.yData.get('ef')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('ef')!.layers)).toEqual(layersEF);
  const layersCF = "[{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"ef\",\"cf\",\"pf\"],\"id\":3,\"index\":1},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"cf\"],\"id\":8}]"
  expect(newData.yData.get('cf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('cf')!.layers)).toEqual(layersCF);
  const layersPF = "[{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"ff\"],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"ef\",\"cf\",\"pf\"],\"id\":3,\"index\":1},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"af\"],\"state\":[],\"hiddenYs\":[\"gf\",\"ef\",\"pf\"],\"id\":5},{\"xValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\"],\"state\":[],\"hiddenYs\":[\"pf\"],\"id\":7}]"
  expect(newData.yData.get('pf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('pf')!.layers)).toEqual(layersPF);
});

test('filter custom X filter', () => {
  const config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yArrayField: 'a',
    filterCustomX: xLayer => xLayer.id! % 2 === 0,
  };
  const KD = new KnotDiagram(testArrayData(), config);
  const newData: Data = filter(KD.data, KD.config);
  expect(newData.xData.length).toEqual(5);
  const layersFF = "[{\"xValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenYs\":[],\"id\":1},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenYs\":[],\"id\":2,\"index\":1},{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenYs\":[],\"id\":3},{\"xValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"pf\",\"ff\"],\"state\":[],\"hiddenYs\":[],\"id\":7},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"gf\",\"kf\",\"ff\",\"zf\",\"lf\",\"cf\",\"af\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenYs\":[],\"id\":8,\"index\":4}]"
  expect(newData.yData.get('ff')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('ff')!.layers)).toEqual(layersFF);
  const layersGF = "[{\"xValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":0},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\",\"ff\",\"zf\",\"lf\",\"cf\",\"af\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":0,\"index\":0},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenYs\":[],\"id\":2,\"index\":1},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"gf\",\"ef\",\"af\",\"pf\"],\"state\":[],\"hiddenYs\":[],\"id\":5},{\"xValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":6,\"index\":3},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"gf\",\"kf\",\"ff\",\"zf\",\"lf\",\"cf\",\"af\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenYs\":[],\"id\":8,\"index\":4},{\"xValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":7},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ef\",\"gf\",\"zf\"],\"state\":[],\"hiddenYs\":[],\"id\":9}]"
  expect(newData.yData.get('gf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('gf')!.layers)).toEqual(layersGF);
  const layersCF = "[{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":true,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenYs\":[],\"id\":3},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"gf\",\"kf\",\"ff\",\"zf\",\"lf\",\"cf\",\"af\"],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenYs\":[],\"id\":8,\"index\":4}]"
  expect(newData.yData.get('cf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('cf')!.layers)).toEqual(layersCF);
});

test('filter custom Y filter', () => {
  const config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yArrayField: 'a',
    filterCustomY: yLayer => yLayer.layers.some(l => l.id === 0),
  };
  const KD = new KnotDiagram(testArrayData(), config);
  const newData: Data = filter(KD.data, KD.config);
  expect(newData.xData.length).toEqual(7);
  const layersGF = "[{\"xValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":0},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":0,\"index\":0},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ff\"],\"id\":2,\"index\":1},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ef\",\"af\",\"pf\"],\"id\":5,\"index\":3},{\"xValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":6,\"index\":4},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ff\",\"af\",\"cf\"],\"id\":8,\"index\":5},{\"xValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":7},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"gf\",\"kf\"],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ef\",\"zf\"],\"id\":9,\"index\":6}]"
  expect(newData.yData.get('gf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('gf')!.layers)).toEqual(layersGF);
  const layersBF = "[{\"xValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":0},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":0,\"index\":0},{\"xValue\":4,\"data\":{\"a\":[\"zf\",\"lf\",\"bf\"],\"id\":4},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"bf\"],\"state\":[],\"hiddenYs\":[\"zf\",\"lf\"],\"id\":4,\"index\":2},{\"xValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":6,\"index\":4}]"
  expect(newData.yData.get('bf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('bf')!.layers)).toEqual(layersBF);
  const layersKF = "[{\"xValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":0},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":0,\"index\":0},{\"xValue\":5,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":6,\"index\":4}]"
  expect(newData.yData.get('kf')!.isHidden).toEqual(false);
  expect(JSON.stringify(newData.yData.get('kf')!.layers)).toEqual(layersKF);
  const layersFF = "[{\"xValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ff\"],\"id\":2,\"index\":1},{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},{\"xValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"pf\"],\"id\":7},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ff\",\"af\",\"cf\"],\"id\":8,\"index\":5}]"
  expect(newData.yData.get('ff')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('ff')!.layers)).toEqual(layersFF);
  const layersEF = "[{\"xValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ef\",\"af\",\"pf\"],\"id\":5,\"index\":3},{\"xValue\":7,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":7},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"gf\",\"kf\"],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ef\",\"zf\"],\"id\":9,\"index\":6}]"
  expect(newData.yData.get('ef')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('ef')!.layers)).toEqual(layersEF);
  const layersCF = "[{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},{\"xValue\":6,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ff\",\"af\",\"cf\"],\"id\":8,\"index\":5}]"
  expect(newData.yData.get('cf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('cf')!.layers)).toEqual(layersCF);
  const layersPF = "[{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\"],\"state\":[],\"hiddenYs\":[\"ef\",\"af\",\"pf\"],\"id\":5,\"index\":3},{\"xValue\":6,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[],\"state\":[],\"hiddenYs\":[\"ff\",\"pf\"],\"id\":7}]"
  expect(newData.yData.get('pf')!.isHidden).toEqual(true);
  expect(JSON.stringify(newData.yData.get('pf')!.layers)).toEqual(layersPF);
});
