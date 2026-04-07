import DrawSpec from '../src/DrawSpec';
import {fit} from '../src/Optimizer';
import {Data, Event, Actor, RenderedPoint, FullConfig} from '../src/Types';
import Storygram from '../src/Storygram';
import {Config} from '../src/Types';
import {testArrayData} from './testData';

// jsdom does not implement SVGElement.getBBox — provide a stub so drawD3 can run
beforeAll(() => {
  // @ts-ignore
  if (typeof SVGElement !== 'undefined') {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({x: 0, y: 0, width: 100, height: 20}),
    });
  }
});

// ─── helpers ────────────────────────────────────────────────────────────────

function makeActor(id: string, events: Event[]): Actor {
  const a = new Actor(id, {});
  a.layers = events;
  return a;
}

/**
 * Minimal two-event, two-actor dataset with state arrays already populated
 * (createGrid requires state to be set, which normally happens inside fit).
 */
function createSimpleData(): Data {
  const e0 = new Event(0, 0, {});
  e0.add = ['a', 'b'];
  e0.remove = [];
  e0.group = ['a', 'b'];
  e0.state = ['a', 'b'];
  e0.hiddenActors = [];

  const e1 = new Event(1, 1, {});
  e1.add = [];
  e1.remove = ['a', 'b'];
  e1.group = ['a', 'b'];
  e1.state = ['a', 'b'];
  e1.hiddenActors = [];

  const actors = new Map<string, Actor>();
  actors.set('a', makeActor('a', [e0, e1]));
  actors.set('b', makeActor('b', [e0, e1]));

  return {events: [e0, e1], actors};
}

function createConfig(overrides: Partial<FullConfig> = {}): FullConfig {
  return {
    dataFormat: 'array',
    actorArrayField: 'a',
    uid: 'test-uid',
    verbose: false,
    colorScheme: 'schemeAccent',
    lineSize: 9,
    eventDescription: l => String(l.eventValue),
    url: () => '',
    eventUrl: () => '',
    urlOpensNewTab: true,
    marginTop: 50, marginBottom: 50, marginLeft: 50, marginRight: 50,
    actorPadding: 30, eventPadding: 40,
    eventValueScaling: 0,   // xDrawn = pure event index
    generationAmt: 1, populationSize: 5,
    continuous: false, compact: false,
    highlight: [],
    strokeWidth: () => 1,
    actorColor: (_e, actor) => actor.actorID,
    mustContain: [], shouldContain: [],
    interactedWith: [[], 0],
    filterEventValue: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    filterGroupSize: [0, Number.MAX_SAFE_INTEGER],
    filterEventCustom: () => true,
    filterActorCustom: () => true,
    filterEventValueLifeTime: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    filterGroupAmt: [0, Number.MAX_SAFE_INTEGER],
    linearLoss: 1, amtLoss: 1, lengthLoss: 1, yExtentLoss: 0,
    root: 'body',
    tooltipPosition: 'absolute',
    hiddenActorsTooltipTitle: 'Hidden actors',
    selectionRate: 0.25, selectionSeverity: 8, mutationProbability: 0.025,
    inferredEventType: 'number',
    ...overrides,
  } as FullConfig;
}

// ─── createGrid ─────────────────────────────────────────────────────────────

