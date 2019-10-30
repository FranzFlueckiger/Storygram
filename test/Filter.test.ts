import { filter, filterX, filterY, setLifeCycles, isInRange } from '../src/Filter'
import { Switch, XData, YData, Data, YLayer, Config, } from '../src/Types'

test('filter', () => {
    let visitor: string[] = []
    let xs: XData = [
        { id: 4, index: 0, xValue: 10, isHidden: false, add: ['a', 'b'], group: ['a', 'b'], remove: [], switch: [], state: [], hiddenYs: [], data: {} },
        { id: 8, index: 1, xValue: 20, isHidden: false, add: ['c', 'd'], group: ['a', 'c', 'd'], remove: ['b'], switch: [], state: [], hiddenYs: [], data: {} }
    ]
    let ys: YData = new Map()
    ys.set('a', new YLayer('a', {}))
    ys.set('b', new YLayer('b', {}))
    ys.set('c', new YLayer('c', {}))
    ys.set('d', new YLayer('d', {}))
    const data: Data = {xData: xs, yData: ys}
    let config: Config = {
        dataFormat: 'array',
        filterGroupSize: [0, 2]
    }
    // let newData = filter(data, config)
    // expect(JSON.stringify(newData)).toEqual("[\"b\",\"a\"]");
})
