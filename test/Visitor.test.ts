import { remove } from '../src/Visitor'

test('remove', () => {
    let visitor = ['hallo', 'world', 'wie', 'gehts']
    let str = 'hallo'
    visitor = remove(str, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify([ 'world', 'wie', 'gehts' ]));
    str = 'wie'
    visitor = remove(str, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify([ 'world', 'gehts' ]));
    str = 'hallo'
    visitor = remove(str, visitor)
    expect(JSON.stringify(visitor)).toEqual(JSON.stringify([ 'world', 'gehts' ]));
});

// import { visit, switchP, remove, group, getCenter, getDistances } from '../src/Visitor'
