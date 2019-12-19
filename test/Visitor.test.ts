import { remove, add, switchP, getCenter, getDistances, group, visit } from '../src/Visitor';
import { Switch, EventData, ActorData, Data, Actor } from '../src/Types';

test('remove', () => {
  let visitor: string[] = ['hallo', 'world', 'wie', 'gehts'];
  let str = 'hallo';
  visitor = remove(str, visitor);
  expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['world', 'wie', 'gehts']));
  str = 'wie';
  visitor = remove(str, visitor);
  expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['world', 'gehts']));
  str = 'hallo';
  visitor = remove(str, visitor);
  expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['world', 'gehts']));
});

test('add', () => {
  let visitor: string[] = ['hallo', 'wie', 'gehts'];
  let str = 'world';
  const center = 2;
  let gene = -1;
  visitor = add(str, center, gene, visitor);
  expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['hallo', 'world', 'wie', 'gehts']));
  str = 'wie';
  visitor = add(str, center, gene, visitor);
  gene = 1;
  expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['hallo', 'world', 'wie', 'wie', 'gehts']));
});

test('switchP', () => {
  let visitor: string[] = ['hallo', 'wie', 'gehts'];
  let switches: Switch = { target: 1, prev: 0 };
  visitor = switchP(switches, visitor);
  expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['wie', 'hallo', 'gehts']));
  // check two impossible values
  switches = { target: -1, prev: 3 };
  visitor = switchP(switches, visitor);
  expect(JSON.stringify(visitor)).toEqual(JSON.stringify(['wie', 'hallo', 'gehts']));
});

test('getCenter', () => {
  let visitor: string[] = ['hallo', 'wie', 'gehts', 'gut'];
  let groupedPs: string[] = ['hallo', 'gut'];
  let center = getCenter(groupedPs, visitor);
  expect(center).toBe(2);
  visitor = ['hallo', 'wie', 'gehts', 'ja', 'gut'];
  center = getCenter(groupedPs, visitor);
  expect(center).toBe(2);
  groupedPs = ['hallo', 'wie', 'ja'];
  center = getCenter(groupedPs, visitor);
  expect(center).toBe(1);
});

test('getDistances', () => {
  const visitor = ['hallo', 'wie', 'gehts', 'gut'];
  const groupedPs = ['hallo', 'gut'];
  const center = 1;
  const dists = getDistances(groupedPs, center, visitor);
  expect(dists).toEqual([{ distance: 1, p: 'hallo' }, { distance: -2, p: 'gut' }]);
});

test('group', () => {
  const visitor = ['hallo', 'wie', 'gehts', 'gut'];
  const groupedPs = ['hallo', 'gut'];
  const switches = group(groupedPs, visitor);
  expect(JSON.stringify(switches)).toEqual('[{"target":2,"prev":3},{"target":1,"prev":0}]');
});

test('visit', () => {
  const xs: EventData = [
    {
      id: 4,
      index: 0,
      eventValue: 10,
      isHidden: false,
      add: ['a', 'b'],
      group: ['a', 'b'],
      remove: [],
      switch: [],
      state: [],
      hiddenActors: [],
      data: {},
    },
    {
      id: 8,
      index: 1,
      eventValue: 20,
      isHidden: false,
      add: ['c', 'd'],
      group: ['a', 'c', 'd'],
      remove: ['b'],
      switch: [],
      state: [],
      hiddenActors: [],
      data: {},
    },
  ];
  const ys: ActorData = new Map();
  // todo complete ylayers
  ys.set('a', new Actor('a', {}));
  ys.set('b', new Actor('b', {}));
  ys.set('c', new Actor('c', {}));
  ys.set('d', new Actor('d', {}));
  const data: Data = { xData: xs, yData: ys };
  const newData = visit(data, undefined);
  expect(JSON.stringify(newData[0][0].state)).toEqual('["b","a"]');
});
