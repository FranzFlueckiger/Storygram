import { filter } from '../src/Filter'
import { KnotDiagram } from '../src/KnotDiagram'
import { Data, Config, } from '../src/Types'
import { testArrayData } from './testData'

test('filter group size and amt', () => {
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a',
    filterGroupSize: [0, 2],
    filterGroupAmt: [2, 2]
  }
  let KD = new KnotDiagram(testArrayData(), config)
  let newData: Data = filter(KD.data, config)
  expect(newData.xData.length).toEqual(2);
  const layersFF = [{ "add": [], "data": { "a": ["ff", "ef", "af", "zf"], "id": 1 }, "group": ["ff", "ef", "af", "zf"], "hiddenYs": [], "id": 1, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 1 }, { "add": ["ff"], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["ff"], "hiddenYs": ["gf"], "id": 2, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff", "ef", "cf"], "hiddenYs": ["pf"], "id": 3, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": ["ff"], "hiddenYs": ["pf"], "id": 7, "index": 1, "isHidden": false, "remove": ["ff"], "state": [], "switch": [], "xValue": 7 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "cf", "af"], "hiddenYs": ["gf"], "id": 8, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 8 }]
  expect(newData.yData.get('ff')!.isHidden).toEqual(false);
  expect(newData.yData.get('ff')!.layers).toEqual(layersFF);
  const layersGF = [{ "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 0 }, "group": ["bf", "kf"], "hiddenYs": ["gf"], "id": 0, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 0 }, { "add": ["ff"], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["ff"], "hiddenYs": ["gf"], "id": 2, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["ef", "af"], "hiddenYs": ["gf", "pf"], "id": 5, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 6 }, "group": ["bf", "kf"], "hiddenYs": ["gf"], "id": 6, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 6 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "cf", "af"], "hiddenYs": ["gf"], "id": 8, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 8 }, { "add": [], "data": { "a": ["ef", "gf", "zf"], "id": 9 }, "group": ["ef", "zf"], "hiddenYs": ["gf"], "id": 9, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 9 }]
  expect(newData.yData.get('gf')!.isHidden).toEqual(true);
  expect(newData.yData.get('gf')!.layers).toEqual(layersGF);
  const layersPF = [{ "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff", "ef", "cf"], "hiddenYs": ["pf"], "id": 3, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["ef", "af"], "hiddenYs": ["gf", "pf"], "id": 5, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": ["ff"], "hiddenYs": ["pf"], "id": 7, "index": 1, "isHidden": false, "remove": ["ff"], "state": [], "switch": [], "xValue": 7 }]
  expect(newData.yData.get('pf')!.isHidden).toEqual(true);
  expect(newData.yData.get('pf')!.layers).toEqual(layersPF);
})

test('filter XValue and XValue lifetime', () => {
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a',
    filterXValueLifeTime: [1, 3],
    filterXValue: [2, 4]
  }
  let KD = new KnotDiagram(testArrayData(), config)
  let newData: Data = filter(KD.data, config)
  expect(newData.xData.length).toEqual(2);
  const layersFF = [{ "add": [], "data": { "a": ["ff", "ef", "af", "zf"], "id": 1 }, "group": ["ff", "af"], "hiddenYs": ["ef", "zf"], "id": 1, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 1 }, { "add": ["ff"], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["ff"], "hiddenYs": ["gf"], "id": 2, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff"], "hiddenYs": ["ef", "cf", "pf"], "id": 3, "index": 1, "isHidden": false, "remove": ["ff"], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": ["ff"], "hiddenYs": ["pf"], "id": 7, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 7 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "af"], "hiddenYs": ["gf", "cf"], "id": 8, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 8 }]
  expect(newData.yData.get('ff')!.isHidden).toEqual(false);
  expect(newData.yData.get('ff')!.layers).toEqual(layersFF)
  const layersGF = [{ "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 0 }, "group": ["kf"], "hiddenYs": ["gf", "bf"], "id": 0, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 0 }, { "add": ["ff"], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["ff"], "hiddenYs": ["gf"], "id": 2, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["af"], "hiddenYs": ["gf", "ef", "pf"], "id": 5, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 6 }, "group": ["kf"], "hiddenYs": ["gf", "bf"], "id": 6, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 6 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "af"], "hiddenYs": ["gf", "cf"], "id": 8, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 8 }, { "add": [], "data": { "a": ["ef", "gf", "zf"], "id": 9 }, "group": [], "hiddenYs": ["gf", "ef", "zf"], "id": 9, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 9 }]
  expect(newData.yData.get('gf')!.isHidden).toEqual(true);
  expect(newData.yData.get('gf')!.layers).toEqual(layersGF);
  const layersEF = [{ "add": [], "data": { "a": ["ff", "ef", "af", "zf"], "id": 1 }, "group": ["ff", "af"], "hiddenYs": ["ef", "zf"], "id": 1, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 1 }, { "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff"], "hiddenYs": ["ef", "cf", "pf"], "id": 3, "index": 1, "isHidden": false, "remove": ["ff"], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["af"], "hiddenYs": ["gf", "ef", "pf"], "id": 5, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["ef", "gf", "zf"], "id": 9 }, "group": [], "hiddenYs": ["gf", "ef", "zf"], "id": 9, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 9 }]
  expect(newData.yData.get('ef')!.isHidden).toEqual(true);
  expect(newData.yData.get('ef')!.layers).toEqual(layersEF);
  const layersCF = [{ "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff"], "hiddenYs": ["ef", "cf", "pf"], "id": 3, "index": 1, "isHidden": false, "remove": ["ff"], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "af"], "hiddenYs": ["gf", "cf"], "id": 8, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 8 }]
  expect(newData.yData.get('cf')!.isHidden).toEqual(true);
  expect(newData.yData.get('cf')!.layers).toEqual(layersCF);
  const layersPF = [{ "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff"], "hiddenYs": ["ef", "cf", "pf"], "id": 3, "index": 1, "isHidden": false, "remove": ["ff"], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["af"], "hiddenYs": ["gf", "ef", "pf"], "id": 5, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": ["ff"], "hiddenYs": ["pf"], "id": 7, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 7 }]
  expect(newData.yData.get('pf')!.isHidden).toEqual(true);
  expect(newData.yData.get('pf')!.layers).toEqual(layersPF);
})

