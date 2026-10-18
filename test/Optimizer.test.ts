import {fit, getCompactedLocation} from '../src/Optimizer';
import Storygram from '../src/Storygram';
import {Config} from '../src/Types';
import {buildLayout, layoutMetrics, visibleActors} from '../src/Layout';
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
  };

  test('extended event bars are enabled by default', () => {
    const sg = new Storygram(testArrayData(), baseConfig);
    expect(sg.config.extendEventBar).toBe(true);
  });

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

  test('compact mode: state arrays are non-empty', () => {
    const sg = new Storygram(testArrayData(), {...baseConfig, compact: true});
    const result = fit(sg.processedData, sg.config)!;
    result.events.forEach(event => {
      expect(event.state.length).toBeGreaterThan(0);
    });
  });

  test('compact mode: layout is deterministic across runs', () => {
    const layout = () => {
      const sg = new Storygram(testArrayData(), {...baseConfig, compact: true});
      const result = fit(sg.processedData, sg.config)!;
      return result.events.map(event => event.state);
    };
    expect(layout()).toEqual(layout());
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

  test('global order removes crossings in both modes when compaction is disabled', () => {
    [true, false].forEach(compact => {
      const sg = new Storygram(testArrayData(), {
        ...baseConfig,
        compact,
        extendEventBar: true,
        groupSpanLoss: 0,
      });
      const result = fit(sg.processedData, sg.config)!;
      const layout = buildLayout(result, sg.config);
      expect(layoutMetrics(layout).crossings).toBe(0);
    });
  });

  test('expanded mode draws every common line horizontally when compaction is disabled', () => {
    const sg = new Storygram(testArrayData(), {
      ...baseConfig,
      compact: false,
      extendEventBar: true,
      groupSpanLoss: 0,
    });
    const result = fit(sg.processedData, sg.config)!;
    const layout = buildLayout(result, sg.config);
    const metrics = layoutMetrics(layout);
    expect(metrics.total).toBeGreaterThan(0);
    expect(metrics.horizontal).toBe(metrics.total);
    expect(metrics.moved).toBe(0);
  });

  test('compact mode keeps necessary movement but not more than the baseline', () => {
    const compactConfig = {...baseConfig, compact: true, groupSpanLoss: 0};
    const baseline = new Storygram(testArrayData(), compactConfig);
    const baselineLayout = buildLayout(
      baseline.processedData,
      baseline.config,
      visibleActors(baseline.processedData),
    );
    const baselineMetrics = layoutMetrics(baselineLayout);

    const sg = new Storygram(testArrayData(), compactConfig);
    const result = fit(sg.processedData, sg.config)!;
    const layout = buildLayout(result, sg.config);
    const metrics = layoutMetrics(layout);

    expect(metrics.moved).toBeGreaterThan(0);
    expect(metrics.moved).toBeLessThanOrEqual(baselineMetrics.moved);
    expect(metrics.distance).toBeLessThanOrEqual(baselineMetrics.distance);
  });

  test('optimized order does not increase group span over first appearance', () => {
    const compactConfig = {...baseConfig, compact: false};
    const baseline = new Storygram(testArrayData(), compactConfig);
    const baselineLayout = buildLayout(
      baseline.processedData,
      baseline.config,
      visibleActors(baseline.processedData),
    );
    const baselineMetrics = layoutMetrics(baselineLayout);

    const sg = new Storygram(testArrayData(), compactConfig);
    const result = fit(sg.processedData, sg.config)!;
    const layout = buildLayout(result, sg.config);
    const metrics = layoutMetrics(layout);

    expect(metrics.groupSpan).toBeLessThanOrEqual(baselineMetrics.groupSpan);
  });

  test('participant-only bars place every event group contiguously', () => {
    const sg = new Storygram(testArrayData(), {
      ...baseConfig,
      compact: false,
      extendEventBar: false,
    });
    const result = fit(sg.processedData, sg.config)!;

    result.events.forEach(event => {
      const group = event.group.filter(actorID => {
        const actor = result.actors.get(actorID);
        return actor && !actor.isHidden;
      });
      if (group.length < 2) return;

      const positions = group.map(actorID => event.state.indexOf(actorID));
      positions.forEach(position => expect(position).toBeGreaterThanOrEqual(0));

      const min = Math.min(...positions);
      const max = Math.max(...positions);
      expect(max - min).toBe(group.length - 1);

      for (let position = min; position <= max; position++) {
        expect(group).toContain(event.state[position]);
      }
    });
  });

  test('participant-only bars are deterministic', () => {
    const run = () => {
      const sg = new Storygram(testArrayData(), {
        ...baseConfig,
        compact: false,
        extendEventBar: false,
      });
      const result = fit(sg.processedData, sg.config)!;
      return result.events.map(event => event.state);
    };

    expect(run()).toEqual(run());
  });

  test('compact participant-only bars keep each event group contiguous', () => {
    const sg = new Storygram(testArrayData(), {
      ...baseConfig,
      compact: true,
      extendEventBar: false,
    });
    const result = fit(sg.processedData, sg.config)!;

    result.events.forEach(event => {
      const group = event.group.filter(actorID => {
        const actor = result.actors.get(actorID);
        return actor && !actor.isHidden;
      });
      if (group.length < 2) return;

      const positions = group.map(actorID => event.state.indexOf(actorID));
      positions.forEach(position => expect(position).toBeGreaterThanOrEqual(0));

      const min = Math.min(...positions);
      const max = Math.max(...positions);
      expect(max - min).toBe(group.length - 1);

      for (let position = min; position <= max; position++) {
        expect(group).toContain(event.state[position]);
      }
    });
  });

  test('compact mode responds to extendEventBar', () => {
    const run = (extendEventBar: boolean) => {
      const sg = new Storygram(testArrayData(), {
        ...baseConfig,
        compact: true,
        extendEventBar,
      });
      const result = fit(sg.processedData, sg.config)!;
      return result.events.map(event => event.state);
    };

    expect(run(false)).not.toEqual(run(true));
  });

  test('weighted compaction trades straightness for tighter groups', () => {
    const run = (config: Config) => {
      const sg = new Storygram(testArrayData(), config);
      const result = fit(sg.processedData, sg.config)!;
      return layoutMetrics(buildLayout(result, sg.config));
    };

    const straight = run({
      ...baseConfig,
      compact: false,
      extendEventBar: true,
      linearLoss: 1000,
      lengthLoss: 1000,
      groupSpanLoss: 2,
    });
    const tight = run({
      ...baseConfig,
      compact: false,
      extendEventBar: true,
      linearLoss: 0,
      lengthLoss: 0,
      groupSpanLoss: 100,
    });

    expect(tight.groupSpan).toBeLessThan(straight.groupSpan);
    expect(tight.moved).toBeGreaterThan(straight.moved);
  });

  test('higher linearLoss does not increase compact movement', () => {
    const run = (linearLoss: number) => {
      const sg = new Storygram(testArrayData(), {
        ...baseConfig,
        compact: true,
        linearLoss,
        lengthLoss: linearLoss,
        groupSpanLoss: 2,
      });
      const result = fit(sg.processedData, sg.config)!;
      return layoutMetrics(buildLayout(result, sg.config));
    };

    const loose = run(0);
    const strict = run(1000);

    expect(strict.moved).toBeLessThanOrEqual(loose.moved);
    expect(strict.distance).toBeLessThanOrEqual(loose.distance);
  });
});