describe('DrawSpec.createGrid', () => {
  test('returns a tuple [RenderedPoint[], xLen, maxYLen]', () => {
    const [points, xLen, maxYLen] = DrawSpec.createGrid(createSimpleData(), createConfig());
    expect(Array.isArray(points)).toBe(true);
    expect(typeof xLen).toBe('number');
    expect(typeof maxYLen).toBe('number');
  });

  test('xLen equals the number of events', () => {
    const [, xLen] = DrawSpec.createGrid(createSimpleData(), createConfig());
    expect(xLen).toBe(2);
  });

  test('maxYLen equals the maximum state length across events', () => {
    const [, , maxYLen] = DrawSpec.createGrid(createSimpleData(), createConfig());
    expect(maxYLen).toBe(2);
  });

  test('creates one point per active actor per event', () => {
    // 2 events × 2 actors, all active → 4 points
    const [points] = DrawSpec.createGrid(createSimpleData(), createConfig());
    expect(points.length).toBe(4);
  });

  test('every point is a RenderedPoint instance', () => {
    const [points] = DrawSpec.createGrid(createSimpleData(), createConfig());
    points.forEach(p => expect(p).toBeInstanceOf(RenderedPoint));
  });

  test('non-compact mode: y equals actor index', () => {
    const [points] = DrawSpec.createGrid(createSimpleData(), createConfig({compact: false}));
    const atEvent0 = points.filter(p => p.x === 0);
    expect(atEvent0.find(p => p.z === 'a')!.y).toBe(0);
    expect(atEvent0.find(p => p.z === 'b')!.y).toBe(1);
  });

  test('compact mode: y coordinates are centred around 0', () => {
    const [points] = DrawSpec.createGrid(createSimpleData(), createConfig({compact: true}));
    const atEvent0 = points.filter(p => p.x === 0);
    expect(atEvent0.find(p => p.z === 'a')!.y).toBe(-1);
    expect(atEvent0.find(p => p.z === 'b')!.y).toBe(0);
  });

  test('grouped actors have isGrouped = 1', () => {
    const [points] = DrawSpec.createGrid(createSimpleData(), createConfig());
    points.forEach(p => expect(p.isGrouped).toBe(1));
  });

  test('ungrouped but active actors have isGrouped = 0', () => {
    // e1 only groups 'a'; 'b' is in state but not group
    const e0 = new Event(0, 0, {});
    e0.add = ['a', 'b']; e0.remove = []; e0.group = ['a', 'b'];
    e0.state = ['a', 'b']; e0.hiddenActors = [];

    const e1 = new Event(1, 1, {});
    e1.add = []; e1.remove = []; e1.group = ['a'];
    e1.state = ['a', 'b']; e1.hiddenActors = [];

    const e2 = new Event(2, 2, {});
    e2.add = []; e2.remove = ['a', 'b']; e2.group = ['a', 'b'];
    e2.state = ['a', 'b']; e2.hiddenActors = [];

    const actors = new Map<string, Actor>();
    actors.set('a', makeActor('a', [e0, e1, e2]));
    actors.set('b', makeActor('b', [e0, e1, e2]));

    const [points] = DrawSpec.createGrid({events: [e0, e1, e2], actors}, createConfig({continuous: true}));
    const bAtE1 = points.find(p => p.x === 1 && p.z === 'b');
    expect(bAtE1).toBeDefined();
    expect(bAtE1!.isGrouped).toBe(0);
  });

  test('highlighted actors have isHighlighted = 1, others 0', () => {
    const [points] = DrawSpec.createGrid(createSimpleData(), createConfig({highlight: ['a']}));
    points.filter(p => p.z === 'a').forEach(p => expect(p.isHighlighted).toBe(1));
    points.filter(p => p.z === 'b').forEach(p => expect(p.isHighlighted).toBe(0));
  });

  test('repeated eventValue shows "-" as the legend label', () => {
    // Three events: e0(value=0), e1(value=1), e2(value=1 again — duplicate)
    // Actors are NOT removed until e2 so they stay active across all events.
    const e0 = new Event(0, 0, {});
    e0.add = ['a', 'b']; e0.remove = []; e0.group = ['a', 'b'];
    e0.state = ['a', 'b']; e0.hiddenActors = [];

    const e1 = new Event(1, 1, {});
    e1.add = []; e1.remove = []; e1.group = ['a', 'b'];
    e1.state = ['a', 'b']; e1.hiddenActors = [];

    // same eventValue as e1 — should render as '-'
    const e2 = new Event(1, 2, {});
    e2.add = []; e2.remove = ['a', 'b']; e2.group = ['a', 'b'];
    e2.state = ['a', 'b']; e2.hiddenActors = [];

    const actors = new Map<string, Actor>();
    actors.set('a', makeActor('a', [e0, e1, e2]));
    actors.set('b', makeActor('b', [e0, e1, e2]));

    const [points] = DrawSpec.createGrid({events: [e0, e1, e2], actors}, createConfig());
    const atE2 = points.filter(p => p.x === 2);
    expect(atE2.length).toBeGreaterThan(0);
    expect(atE2[0].eventValue).toBe('-');
  });

  test('eventDescription from config is used for each point', () => {
    const desc = (e: Event) => 'desc-' + String(e.eventValue);
    const [points] = DrawSpec.createGrid(createSimpleData(), createConfig({eventDescription: desc}));
    expect(points[0].eventDescription).toBe('desc-0');
  });

  test('actor not yet grouped is excluded (continuous=false)', () => {
    // 'b' is added only at e1 — at e0 it should not be rendered
    const e0 = new Event(0, 0, {});
    e0.add = ['a']; e0.remove = []; e0.group = ['a'];
    e0.state = ['a', 'b']; e0.hiddenActors = [];

    const e1 = new Event(1, 1, {});
    e1.add = ['b']; e1.remove = ['a', 'b']; e1.group = ['a', 'b'];
    e1.state = ['a', 'b']; e1.hiddenActors = [];

    const actors = new Map<string, Actor>();
    actors.set('a', makeActor('a', [e0, e1]));
    actors.set('b', makeActor('b', [e0, e1]));

    const [points] = DrawSpec.createGrid({events: [e0, e1], actors}, createConfig({continuous: false}));
    expect(points.filter(p => p.x === 0 && p.z === 'b').length).toBe(0);
    expect(points.filter(p => p.x === 1 && p.z === 'b').length).toBe(1);
  });
});