test('filter custom X filter', () => {
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a',
    filterCustomX: (xLayer) => xLayer.id % 2 === 0
  }
  let KD = new KnotDiagram(testArrayData(), config)
  let newData: Data = filter(KD.data, config)
  expect(newData.xData.length).toEqual(5);
  const layersFF = [{ "add": [], "data": { "a": ["ff", "ef", "af", "zf"], "id": 1 }, "group": ["ff", "ef", "af", "zf"], "hiddenYs": [], "id": 1, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 1 }, { "add": [], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["ff", "gf"], "hiddenYs": [], "id": 2, "index": 1, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff", "ef", "cf", "pf"], "hiddenYs": [], "id": 3, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": ["pf", "ff"], "hiddenYs": [], "id": 7, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 7 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "gf", "cf", "af"], "hiddenYs": [], "id": 8, "index": 4, "isHidden": false, "remove": ["bf", "gf", "kf", "ff", "zf", "lf", "cf", "af"], "state": [], "switch": [], "xValue": 8 }]
  expect(newData.yData.get('ff')!.isHidden).toEqual(false);
  expect(newData.yData.get('ff')!.layers).toEqual(layersFF);
  const layersGF = [{ "add": ["bf", "gf", "kf", "ff", "zf", "lf", "cf", "af"], "data": { "a": ["bf", "gf", "kf"], "id": 0 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 0, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 0 }, { "add": [], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["ff", "gf"], "hiddenYs": [], "id": 2, "index": 1, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["gf", "ef", "af", "pf"], "hiddenYs": [], "id": 5, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 6 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 6, "index": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 6 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "gf", "cf", "af"], "hiddenYs": [], "id": 8, "index": 4, "isHidden": false, "remove": ["bf", "gf", "kf", "ff", "zf", "lf", "cf", "af"], "state": [], "switch": [], "xValue": 8 }, { "add": [], "data": { "a": ["ef", "gf", "zf"], "id": 9 }, "group": ["ef", "gf", "zf"], "hiddenYs": [], "id": 9, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 9 }]
  expect(newData.yData.get('gf')!.isHidden).toEqual(false);
  expect(newData.yData.get('gf')!.layers).toEqual(layersGF);
  const layersCF = [{ "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff", "ef", "cf", "pf"], "hiddenYs": [], "id": 3, "isHidden": true, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "gf", "cf", "af"], "hiddenYs": [], "id": 8, "index": 4, "isHidden": false, "remove": ["bf", "gf", "kf", "ff", "zf", "lf", "cf", "af"], "state": [], "switch": [], "xValue": 8 }]
  expect(newData.yData.get('cf')!.isHidden).toEqual(false);
  expect(newData.yData.get('cf')!.layers).toEqual(layersCF);
})

