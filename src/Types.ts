export interface RangeData {
  dataFormat: 'ranges';
  yField: string;
  startField: string;
  endField: string;
}

export interface TableData {
  dataFormat: 'table';
  yFields: string[];
  xField?: string;
}

export interface ArrayData {
  dataFormat: 'array';
  xField?: string;
  yArrayField: string;
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
  // split function for the y fields
  splitFunction?: ((arg: string) => string[]) | undefined;
  // function that returns a string describing the selected x
  xDescription: (arg: XLayer) => string;
  // link to a desired url from the group nodes
  url: (xLayer: XLayer, yLayer: YLayer) => string;
  // the height of the whole chart
  yPadding: number;
  // the width of the whole chart
  xPadding: number;
  // the line size of the lines and ticks
  lineSize: number;
  // x Value scaling factor (0 has no effect, 1 has 100% effect)
  xValueScaling: number;
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
  // whether the graph is centered or not
  centered: boolean;
  // numeric field that determines the stroke width
  strokeWidth: (arg: XLayer) => number;
  // function that returns a string describing the y
  tooltipText?: (arg: XLayer) => string;
  // x filter check if the XLayer contains the given YLayer
  mustContain: string[];
  // x filter (Positive and Negative x-Value ranges possible)
  filterXValue: [number | undefined, number | undefined];
  // x filter (Positive group sizes only)
  filterGroupSize: [number | undefined, number | undefined];
  // todo x filter for data predicates
  filterCustomX: (xLayer: XLayer) => boolean;
  // y filter check if the YLayers interacted with the given ones at the specified depth
  interactedWith: [string[], number | undefined];
  // y filter (Positive and Negative x value lifetimes possible)
  filterXValueLifeTime: [number | undefined, number | undefined];
  // y filter (Positive group amounts only)
  filterGroupAmt: [number | undefined, number | undefined];
  // todo y filter for data predicates
  filterCustomY: (yLayer: YLayer) => boolean;
  // Penalty for changing y point from previous layer to the next
  linearLoss: number;
  // Penalty for the amount of switches
  amtLoss: number;
  // Penalty for the length of the switches
  lengthLoss: number;
}

export type Config = Partial<BaseConfig> & (RangeData | ArrayData | TableData);

export type FullConfig = BaseConfig & (RangeData | ArrayData | TableData);

export class XLayer {
  public id?: number;

  public index?: number;

  public isHidden: boolean;

  public add: string[];

  public remove: string[];

  public group: string[];

  public state: string[];

  public switch: Switch[] = [];

  public hiddenYs: string[];

  public constructor(public xValue: number, public data: Record<string, unknown>) {
    this.isHidden = false;
    this.add = [];
    this.remove = [];
    this.group = [];
    this.state = [];
    this.hiddenYs = [];
  }
}

export class YLayer {
  public layers: XLayer[];

  public isHidden: boolean;

  public constructor(public yID: string, public data: Record<string, unknown>) {
    this.isHidden = false;
    this.layers = [];
  }
}

export interface Child {
  loss: number;
  gene: GenePool;
  x: XData;
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

export type XData = XLayer[];

export type YData = Map<string, YLayer>;

export interface Data {
  xData: XData;
  yData: YData;
}

export class RenderedPoint {
  public pointsX: [] = [];

  public pointsY: [] = [];

  public pointsBool: [] = [];

  public pointsSize: [] = [];

  public hiddenYs: string[] = [];

  public hiddenYsAmt: number = 0;

  public constructor(
    public x: number,
    public y: number,
    public z: string,
    public isGrouped: boolean,
    public strokeWidth: number,
    public xVal: number,
    public xDescription: string,
    public url: string
  ) {}
}
