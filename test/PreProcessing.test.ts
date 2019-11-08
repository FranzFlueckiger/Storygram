import KnotDiagram from '../src/KnotDiagram';
import { ArrayData, BaseConfig, TableData, RangeData } from '../src/Types';
import { testArrayData, testTableData, testRangeData } from './testData';

test('from array', () => {
  const config: Partial<BaseConfig> & ArrayData = {
    dataFormat: 'array',
    xField: 'id',
    yArrayField: 'a',
  };
  const KD = new KnotDiagram(testArrayData(), config);
  expect(KD.data.xData.length).toEqual(10);
  const layer4 =
    '{"xValue":4,"data":{"a":["zf","lf","bf"],"id":4},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["zf","lf","bf"],"state":[],"hiddenYs":[],"id":4}';
  expect(JSON.stringify(KD.data.xData[4])).toEqual(layer4);
  const yFF =
    '{"yID":"ff","data":{},"isHidden":false,"layers":[{"xValue":1,"data":{"a":["ff","ef","af","zf"],"id":1},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","ef","af","zf"],"state":[],"hiddenYs":[],"id":1},{"xValue":2,"data":{"a":["ff","gf"],"id":2},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","gf"],"state":[],"hiddenYs":[],"id":2},{"xValue":3,"data":{"a":["ff","ef","cf","pf"],"id":3},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","ef","cf","pf"],"state":[],"hiddenYs":[],"id":3},{"xValue":7,"data":{"a":["pf","ff"],"id":7},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["pf","ff"],"state":[],"hiddenYs":[],"id":7},{"xValue":8,"data":{"a":["ff","gf","cf","af"],"id":8},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","gf","cf","af"],"state":[],"hiddenYs":[],"id":8}]}';
  expect(KD.data.yData.size).toEqual(10);
  expect(JSON.stringify(KD.data.yData.get('ff'))).toEqual(yFF);
});

test('from table', () => {
  const config: Partial<BaseConfig> & TableData = {
    dataFormat: 'table',
    xField: 'id',
    yFields: ['a', 'b', 'c', 'd'],
  };
  const KD = new KnotDiagram(testTableData(), config);
  expect(KD.data.xData.length).toEqual(10);
  const layer4 =
    '{"xValue":4,"data":{"id":4,"a":"zf","b":"lf","c":"bf"},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["zf","lf","bf"],"state":[],"hiddenYs":[],"id":4}';
  expect(JSON.stringify(KD.data.xData[4])).toEqual(layer4);
  const yFF =
    '{"yID":"ff","data":{},"isHidden":false,"layers":[{"xValue":1,"data":{"id":1,"a":"ff","b":"ef","c":"af","d":"zf"},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","ef","af","zf"],"state":[],"hiddenYs":[],"id":1},{"xValue":2,"data":{"id":2,"a":"ff","b":"gf"},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","gf"],"state":[],"hiddenYs":[],"id":2},{"xValue":3,"data":{"id":3,"a":"ff","b":"ef","c":"cf","d":"pf"},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","ef","cf","pf"],"state":[],"hiddenYs":[],"id":3},{"xValue":7,"data":{"id":7,"a":"pf","b":"ff"},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["pf","ff"],"state":[],"hiddenYs":[],"id":7},{"xValue":8,"data":{"id":8,"a":"ff","b":"gf","c":"cf","d":"af"},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["ff","gf","cf","af"],"state":[],"hiddenYs":[],"id":8}]}';
  expect(KD.data.yData.size).toEqual(10);
  expect(JSON.stringify(KD.data.yData.get('ff'))).toEqual(yFF);
});

test('from ranges', () => {
  const config: Partial<BaseConfig> & RangeData = {
    dataFormat: 'ranges',
    yField: 'id',
    startField: 'from',
    endField: 'to',
  };
  const KD = new KnotDiagram(testRangeData(), config);
  expect(KD.data.xData.length).toEqual(10);
  const layer4 =
    '{"xValue":"4","data":{},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["1","2","3","4","6"],"state":[],"hiddenYs":[]}';
  expect(JSON.stringify(KD.data.xData[4])).toEqual(layer4);
  const yFF =
    '{"yID":"4","data":{"id":"4","from":"1","to":"5","c":"bf"},"isHidden":false,"layers":[{"xValue":"1","data":{},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["0","1","4","9"],"state":[],"hiddenYs":[]},{"xValue":"2","data":{},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["0","1","2","4","9"],"state":[],"hiddenYs":[]},{"xValue":"3","data":{},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["0","1","2","4","6","9"],"state":[],"hiddenYs":[]},{"xValue":"4","data":{},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["1","2","3","4","6"],"state":[],"hiddenYs":[]},{"xValue":"5","data":{},"switch":[],"isHidden":false,"add":[],"remove":[],"group":["1","3","4","6"],"state":[],"hiddenYs":[]}]}';
  expect(KD.data.yData.size).toEqual(10);
  expect(JSON.stringify(KD.data.yData.get('4'))).toEqual(yFF);
});