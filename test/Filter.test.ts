import { filter, filterX, filterY, setLifeCycles, isInRange } from '../src/Filter'
import { KnotDiagram } from '../src/KnotDiagram'
import { Switch, XData, YData, Data, YLayer, Config, } from '../src/Types'

function testData() {
  return [
    { a: ["bf", "gf", "kf"], id: 0 },
    { a: ["ff", "ef", "af", "zf"], id: 1 },
    { a: ["ff", "gf"], id: 2 },
    { a: ["ff", "ef", "cf", "pf"], id: 3 },
    { a: ["zf", "lf", "bf"], id: 4 },
    { a: ["gf", "ef", "af", "pf"], id: 5 },
    { a: ["bf", "gf", "kf"], id: 6 },
    { a: ["pf", "ff"], id: 7 },
    { a: ["ff", "gf", "cf", "af"], id: 8 },
    { a: ["ef", "gf", "zf"], id: 9 },
  ];
}

test('filter', () => {
  let visitor: string[] = []
  let config: Config = {
    dataFormat: 'array',
    xField: 'id',
    yField: 'a'
  }
  const KD = new KnotDiagram(testData(), config)
  let newData: Data = filter(KD.data, config)
  //console.log(newData)
  //expect(JSON.stringify(newData.xData)).toEqual("[{\"xValue\":0,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":0},\"switch\":[],\"isHidden\":false,\"add\":[\"bf\",\"gf\",\"kf\",\"ff\",\"ef\",\"af\",\"zf\",\"cf\",\"pf\",\"lf\"],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":0,\"index\":0},{\"xValue\":1,\"data\":{\"a\":[\"ff\",\"ef\",\"af\",\"zf\"],\"id\":1},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"af\",\"zf\"],\"state\":[],\"hiddenYs\":[],\"id\":1,\"index\":1},{\"xValue\":2,\"data\":{\"a\":[\"ff\",\"gf\"],\"id\":2},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\"],\"state\":[],\"hiddenYs\":[],\"id\":2,\"index\":2},{\"xValue\":3,\"data\":{\"a\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"id\":3},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"ef\",\"cf\",\"pf\"],\"state\":[],\"hiddenYs\":[],\"id\":3,\"index\":3},{\"xValue\":4,\"data\":{\"a\":[\"zf\",\"lf\",\"bf\"],\"id\":4},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"zf\",\"lf\",\"bf\"],\"state\":[],\"hiddenYs\":[],\"id\":4,\"index\":4},{\"xValue\":5,\"data\":{\"a\":[\"gf\",\"ef\",\"af\",\"pf\"],\"id\":5},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"gf\",\"ef\",\"af\",\"pf\"],\"state\":[],\"hiddenYs\":[],\"id\":5,\"index\":5},{\"xValue\":6,\"data\":{\"a\":[\"bf\",\"gf\",\"kf\"],\"id\":6},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"bf\",\"gf\",\"kf\"],\"state\":[],\"hiddenYs\":[],\"id\":6,\"index\":6},{\"xValue\":7,\"data\":{\"a\":[\"pf\",\"ff\"],\"id\":7},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"pf\",\"ff\"],\"state\":[],\"hiddenYs\":[],\"id\":7,\"index\":7},{\"xValue\":8,\"data\":{\"a\":[\"ff\",\"gf\",\"cf\",\"af\"],\"id\":8},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[],\"group\":[\"ff\",\"gf\",\"cf\",\"af\"],\"state\":[],\"hiddenYs\":[],\"id\":8,\"index\":8},{\"xValue\":9,\"data\":{\"a\":[\"ef\",\"gf\",\"zf\"],\"id\":9},\"switch\":[],\"isHidden\":false,\"add\":[],\"remove\":[\"bf\",\"gf\",\"kf\",\"ff\",\"ef\",\"af\",\"zf\",\"cf\",\"pf\",\"lf\"],\"group\":[\"ef\",\"gf\",\"zf\"],\"state\":[],\"hiddenYs\":[],\"id\":9,\"index\":9}]");
  //expect(JSON.stringify(newData.yData)).toEqual("Map {'bf' => YLayer { yID: 'bf', data: {}, isHidden: false, layers: [Array] },'gf' => YLayer { yID: 'gf', data: {}, isHidden: false, layers: [Array] },'kf' => YLayer { yID: 'kf', data: {}, isHidden: false, layers: [Array] },'ff' => YLayer { yID: 'ff', data: {}, isHidden: false, layers: [Array] },'ef' => YLayer { yID: 'ef', data: {}, isHidden: false, layers: [Array] },'af' => YLayer { yID: 'af', data: {}, isHidden: false, layers: [Array] },'zf' => YLayer { yID: 'zf', data: {}, isHidden: false, layers: [Array] },'cf' => YLayer { yID: 'cf', data: {}, isHidden: false, layers: [Array] },'pf' => YLayer { yID: 'pf', data: {}, isHidden: false, layers: [Array] },'lf' => YLayer { yID: 'lf', data: {}, isHidden: false, layers: [Array] } } ");
})
