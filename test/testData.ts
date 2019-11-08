// by updating these functions filter and preprocessing tests have to be rewritten

export function testArrayData() {
  return [
    { a: ['bf', 'gf', 'kf'], id: 0 },
    { a: ['ff', 'ef', 'af', 'zf'], id: 1 },
    { a: ['ff', 'gf'], id: 2 },
    { a: ['ff', 'ef', 'cf', 'pf'], id: 3 },
    { a: ['zf', 'lf', 'bf'], id: 4 },
    { a: ['gf', 'ef', 'af', 'pf'], id: 5 },
    { a: ['bf', 'gf', 'kf'], id: 6 },
    { a: ['pf', 'ff'], id: 7 },
    { a: ['ff', 'gf', 'cf', 'af'], id: 8 },
    { a: ['ef', 'gf', 'zf'], id: 9 },
  ];
}

export function testTableData() {
  return [
    { id: 0, a: 'bf', b: 'gf', c: 'kf' },
    { id: 1, a: 'ff', b: 'ef', c: 'af', d: 'zf' },
    { id: 2, a: 'ff', b: 'gf' },
    { id: 3, a: 'ff', b: 'ef', c: 'cf', d: 'pf' },
    { id: 4, a: 'zf', b: 'lf', c: 'bf' },
    { id: 5, a: 'gf', b: 'ef', c: 'af', d: 'pf' },
    { id: 6, a: 'bf', b: 'gf', c: 'kf' },
    { id: 7, a: 'pf', b: 'ff' },
    { id: 8, a: 'ff', b: 'gf', c: 'cf', d: 'af' },
    { id: 9, a: 'ef', b: 'gf', c: 'zf' },
  ];
}

export function testRangeData() {
  return [
    { id: '0', from: 0, to: 3, c: 'kf' },
    { id: '1', from: 1, to: 6, c: 'af', d: 'zf' },
    { id: '2', from: 2, to: 4 },
    { id: '3', from: 4, to: 5, c: 'cf', d: 'pf' },
    { id: '4', from: 1, to: 5, c: 'bf' },
    { id: '5', from: 8, to: 9, c: 'af', d: 'pf' },
    { id: '6', from: 3, to: 8, c: 'kf' },
    { id: '7', from: 7, to: 8 },
    { id: '8', from: 9, to: 9, c: 'cf', d: 'af' },
    { id: '9', from: 1, to: 3, c: 'zf' },
  ];
}