test('filter custom Y filter', () => {
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a',
    filterCustomY: (yLayer) => yLayer.layers.some(l => l.id === 0)
  }
  let KD = new KnotDiagram(testArrayData(), config)
  let newData: Data = filter(KD.data, config)
  expect(newData.xData.length).toEqual(7);
  const layersGF = [{ "add": ["bf", "gf", "kf"], "data": { "a": ["bf", "gf", "kf"], "id": 0 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 0, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 0 }, { "add": [], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["gf"], "hiddenYs": ["ff"], "id": 2, "index": 1, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["gf"], "hiddenYs": ["ef", "af", "pf"], "id": 5, "index": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 6 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 6, "index": 4, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 6 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["gf"], "hiddenYs": ["ff", "af", "cf"], "id": 8, "index": 5, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 8 }, { "add": [], "data": { "a": ["ef", "gf", "zf"], "id": 9 }, "group": ["gf"], "hiddenYs": ["ef", "zf"], "id": 9, "index": 6, "isHidden": false, "remove": ["bf", "gf", "kf"], "state": [], "switch": [], "xValue": 9 }]
  expect(newData.yData.get('gf')!.isHidden).toEqual(false);
  expect(newData.yData.get('gf')!.layers).toEqual(layersGF);
  const layersBF = [{ "add": ["bf", "gf", "kf"], "data": { "a": ["bf", "gf", "kf"], "id": 0 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 0, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 0 }, { "add": [], "data": { "a": ["zf", "lf", "bf"], "id": 4 }, "group": ["bf"], "hiddenYs": ["zf", "lf"], "id": 4, "index": 2, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 4 }, { "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 6 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 6, "index": 4, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 6 }]
  expect(newData.yData.get('bf')!.isHidden).toEqual(false);
  expect(newData.yData.get('bf')!.layers).toEqual(layersBF);
  const layersKF = [{ "add": ["bf", "gf", "kf"], "data": { "a": ["bf", "gf", "kf"], "id": 0 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 0, "index": 0, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 0 }, { "add": [], "data": { "a": ["bf", "gf", "kf"], "id": 6 }, "group": ["bf", "gf", "kf"], "hiddenYs": [], "id": 6, "index": 4, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 6 }]
  expect(newData.yData.get('kf')!.isHidden).toEqual(false);
  expect(newData.yData.get('kf')!.layers).toEqual(layersKF);
  const layersFF = [{ "add": [], "data": { "a": ["ff", "ef", "af", "zf"], "id": 1 }, "group": [], "hiddenYs": ["ff", "ef", "af", "zf"], "id": 1, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 1 }, { "add": [], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["gf"], "hiddenYs": ["ff"], "id": 2, "index": 1, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": [], "hiddenYs": ["ff", "ef", "cf", "pf"], "id": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": [], "hiddenYs": ["ff", "pf"], "id": 7, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 7 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["gf"], "hiddenYs": ["ff", "af", "cf"], "id": 8, "index": 5, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 8 }]
  expect(newData.yData.get('ff')!.isHidden).toEqual(true);
  expect(newData.yData.get('ff')!.layers).toEqual(layersFF);
  const layersEF = [{ "add": [], "data": { "a": ["ff", "ef", "af", "zf"], "id": 1 }, "group": [], "hiddenYs": ["ff", "ef", "af", "zf"], "id": 1, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 1 }, { "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": [], "hiddenYs": ["ff", "ef", "cf", "pf"], "id": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["gf"], "hiddenYs": ["ef", "af", "pf"], "id": 5, "index": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["ef", "gf", "zf"], "id": 9 }, "group": ["gf"], "hiddenYs": ["ef", "zf"], "id": 9, "index": 6, "isHidden": false, "remove": ["bf", "gf", "kf"], "state": [], "switch": [], "xValue": 9 }]
  expect(newData.yData.get('ef')!.isHidden).toEqual(true);
  expect(newData.yData.get('ef')!.layers).toEqual(layersEF);
  const layersCF = [{ "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": [], "hiddenYs": ["ff", "ef", "cf", "pf"], "id": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["gf"], "hiddenYs": ["ff", "af", "cf"], "id": 8, "index": 5, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 8 }]
  expect(newData.yData.get('cf')!.isHidden).toEqual(true);
  expect(newData.yData.get('cf')!.layers).toEqual(layersCF);
  const layersPF = [{ "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": [], "hiddenYs": ["ff", "ef", "cf", "pf"], "id": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["gf", "ef", "af", "pf"], "id": 5 }, "group": ["gf"], "hiddenYs": ["ef", "af", "pf"], "id": 5, "index": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 5 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": [], "hiddenYs": ["ff", "pf"], "id": 7, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 7 }]
  expect(newData.yData.get('pf')!.isHidden).toEqual(true);
  expect(newData.yData.get('pf')!.layers).toEqual(layersPF);
})