// ─── remove ─────────────────────────────────────────────────────────────────

describe('DrawSpec.remove', () => {
  test('does not throw when element does not exist', () => {
    expect(() => DrawSpec.remove(createConfig({uid: 'nonexistent'}))).not.toThrow();
  });

  test('removes SVG element created by drawD3', () => {
    const config = createConfig({uid: 'rmtest'});
    const data = createSimpleData();
    const fittedData = fit(data, config)!;
    const grid = DrawSpec.createGrid(fittedData, config);

    DrawSpec.drawD3(grid, config);
    expect(document.getElementById('storygram' + config.uid)).not.toBeNull();

    DrawSpec.remove(config);
    expect(document.getElementById('storygram' + config.uid)).toBeNull();
  });
});

// ─── drawD3 ─────────────────────────────────────────────────────────────────

describe('DrawSpec.drawD3', () => {
  afterEach(() => {
    // clean up any SVGs written to the body between tests
    document.body.innerHTML = '';
  });

  /**
   * buildRenderedGrid runs the full pipeline (preprocess → filter → fit → createGrid)
   * and returns both the rendered grid and the resolved FullConfig so tests can
   * inspect dimensions, pass the same config to drawD3, etc.
   */
  function buildRenderedGrid() {
    const sgConfig: Config = {
      dataFormat: 'array',
      eventField: 'id',
      actorArrayField: 'a',
      generationAmt: 2,
      populationSize: 5,
    };
    const sg = new Storygram(testArrayData(), sgConfig);
    const fittedData = fit(sg.processedData, sg.config)!;
    const grid = DrawSpec.createGrid(fittedData, sg.config);
    return {grid, config: sg.config};
  }

  test('appends an SVG element to the root', () => {
    const {grid, config} = buildRenderedGrid();
    DrawSpec.drawD3(grid, config);
    expect(document.getElementById('storygram' + config.uid)).not.toBeNull();
  });

  test('appends a tooltip element to the root', () => {
    const {grid, config} = buildRenderedGrid();
    DrawSpec.drawD3(grid, config);
    expect(document.getElementById('tooltip' + config.uid)).not.toBeNull();
  });

  test('SVG has the correct width and height attributes', () => {
    const {grid, config} = buildRenderedGrid();
    DrawSpec.drawD3(grid, config);

    const svg = document.getElementById('storygram' + config.uid) as unknown as SVGElement;
    const [, xLen, maxYLen] = grid;
    expect(Number(svg.getAttribute('width'))).toBe(
      xLen * config.eventPadding + config.marginLeft + config.marginRight
    );
    expect(Number(svg.getAttribute('height'))).toBe(
      maxYLen * config.actorPadding + config.marginTop + config.marginBottom
    );
  });

  test('calling drawD3 a second time with the same uid reuses the existing SVG', () => {
    const {grid, config} = buildRenderedGrid();
    DrawSpec.drawD3(grid, config);
    DrawSpec.drawD3(grid, config);
    const svgs = document.querySelectorAll('#storygram' + config.uid);
    expect(svgs.length).toBe(1);
  });
});
