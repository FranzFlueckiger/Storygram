export interface RangeData {
  dataFormat: 'ranges';
  actorField: string;
  startField: string;
  endField: string;
}

export interface TableData {
  dataFormat: 'table';
  actorFields: string[];
  eventField?: string;
}

export interface ArrayData {
  dataFormat: 'array';
  eventField?: string;
  actorArrayField: string;
}

export interface BaseConfig {
  // unique identifier
  uid: string;
  // should information be shown on the console
  verbose: boolean;
  // name of the d3 color scheme
  colorScheme:
  | 'schemeCategory10' | 'schemeAccent' | 'schemeDark2' | 'schemePaired' | 'schemePastel1' | 'schemePastel2' | 'schemeSet1' | 'schemeSet2' | 'schemeSet3';
  // split function for the actor fields, is useful when one string contains e.g. many actors separated by a string
  actorSplitFunction?: ((arg: string | string[]) => string[]) | undefined;
  // function that returns a string describing the selected event
  eventDescription: (arg: Event) => string;
  // link to a desired url from the group nodes
  url: (event: Event, actor: Actor) => string;
  // link to a desired url from selected event
  eventUrl: (event: Event) => string
  // whether the url opens a new tab or not
  urlOpensNewTab: boolean,
  // top margin of the storygram
  marginTop: number,
  // bottom margin of the storygram
  marginBottom: number,
  // left margin of the storygram
  marginLeft: number,
  // right margin of the storygram
  marginRight: number,
  // padding between the actors
  actorPadding: number;
  // padding between the events
  eventPadding: number;
  // the line size of the lines and ticks
  lineSize: number;
  // event value scaling factor (0 has no effect, 1 has 100% effect)
  eventValueScaling: number;
  // whether the y-points start at the beginning or at the first grouping
  continuous: boolean;
  // how strongly actor lanes are compacted: 0 = fully open, 1 = fully compact
  compact: number;
  // when true, an event connector spans every actor between its outermost
  // participants; when false, participants are placed contiguously so the
  // connector only covers actors that appear in the event
  extendEventBar: boolean;
  // TODO which actors should be highlighted
  highlight: string[];
  // TODO numeric field that determines the stroke width
  strokeWidth: (event: Event, actor: Actor) => number;
  // numeric field that determines the stroke width
  actorColor: (event: Event, actor: Actor) => string | number;
  // TODO function that returns a string describing the actor
  tooltipText?: (arg: Event) => string;
  // check if the event contains all the given actors
  mustContain: string[];
  // check if the event contains one of the given actors
  shouldContain: string[];
  // event filter (positive and Negative event ranges possible)
  filterEventValue: [number | string | undefined, number | string | undefined];
  // event filter (positive group sizes only)
  filterGroupSize: [number | undefined, number | undefined];
  // event filter for boolean predicates
  filterEventCustom: (event: Event) => boolean;
  // TODO check if the actors interacted with the given ones at the specified depth
  interactedWith: [string[], number | undefined];
  // actor filter (Positive and Negative event value lifetimes possible)
  filterEventValueLifeTime: [number | string | undefined, number | string | undefined];
  // actor filter (Positive group amounts only)
  filterGroupAmt: [number | undefined, number | undefined];
  // actor filter for boolean predicates
  filterActorCustom: (actor: Actor) => boolean;
  // Penalty for every drawn line that is not horizontal
  linearLoss: number;
  // Penalty for actor-line crossings
  amtLoss: number;
  // Penalty for the vertical distance a line has to move
  lengthLoss: number;
  // Penalty for steep per-step moves in compact mode (squared excess beyond one lane)
  slopeLoss?: number;
  // Penalty per additional y step an event group spans beyond its contiguous block
  groupExtraSpanLoss?: number;
  // Deprecated: use groupExtraSpanLoss instead
  groupSpanLoss?: number;
  // Deprecated: retained for backwards compatibility
  yExtentLoss: number;
  // CSS-Selector indicating the DOM element to which the Storygram is appended
  root: string;
  //tooltip position 
  tooltipPosition: 'static' | 'relative' | 'absolute';
  // title of the tooltip showing the hidden actors
  hiddenActorsTooltipTitle: string;
  // automatically inferred data type of the first encountered (valid) event
  inferredEventType: InferredEventType
}

export type CompactValue = boolean | number;

export type Config = Partial<Omit<BaseConfig, 'compact'>> & {
  compact?: CompactValue;
} & (RangeData | ArrayData | TableData);

export type FullConfig = BaseConfig & (RangeData | ArrayData | TableData);

export class Event {
  // sequence number of the event of all visible events
  public index?: number;

  // whether the event is visible or not
  public isHidden: boolean;

  // which actors to add
  public add: string[];

  // which actors to remove
  public remove: string[];

  // which actors to group
  public group: string[];

  // which actors will be on this event, whether they are grouped or not
  public state: string[];

  // compact-layout state used to blend between open and compact layouts
  public compactState?: string[];

  // whitch actors are hidden
  public hiddenActors: string[];

  public constructor(public eventValue: number | string | undefined, public eventXValue: number, public data: Record<string, unknown>) {
    this.isHidden = false;
    this.add = [];
    this.remove = [];
    this.group = [];
    this.state = [];
    this.hiddenActors = [];
  }
}

export class Actor {
  public layers: Event[];

  public isHidden: boolean;

  public constructor(public actorID: string, public data: Record<string, unknown>) {
    this.isHidden = false;
    this.layers = [];
  }
}

export type Actors = Map<string, Actor>;

export interface Data {
  events: Event[];
  actors: Actors;
}

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class RenderedPoint {
  public hiddenActors: string[] = [];

  public bbox: BBox = { x: 0, y: 0, width: 0, height: 0 };

  public constructor(
    public x: number,
    public y: number,
    public z: string,
    public isGrouped: number,
    public strokeWidth: number,
    public strokeColor: number | string,
    public eventValue: number | string,
    public eventDescription: string,
    public url: string,
    public eventUrl: string,
    public isHighlighted: number,
    public actor: Actor,
    public event: Event
  ) { }
}

export type InferredEvent = {
  eventValue: number | string | undefined,
  eventXValue: number
}

export type InferredEventType = "index" | "number" | 'datestring' | 'numberstring' | undefined
