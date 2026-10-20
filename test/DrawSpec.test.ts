import { createGrid, drawD3, remove } from '../src/DrawSpec';
import {fit} from '../src/Optimizer';
import {buildLayout} from '../src/Layout';
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
    // jsdom does not implement SVG transform lists, which d3 transitions need.
    Object.defineProperty(SVGElement.prototype, 'transform', {
      configurable: true,
      get: () => ({
        baseVal: {
          consolidate: () => ({
            matrix: {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0},
          }),
        },
      }),
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
    continuous: false, compact: false, extendEventBar: false,
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
    inferredEventType: 'number',
    ...overrides,
  } as FullConfig;
}

// ─── createGrid ─────────────────────────────────────────────────────────────

describe('createGrid', () => {
  test('returns a tuple [RenderedPoint[], xLen, maxYLen]', () => {
    const [points, xLen, maxYLen] = createGrid(createSimpleData(), createConfig());
    expect(Array.isArray(points)).toBe(true);
    expect(typeof xLen).toBe('number');
    expect(typeof maxYLen).toBe('number');
  });

  test('xLen equals the number of events', () => {
    const [, xLen] = createGrid(createSimpleData(), createConfig());
    expect(xLen).toBe(2);
  });

  test('maxYLen equals the maximum state length across events', () => {
    const [, , maxYLen] = createGrid(createSimpleData(), createConfig());
    expect(maxYLen).toBe(2);
  });

  test('does not mutate the optimized event states', () => {
    const data = createSimpleData();
    const before = data.events.map(event => event.state.slice());
    createGrid(data, createConfig({compact: true}));
    expect(data.events.map(event => event.state)).toEqual(before);
  });

  test('rendered y matches the shared layout geometry', () => {
    const sg = new Storygram(testArrayData(), {
      dataFormat: 'array',
      eventField: 'id',
      actorArrayField: 'a',
      compact: true,
    });
    const fitted = fit(sg.processedData, sg.config)!;
    const layout = buildLayout(fitted, sg.config);
    const [points] = createGrid(fitted, sg.config);

    points.forEach(point => {
      const eventLayout = layout.events.find(entry => entry.event === point.event);
      expect(eventLayout).toBeDefined();
      expect(point.y).toBe(eventLayout!.y.get(point.z));
    });
  });

  test('creates one point per active actor per event', () => {
    // 2 events × 2 actors, all active → 4 points
    const [points] = createGrid(createSimpleData(), createConfig());
    expect(points.length).toBe(4);
  });

  test('every point is a RenderedPoint instance', () => {
    const [points] = createGrid(createSimpleData(), createConfig());
    points.forEach(p => expect(p).toBeInstanceOf(RenderedPoint));
  });

  test('non-compact mode: y equals actor index', () => {
    const [points] = createGrid(createSimpleData(), createConfig({compact: false}));
    const atEvent0 = points.filter(p => p.x === 0);
    expect(atEvent0.find(p => p.z === 'a')!.y).toBe(0);
    expect(atEvent0.find(p => p.z === 'b')!.y).toBe(1);
  });

  test('compact mode: y coordinates keep the block contiguous', () => {
    const [points] = createGrid(createSimpleData(), createConfig({compact: true}));
    const atEvent0 = points.filter(p => p.x === 0);
    expect(atEvent0.find(p => p.z === 'a')!.y).toBe(-1);
    expect(atEvent0.find(p => p.z === 'b')!.y).toBe(0);
  });

  test('grouped actors have isGrouped = 1', () => {
    const [points] = createGrid(createSimpleData(), createConfig());
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

    const [points] = createGrid({events: [e0, e1, e2], actors}, createConfig({continuous: true}));
    const bAtE1 = points.find(p => p.x === 1 && p.z === 'b');
    expect(bAtE1).toBeDefined();
    expect(bAtE1!.isGrouped).toBe(0);
  });

  test('highlighted actors have isHighlighted = 1, others 0', () => {
    const [points] = createGrid(createSimpleData(), createConfig({highlight: ['a']}));
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

    const [points] = createGrid({events: [e0, e1, e2], actors}, createConfig());
    const atE2 = points.filter(p => p.x === 2);
    expect(atE2.length).toBeGreaterThan(0);
    expect(atE2[0].eventValue).toBe('-');
  });

  test('eventDescription from config is used for each point', () => {
    const desc = (e: Event) => 'desc-' + String(e.eventValue);
    const [points] = createGrid(createSimpleData(), createConfig({eventDescription: desc}));
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

    const [points] = createGrid({events: [e0, e1], actors}, createConfig({continuous: false}));
    expect(points.filter(p => p.x === 0 && p.z === 'b').length).toBe(0);
    expect(points.filter(p => p.x === 1 && p.z === 'b').length).toBe(1);
  });

  test('assigns hidden actors to exactly one topmost point per event', () => {
    const data = createSimpleData();
    data.events[0].hiddenActors = ['x'];
    data.events[1].hiddenActors = ['y', 'z'];

    const [points] = createGrid(data, createConfig());
    const badges = points.filter(p => p.hiddenActors.length > 0);

    expect(badges).toHaveLength(2);
    expect(badges.filter(p => p.x === 0)).toHaveLength(1);
    expect(badges.filter(p => p.x === 1)).toHaveLength(1);
    expect(badges.find(p => p.x === 0)!.z).toBe('b');
    expect(badges.find(p => p.x === 0)!.hiddenActors).toEqual(['x']);
  });
});

