import { remove, add, switchP, getCenter, getDistances, group, visit } from '../src/Visitor'
import { Switch, XData, YData, Data, YLayer, } from '../src/Types'

test('remove', () => {
    let visitor: string[] = ['hallo', 'world', 'wie', 'gehts']
    let str: string = 'hallo'
    visitor = remove(str, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['world', 'wie', 'gehts']));
    str = 'wie'
    visitor = remove(str, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['world', 'gehts']));
    str = 'hallo'
    visitor = remove(str, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['world', 'gehts']));
});

test('add', () => {
    let visitor: string[] = ['hallo', 'wie', 'gehts']
    let str: string = 'world'
    let center: number = 2
    let gene: number = -1
    visitor = add(str, center, gene, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['hallo', 'world', 'wie', 'gehts']));
    str = 'wie'
    visitor = add(str, center, gene, visitor)
    gene = 1
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['hallo', 'world', 'wie', 'wie', 'gehts']));
});

test('switchP', () => {
    let visitor: string[] = ['hallo', 'wie', 'gehts']
    let switches: Switch = { target: 1, prev: 0 };
    visitor = switchP(switches, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['wie', 'hallo', 'gehts']));
    // check two impossible values
    switches = { target: -1, prev: 3 };
    visitor = switchP(switches, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['wie', 'hallo', 'gehts']));
});

test('getCenter', () => {
    let visitor: string[] = ['hallo', 'wie', 'gehts', 'gut']
    let groupedPs: string[] = ['hallo', 'gut']
    let center = getCenter(groupedPs, visitor)
    expect(center).toBe(2);
    visitor = ['hallo', 'wie', 'gehts', 'ja', 'gut']
    center = getCenter(groupedPs, visitor)
    expect(center).toBe(2);
    groupedPs = ['hallo', 'wie', 'ja']
    center = getCenter(groupedPs, visitor)
    expect(center).toBe(1);
});

test('getDistances', () => {
    let visitor: string[] = ['hallo', 'wie', 'gehts', 'gut']
    let groupedPs: string[] = ['hallo', 'gut']
    let center = 1
    let dists = getDistances(groupedPs, center, visitor)
    expect(dists).toEqual([{ "distance": 1, "p": "hallo" }, { "distance": -2, "p": "gut" }]);
});

test('group', () => {
    let visitor: string[] = ['hallo', 'wie', 'gehts', 'gut']
    let groupedPs: string[] = ['hallo', 'gut']
    let switches: Switch[] = group(groupedPs, visitor)
    expect(JSON.stringify(switches)).toEqual('[{\"target\":2,\"prev\":3},{\"target\":1,\"prev\":0}]');
})

test('visit', () => {
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
    let newData = visit(data, undefined)
    expect(JSON.stringify(newData[0][0].state)).toEqual("[\"b\",\"a\"]");
    expect(JSON.stringify(newData[0][0].switch)).toEqual("[]");
    expect(JSON.stringify(newData[0][1].state)).toEqual("[\"d\",\"c\",\"a\",\"b\"]");
    expect(JSON.stringify(newData[0][1].switch)).toEqual("[{\"target\":2,\"prev\":3}]");
})
