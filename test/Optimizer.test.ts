import {fit, getCompactedLocation} from '../src/Optimizer';
import Storygram from '../src/Storygram';
import {Config} from '../src/Types';
import {testArrayData} from './testData';

describe('getCompactedLocation', () => {
  test('single element maps to 0', () => {
    expect(getCompactedLocation(0, 1)).toBe(0);
  });

  test('two elements are symmetric: positions -1 and 0', () => {
    expect(getCompactedLocation(0, 2)).toBe(-1);
    expect(getCompactedLocation(1, 2)).toBe(0);
  });

  test('three elements are symmetric around 0: -1, 0, 1', () => {
    expect(getCompactedLocation(0, 3)).toBe(-1);
    expect(getCompactedLocation(1, 3)).toBe(0);
    expect(getCompactedLocation(2, 3)).toBe(1);
  });

  test('four elements are symmetric: -2, -1, 0, 1', () => {
    expect(getCompactedLocation(0, 4)).toBe(-2);
    expect(getCompactedLocation(1, 4)).toBe(-1);
    expect(getCompactedLocation(2, 4)).toBe(0);
    expect(getCompactedLocation(3, 4)).toBe(1);
  });

  test('center of odd-length array is always 0', () => {
    expect(getCompactedLocation(1, 3)).toBe(0);
    expect(getCompactedLocation(2, 5)).toBe(0);
    expect(getCompactedLocation(3, 7)).toBe(0);
  });
});

describe('fit', () => {
  const baseConfig: Config = {
    dataFormat: 'array',
    eventField: 'id',
    actorArrayField: 'a',
    generationAmt: 2,
    populationSize: 5,
  };

  test('returns defined result with valid input', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    const result = fit(sg.processedData, sg.config);
    expect(result).toBeDefined();
  });

  test('returned events array is non-empty', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    const result = fit(sg.processedData, sg.config)!;
    expect(result.events.length).toBeGreaterThan(0);
  });

  test('returned events do not exceed input event count', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    const result = fit(sg.processedData, sg.config)!;
    expect(result.events.length).toBeLessThanOrEqual(sg.processedData.events.length);
  });

  test('preserves the actors map from input', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    const result = fit(sg.processedData, sg.config)!;
    expect(result.actors).toBe(sg.processedData.actors);
  });

  test('each returned event has a populated state array', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    const result = fit(sg.processedData, sg.config)!;
    result.events.forEach(event => {
      expect(Array.isArray(event.state)).toBe(true);
      expect(event.state.length).toBeGreaterThan(0);
    });
  });

  test('each returned event has a switch array', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    const result = fit(sg.processedData, sg.config)!;
    result.events.forEach(event => {
      expect(Array.isArray(event.switch)).toBe(true);
    });
  });

  test('compact mode: state arrays are non-empty', () => {
    const sg = new Storygram(testArrayData(), {...baseConfig, compact: true});
    const result = fit(sg.processedData, sg.config)!;
    result.events.forEach(event => {
      expect(event.state.length).toBeGreaterThan(0);
    });
  });

  test('expanded mode: state length is constant across events', () => {
    const sg = new Storygram(testArrayData(), {...baseConfig, compact: false});
    const result = fit(sg.processedData, sg.config)!;
    const stateLength = result.events[0].state.length;
    result.events.forEach(event => {
      expect(event.state.length).toBe(stateLength);
    });
  });

  test('all actors in event state are known actors', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    const result = fit(sg.processedData, sg.config)!;
    result.events.forEach(event => {
      event.state.forEach(actorID => {
        expect(result.actors.has(actorID)).toBe(true);
      });
    });
  });
});