// ─── remove ─────────────────────────────────────────────────────────────────

describe('remove', () => {
  test('does not throw when element does not exist', () => {
    expect(() => remove(createConfig({uid: 'nonexistent'}))).not.toThrow();
  });

  test('removes SVG element created by drawD3', () => {
    const config = createConfig({uid: 'rmtest'});
    const data = createSimpleData();
    const fittedData = fit(data, config)!;
    const grid = createGrid(fittedData, config);

    drawD3(grid, config);
    expect(document.getElementById('storygram' + config.uid)).not.toBeNull();

    remove(config);
    expect(document.getElementById('storygram' + config.uid)).toBeNull();
  });
});

// ─── drawD3 ─────────────────────────────────────────────────────────────────

describe('drawD3', () => {
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
    };
    const sg = new Storygram(testArrayData(), sgConfig);
    const fittedData = fit(sg.processedData, sg.config)!;
    const grid = createGrid(fittedData, sg.config);
    return {grid, config: sg.config};
  }

  test('appends an SVG element to the root', () => {
    const {grid, config} = buildRenderedGrid();
    drawD3(grid, config);
    expect(document.getElementById('storygram' + config.uid)).not.toBeNull();
  });

  test('appends a tooltip element to the root', () => {
    const {grid, config} = buildRenderedGrid();
    drawD3(grid, config);
    expect(document.getElementById('tooltip' + config.uid)).not.toBeNull();
  });

  test('SVG has the correct width and height attributes', () => {
    const {grid, config} = buildRenderedGrid();
    drawD3(grid, config);

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
    drawD3(grid, config);
    drawD3(grid, config);
    const svgs = document.querySelectorAll('#storygram' + config.uid);
    expect(svgs.length).toBe(1);
  });

  test('draws intersection markers for active actors at all their grouped events', () => {
    const config = createConfig({
      uid: 'marker-test',
      eventValueScaling: 0,
      compact: false,
      continuous: false,
      extendEventBar: false,
    });
    const fittedData = fit(createSimpleData(), config)!;
    drawD3(createGrid(fittedData, config), config);

    const svg = document.getElementById('storygram' + config.uid) as unknown as SVGSVGElement;
    const markers = Array.from(svg.querySelectorAll('.actorEvent'));
    expect(markers).toHaveLength(4);
    const xs = markers.map(marker => Number(marker.getAttribute('x1'))).sort((a, b) => a - b);
    expect(xs).toEqual([0, 0, 80, 80]);
  });

  test('makes the whole actor label background clickable', () => {
    const {grid, config} = buildRenderedGrid();
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    drawD3(grid, config);

    const svg = document.getElementById('storygram' + config.uid) as unknown as SVGSVGElement;
    const background = svg.querySelector('.actorDescBackground') as SVGRectElement;
    expect(background).not.toBeNull();

    background.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(open).toHaveBeenCalled();
    open.mockRestore();
  });

  test('renders one positioned hidden-actor badge per event', () => {
    const data = createSimpleData();
    data.events[0].hiddenActors = ['x'];
    data.events[1].hiddenActors = ['y', 'z'];
    const config = createConfig({
      uid: 'badge-test',
      eventValueScaling: 0,
      compact: false,
      continuous: false,
      extendEventBar: false,
    });
    const fittedData = fit(data, config)!;
    drawD3(createGrid(fittedData, config), config);

    const badges = Array.from(document.querySelectorAll('.hiddenActorsBadge'));
    expect(badges).toHaveLength(2);
    badges.forEach(badge => expect(badge.getAttribute('transform')).toMatch(/^translate\(/));

    expect(document.querySelectorAll('.hiddenActorsBadgeBg')).toHaveLength(0);

    const texts = Array.from(document.querySelectorAll('.hiddenActorsBadgeText'))
      .map(node => node.textContent)
      .sort();
    expect(texts).toEqual(['1', '2']);
  });

  test('does not change the selection when hovering a clickable label', async () => {
    const config = createConfig({
      uid: 'label-hover-test',
      eventValueScaling: 0,
      compact: false,
      continuous: false,
      extendEventBar: false,
    });
    const fittedData = fit(createSimpleData(), config)!;
    drawD3(createGrid(fittedData, config), config);

    const svg = document.getElementById('storygram' + config.uid) as unknown as SVGSVGElement;
    const label = svg.querySelector('.event_desc') as SVGTextElement;
    const rule = svg.querySelector('.rule') as SVGLineElement;
    const waitForTransition = () => new Promise(resolve => setTimeout(resolve, 150));

    await waitForTransition();
    expect(Number(rule.getAttribute('x1'))).toBe(0);

    // Inside the plot horizontally, but the label owns the pointer.
    label.dispatchEvent(new MouseEvent('mousemove', {clientX: 75, clientY: 10, bubbles: true}));

    await waitForTransition();
    expect(Number(rule.getAttribute('x1'))).toBe(0);
  });

  test('does not change the selection for pointer moves outside the plot', async () => {
    const config = createConfig({
      uid: 'bounds-test',
      eventValueScaling: 0,
      compact: false,
      continuous: false,
      extendEventBar: false,
    });
    const fittedData = fit(createSimpleData(), config)!;
    drawD3(createGrid(fittedData, config), config);

    const svg = document.getElementById('storygram' + config.uid) as unknown as SVGElement;
    const rule = svg.querySelector('.rule') as SVGLineElement;
    const waitForTransition = () => new Promise(resolve => setTimeout(resolve, 150));

    await waitForTransition();
    expect(Number(rule.getAttribute('x1'))).toBe(0);

    // x is close to the next event, but y is above the plot where event_desc lives.
    svg.dispatchEvent(new MouseEvent('mousemove', {clientX: 75, clientY: -10, bubbles: true}));

    await waitForTransition();
    expect(Number(rule.getAttribute('x1'))).toBe(0);
  });
});

