import DrawSpec from './DrawSpec';
import {filter} from './Filter';
import {fit} from './Optimizer';
import {processActorsFirst, processEventsFirst} from './PreProcessing';
import {Config, Data, RenderedPoint, BaseConfig, FullConfig} from './Types';
import {uuid} from 'uuidv4'

export default class Storygram {
  // Data with filtering and optimization
  public processedData!: Data;

  // Data without filtering and optimization
  public data!: Data;

  // Array containing a grid of rendered points, the x length and the maximal y length
  public renderedGrid!: [RenderedPoint[], number, number];

  // Whether the storygram has been filtered, optimized and rendered
  private isCalculated: boolean = false;

  // Default values
  private baseConfig: BaseConfig = {
    uid: uuid(),
    verbose: false,
    colorScheme: 'schemeAccent',
    lineSize: 9,
    eventDescription: l => String(l.eventValue),
    url: (event, actor) => 'https://www.google.ch/search?q=' + String(event.eventValue) + ' ' + actor.actorID,
    eventUrl: (event) => 'https://www.google.ch/search?q=' + String(event.eventValue),
    marginTop: 50,
    marginBottom: 50,
    marginLeft: 50,
    urlOpensNewTab: true,
    marginRight: 50,
    eventPadding: 40,
    actorPadding: 30,
    eventValueScaling: 0.9,
    generationAmt: 30,
    populationSize: 50,
    continuous: false,
    compact: false,
    highlight: [],
    strokeWidth: (event, actor) => 0,
    actorColor: (event, actor) => actor.actorID,
    mustContain: [],
    shouldContain: [],
    interactedWith: [[], 0],
    filterEventValue: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    filterGroupSize: [0, Number.MAX_SAFE_INTEGER],
    filterEventCustom: () => true,
    filterActorCustom: () => true,
    filterEventValueLifeTime: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    filterGroupAmt: [0, Number.MAX_SAFE_INTEGER],
    linearLoss: 1,
    amtLoss: 1,
    lengthLoss: 1,
    yExtentLoss: 0,
    root: 'body',
    tooltipPosition: 'absolute',
    hiddenActorsTooltipTitle: 'Hidden actors',
    selectionRate: 0.25,
    selectionSeverity: 8,
    mutationProbability: 0.025,
  };

  // Custom and default configuration
  public config!: FullConfig;

  public constructor(rawData: any[], config: Config) {
    this.setConfig(config)
    this.setData(rawData);
  }

  public setConfig(config: Config) {
    this.config = {...this.baseConfig, ...config};
    this.isCalculated = false
  }

  public setData(data: any[]): void {
    switch(this.config.dataFormat) {
      case 'ranges':
        this.data = processActorsFirst(data, this.config.actorField, this.config.startField, this.config.endField);
        break;
      case 'table':
        const splitFuncTable = this.config.actorSplitFunction ?
          this.config.actorSplitFunction : (arg: string | string[]) =>
            typeof arg === 'string' ? [arg] : arg
        this.data = processEventsFirst(data, this.config.actorFields, splitFuncTable, this.config.eventField);
        break;
      case 'array':
        const splitFuncArray = (arg: string[]) => {
          return arg.reduce((arr, a) => this.config.actorSplitFunction ? arr.concat(this.config.actorSplitFunction(a)) : arr.concat(a), new Array<string>())
        }
        this.data = processEventsFirst(data, [this.config.actorArrayField], splitFuncArray, this.config.eventField);
        break;
      default:
        console.error('Please specify a data format of type ranges, table or array');
    }
    this.isCalculated = false
  }

  // Filter, optimise and render the storygram
  public calculate() {
    this.processedData = filter(this.data, this.config);
    this.processedData = fit(this.processedData, this.config) as Data;
    this.renderedGrid = DrawSpec.createGrid(this.processedData, this.config);
    if(this.config.verbose) {
      console.log(this.renderedGrid);
    }
    this.isCalculated = true
  }

  // Draw the storygram on the DOM. If the filter, optimization and rendering steps aren't yet made, perform these first
  public draw() {
    if(!this.isCalculated) {
      this.calculate()
    }
    this.remove()
    if(this.processedData.events.length !== 0 && this.processedData.actors.size !== 0) {
      DrawSpec.drawD3(this.renderedGrid, this.config)
    } else {
      console.warn('Storygram: No data after filtering')
    }
  }

  public remove() {
    DrawSpec.remove(this.config)
  }

}
