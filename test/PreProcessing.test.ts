import { KnotDiagram } from '../src/KnotDiagram'
import { Data, Config, } from '../src/Types'
import { testArrayData } from './testData'

test('from array', () => {
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a',
  }
  let KD = new KnotDiagram(testArrayData(), config)
  expect(KD.data.xData.length).toEqual(10);
  const layer4 = {
    "add": [], "data": { "a": ["zf", "lf", "bf"], "id": 4 }, "group": ["zf", "lf", "bf"], "hiddenYs": [], "id": 4,
    "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 4
  }
  expect(KD.data.xData[4]).toEqual(layer4);
  const yFF = { "data": {}, "isHidden": false, "layers": [{ "add": [], "data": { "a": ["ff", "ef", "af", "zf"], "id": 1 }, "group": ["ff", "ef", "af", "zf"], "hiddenYs": [], "id": 1, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 1 }, { "add": [], "data": { "a": ["ff", "gf"], "id": 2 }, "group": ["ff", "gf"], "hiddenYs": [], "id": 2, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 2 }, { "add": [], "data": { "a": ["ff", "ef", "cf", "pf"], "id": 3 }, "group": ["ff", "ef", "cf", "pf"], "hiddenYs": [], "id": 3, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 3 }, { "add": [], "data": { "a": ["pf", "ff"], "id": 7 }, "group": ["pf", "ff"], "hiddenYs": [], "id": 7, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 7 }, { "add": [], "data": { "a": ["ff", "gf", "cf", "af"], "id": 8 }, "group": ["ff", "gf", "cf", "af"], "hiddenYs": [], "id": 8, "isHidden": false, "remove": [], "state": [], "switch": [], "xValue": 8 }], "yID": "ff" }
  expect(KD.data.yData.size).toEqual(10);
  expect(KD.data.yData.get('ff')).toEqual(yFF);
})

test('from table', () => {
  let config: Config = {
    dataFormat: 'table',
    xField: 'id',
    yField: ['a', 'b', 'c', 'd'],
  }
  let KD = new KnotDiagram(testArrayData(), config)
  expect(KD.data.xData.length).toEqual(10);
  const layer4 = {
    xValue: 4,
    data: { a: ['zf', 'lf', 'bf'], id: 4 },
    switch: [],
    isHidden: false,
    add: [],
    remove: [],
    group: [['zf', 'lf', 'bf']],
    state: [],
    hiddenYs: [],
    id: 4
  }
  expect(KD.data.xData[4]).toEqual(layer4);
  const yFF = {
    data: {},
    isHidden: false,
    layers:
      [{
        add: [],
        data: [Object],
        group: [Array],
        hiddenYs: [],
        id: 1,
        isHidden: false,
        remove: [],
        state: [],
        switch: [],
        xValue: 1
      },
      {
        add: [],
        data: [Object],
        group: [Array],
        hiddenYs: [],
        id: 2,
        isHidden: false,
        remove: [],
        state: [],
        switch: [],
        xValue: 2
      },
      {
        add: [],
        data: [Object],
        group: [Array],
        hiddenYs: [],
        id: 3,
        isHidden: false,
        remove: [],
        state: [],
        switch: [],
        xValue: 3
      },
      {
        add: [],
        data: [Object],
        group: [Array],
        hiddenYs: [],
        id: 7,
        isHidden: false,
        remove: [],
        state: [],
        switch: [],
        xValue: 7
      },
      {
        add: [],
        data: [Object],
        group: [Array],
        hiddenYs: [],
        id: 8,
        isHidden: false,
        remove: [],
        state: [],
        switch: [],
        xValue: 8
      }],
    yID: 'ff'
  }
  expect(KD.data.yData.size).toEqual(10);
  expect(KD.data.yData.get('ff')).toEqual(yFF);
})