// ─── rewrite contract ───────────────────────────────────────────────────────

describe('renderer contract', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const waitForTransition = () => new Promise(resolve => setTimeout(resolve, 150));

  function drawSimple(overrides: Partial<FullConfig> = {}) {
    const config = createConfig({
      uid: 'render-test',
      eventValueScaling: 0,
      compact: false,
      continuous: false,
      extendEventBar: false,
      ...overrides,
    });
    const fittedData = fit(createSimpleData(), config)!;
    drawD3(createGrid(fittedData, config), config);
    return {
      config,
      svg: document.getElementById('storygram' + config.uid) as unknown as SVGSVGElement,
    };
  }

  test('drawing twice reuses every layer and mark', () => {
    const {config} = drawSimple();
    drawD3(createGrid(fit(createSimpleData(), config)!, config), config);

    expect(document.querySelectorAll('#storygram' + config.uid)).toHaveLength(1);
    expect(document.querySelectorAll('#layer1-' + config.uid)).toHaveLength(1);
    expect(document.querySelectorAll('#layer2-' + config.uid)).toHaveLength(1);
    expect(document.querySelectorAll('.actor')).toHaveLength(2);
    expect(document.querySelectorAll('.group')).toHaveLength(2);
  });

  test('re-rendering with new dimensions updates the svg size', () => {
    const first = drawSimple({uid: 'resize-test', eventPadding: 40});
    expect(Number(first.svg.getAttribute('width'))).toBe(2 * 40 + 100);

    const config = {...first.config, eventPadding: 100};
    const fittedData = fit(createSimpleData(), config)!;
    drawD3(createGrid(fittedData, config), config);

    expect(Number(first.svg.getAttribute('width'))).toBe(2 * 100 + 100);
  });

  test('initial selection geometry is present without a second render', async () => {
    const {svg} = drawSimple({uid: 'initial-test'});
    expect(Number(svg.querySelector('.rule')!.getAttribute('x1'))).toBe(0);
    expect(svg.querySelector('.event_desc')!.textContent).toBe('0');
    expect(svg.querySelectorAll('.actorEvent')).toHaveLength(4);

    await waitForTransition();
  });

  test('mousemove selects the nearest event from left to right', async () => {
    const {svg} = drawSimple({uid: 'move-test'});
    const rule = svg.querySelector('.rule') as SVGLineElement;
    await waitForTransition();

    svg.dispatchEvent(new MouseEvent('mousemove', {clientX: 75, clientY: 10, bubbles: true}));
    await waitForTransition();
    expect(Number(rule.getAttribute('x1'))).toBe(80);

    svg.dispatchEvent(new MouseEvent('mousemove', {clientX: 5, clientY: 10, bubbles: true}));
    await waitForTransition();
    expect(Number(rule.getAttribute('x1'))).toBe(0);
  });

  test('the selected event connector stays transparent', async () => {
    const {svg} = drawSimple({uid: 'group-opacity-test'});
    await waitForTransition();
    svg.querySelectorAll('.group').forEach(group => {
      expect(group.getAttribute('opacity')).toBe('0.25');
    });
  });

  test('highlighted actor lanes use the previous dashed style', () => {
    const {svg} = drawSimple({uid: 'highlight-style-test', highlight: ['a']});
    const highlight = svg.querySelector('.actorHighlighted') as SVGPathElement;

    expect(highlight.getAttribute('stroke-linecap')).toBe('butt');
    expect(highlight.style.strokeDasharray).toBe('2,5');
  });

  test('hovering an actor label adds and removes its highlighted overlay', () => {
    const {svg} = drawSimple({uid: 'highlight-test'});
    const label = svg.querySelector('.actorDesc') as SVGTextElement;

    expect(document.querySelectorAll('.actorHighlighted')).toHaveLength(0);
    label.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    expect(document.querySelectorAll('.actorHighlighted')).toHaveLength(1);

    label.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
    expect(document.querySelectorAll('.actorHighlighted')).toHaveLength(0);
  });

  test('configured highlights survive a label mouseout', () => {
    const {svg} = drawSimple({uid: 'keep-highlight-test', highlight: ['a']});
    const label = Array.from(svg.querySelectorAll('.actorDesc'))
      .find(node => node.textContent === 'a') as SVGTextElement;

    expect(document.querySelectorAll('.actorHighlighted')).toHaveLength(1);
    label.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    label.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
    expect(document.querySelectorAll('.actorHighlighted')).toHaveLength(1);
  });

  test('remove cleans the svg and tooltip independently', () => {
    const {config} = drawSimple({uid: 'independent-remove-test'});
    document.getElementById('storygram' + config.uid)!.remove();
    expect(document.getElementById('tooltip' + config.uid)).not.toBeNull();

    remove(config);
    expect(document.getElementById('tooltip' + config.uid)).toBeNull();
  });

  test('empty and single-event grids do not throw', () => {
    const emptyConfig = createConfig({uid: 'empty-grid-test'});
    expect(() => drawD3([[], 0, 0], emptyConfig)).not.toThrow();
    expect(document.getElementById('storygram' + emptyConfig.uid)).not.toBeNull();
    expect(document.querySelectorAll('.actor')).toHaveLength(0);

    const singleConfig = createConfig({uid: 'single-grid-test'});
    const data = createSimpleData();
    data.events = [data.events[0]];
    data.actors.forEach(actor => {
      actor.layers = data.events;
    });
    const fittedData = fit(data, singleConfig)!;
    expect(() => drawD3(createGrid(fittedData, singleConfig), singleConfig)).not.toThrow();
  });

  test('hidden actor tooltip renders text instead of injecting html', () => {
    const config = createConfig({
      uid: 'tooltip-xss-test',
      hiddenActorsTooltipTitle: '<b>Hidden</b>',
    });
    const data = createSimpleData();
    data.events[0].hiddenActors = ['<img src=x onerror="window.__xss = true">'];
    const fittedData = fit(data, config)!;
    drawD3(createGrid(fittedData, config), config);

    const badge = document.querySelector('.hiddenActorsBadge') as SVGGElement;
    badge.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));

    const tooltip = document.getElementById('tooltip' + config.uid) as HTMLDivElement;
    expect(tooltip.querySelectorAll('img')).toHaveLength(0);
    expect(tooltip.querySelectorAll('b')).toHaveLength(1);
    expect(tooltip.textContent).toContain('<img src=x onerror="window.__xss = true">');
    expect((window as unknown as {__xss?: boolean}).__xss).toBeUndefined();
  });

  test('event and actor clicks open the configured urls', () => {
    const {svg} = drawSimple({
      uid: 'click-test',
      eventUrl: event => 'event-' + String(event.eventValue),
      url: (_event, actor) => 'actor-' + actor.actorID,
    });
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);

    (svg.querySelector('.event_desc') as SVGTextElement)
      .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(open).toHaveBeenCalledWith('event-0');

    (svg.querySelector('.actorDesc') as SVGTextElement)
      .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(open).toHaveBeenCalledWith('actor-a');

    open.mockRestore();
  });
});
