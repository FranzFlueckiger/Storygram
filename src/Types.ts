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
  // should information be shown on the console
  verbose: boolean;
  // name of the vega color scheme (more info at https://vega.github.io/vega/docs/schemes/)
  colorScheme:
  | 'accent'
  | 'category10'
  | 'category20'
  | 'category20b'
  | 'category20c'
  | 'dark2'
  | 'paired'
  | 'pastel1'
  | 'pastel2'
  | 'set1'
  | 'set2'
  | 'set3'
  | 'tableau10'
  | 'tableau20'
  | 'blues'
  | 'tealblues'
  | 'teals'
  | 'greens'
  | 'browns'
  | 'oranges'
  | 'reds'
  | 'purples'
  | 'warmgreys'
  | 'greys'
  | 'viridis'
  | 'magma'
  | 'inferno'
  | 'plasma'
  | 'bluegreen'
  | 'bluepurple'
  | 'goldgreen'
  | 'goldorange'
  | 'goldred'
  | 'greenblue'
  | 'orangered'
  | 'purplebluegreen'
  | 'purpleblue'
  | 'purplered'
  | 'redpurple'
  | 'yellowgreenblue'
  | 'yellowgreen'
  | 'yelloworangebrown'
  | 'yelloworangered'
  | 'darkblue'
  | 'darkgold'
  | 'darkgreen'
  | 'darkmulti'
  | 'darkred'
  | 'lightgreyred'
  | 'lightgreyteal'
  | 'lightmulti'
  | 'lightorange'
  | 'lighttealblue'
  | 'blueorange'
  | 'brownbluegreen'
  | 'purplegreen'
  | 'pinkyellowgreen'
  | 'purpleorange'
  | 'redblue'
  | 'redgrey'
  | 'redyellowblue'
  | 'redyellowgreen'
  | 'spectral'
  | 'rainbow'
  | 'sinebow';
  // split function for the actor fields, is useful when one string contains e.g. many actors separated by a string
  actorSplitFunction?: ( ( arg: string ) => string[] ) | undefined;
  // function that returns a string describing the selected event
  eventDescription: ( arg: Event ) => string;
  // link to a desired url from the group nodes
  url: ( event: Event, actor: Actor ) => string;
  // padding between the actors
  actorPadding: number;
  // padding between the events
  eventPadding: number;
  // the line size of the lines and ticks
  lineSize: number;
  // event value scaling factor (0 has no effect, 1 has 100% effect)
  eventValueScaling: number;
  // amount of consecutive Generations to be evaluated
  generationAmt: number;
  // Size of one generation
  populationSize: number;
  // Selection rate for the next generation
  selectionRate: number;
  // How much are better scored childs preferred
  selectionSeverity: number;
  // probability that a gene mutates (value between 0 and 1)
  mutationProbability: number;
  // whether the y-points start at the beginning or at the first grouping
  continuousStart: boolean;
  // whether the y-points go until the end or until the last grouping
  continuousEnd: boolean;
  // whether the graph is compacted or not
  compact: boolean;
  // which actors should be highlighted
  highlight: string[];
  // numeric field that determines the stroke width
  strokeWidth: ( event: Event, actor: Actor ) => number;
  // numeric field that determines the stroke width
  strokeColor: ( event: Event, actor: Actor ) => string | number;
  // function that returns a string describing the actor
  tooltipText?: ( arg: Event ) => string;
  // check if the event contains all the given actors
  mustContain: string[];
  // check if the event contains one of the given actors
  shouldContain: string[];
  // event filter (positive and Negative event ranges possible)
  filterEventValue: [ number | undefined, number | undefined ];
  // event filter (positive group sizes only)
  filterGroupSize: [ number | undefined, number | undefined ];
  // event filter for boolean predicates
  filterEventCustom: ( event: Event ) => boolean;
  // check if the actors interacted with the given ones at the specified depth
  interactedWith: [ string[], number | undefined ];
  // actor filter (Positive and Negative event value lifetimes possible)
  filterEventValueLifeTime: [ number | undefined, number | undefined ];
  // actor filter (Positive group amounts only)
  filterGroupAmt: [ number | undefined, number | undefined ];
  // actor filter for boolean predicates
  filterActorCustom: ( actor: Actor ) => boolean;
  // Penalty for changing actor's position from one layer to the other
  linearLoss: number;
  // Penalty for the amount of switches
  amtLoss: number;
  // Penalty for the length of the switches
  lengthLoss: number;
  // Penalty for the y extent of the chart
  yExtentLoss: number;
}

export type Config = Partial<BaseConfig> & ( RangeData | ArrayData | TableData );

export type FullConfig = BaseConfig & ( RangeData | ArrayData | TableData );

export class Event {
  public id?: number;

  public index?: number;

  public isHidden: boolean;

  public add: string[];

  public remove: string[];

  public group: string[];

  public state: string[];

  public switch: Switch[] = [];

  public hiddenActors: string[];

  public constructor ( public eventValue: number, public data: Record<string, unknown> ) {
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

  public constructor ( public actorID: string, public data: Record<string, unknown> ) {
    this.isHidden = false;
    this.layers = [];
  }
}

export interface Child {
  loss: number;
  gene: GenePool;
  events: EventData;
}

export interface Switch {
  target: number;
  prev: number;
}

export interface Distance {
  p: string;
  distance: number;
}

export type GenePool = Map<string, number>;

export type EventData = Event[];

export type YData = Map<string, Actor>;

export interface Data {
  events: EventData;
  actors: YData;
}

export class RenderedPoint {
  public pointsX: [] = [];

  public pointsY: [] = [];

  public pointsBool: [] = [];

  public pointsSize: [] = [];

  public hiddenYs: string[] = [];

  public hiddenYsAmt: number = 0;

  public constructor (
    public x: number,
    public y: number,
    public z: string,
    public isGrouped: number,
    public strokeWidth: number,
    public strokeColor: number | string,
    public eventValue: number | string,
    public eventDescription: string,
    public url: string,
    public isHighlighted: number
  ) { }
}
