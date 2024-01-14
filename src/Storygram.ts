import DrawSpec from './DrawSpec';
import { filter } from './Filter';
import { fit } from './Optimizer';
import { processActorsFirst, processEventsFirst } from './PreProcessing';
import { Config, Data, RenderedPoint, BaseConfig, FullConfig } from './Types';
import { uuid } from 'uuidv4'

export default class Storygram {
  // Data with filtering and optimization
  public processedData!: Data;

  // Data without filtering and optimization
  public data!: Data;

  // Array containing a grid of rendered points, the x length and the maximal y length
  private renderedGrid!: [RenderedPoint[], number, number];

  // Whether the storygram has been filtered, optimized and rendered
  private isCalculated: boolean = false;

  // Default values
  public baseConfig: BaseConfig = {
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
    inferredEventType: undefined
  };

  // Custom and default configuration
  public config!: FullConfig;

  public constructor(rawData: any[], config: Config) {
    this.setConfig(config);
    this.setData(rawData);
    this.calculate();
  }

  public setConfig(config: Config) {
    this.config = { ...this.baseConfig, ...config };
    this.isCalculated = false
  }

  public setData(data: any[]): void {
    switch (this.config.dataFormat) {
      case 'ranges':
        if (
          this.config.actorField == null ||
          this.config.startField == null ||
          this.config.endField == null ||
          this.config.actorField === '' ||
          this.config.startField === '' ||
          this.config.endField === ''
        ) {
          this.data = { events: [], actors: new Map() }
        }
        this.data = processActorsFirst(data, this.config);
        break;
      case 'table':
        if (
          this.config.actorFields == null ||
          this.config.actorFields.length === 0
        ) {
          this.data = { events: [], actors: new Map() }
        }
        const splitFuncTable = this.config.actorSplitFunction ?
          this.config.actorSplitFunction :
          (arg: string | string[]) =>
            arg == null ?
              [] :
              typeof arg === 'string' ?
                [arg] :
                arg
        this.data = processEventsFirst(data, this.config.actorFields, splitFuncTable, this.config, this.config.eventField);
        break;
      case 'array':
        if (
          this.config.actorArrayField == null ||
          this.config.actorArrayField === ''
        ) {
          this.data = { events: [], actors: new Map() }
        }
        const splitFuncArray = (arg: string[]) => {
          return Array.isArray(arg) ?
            arg.reduce((arr, a) =>
              this.config.actorSplitFunction ?
                arr.concat(this.config.actorSplitFunction(a)) :
                arr.concat(a), new Array<string>()) :
            []
        }
        this.data = processEventsFirst(data, [this.config.actorArrayField], splitFuncArray, this.config, this.config.eventField);
        break;
      default:
        console.error('Please specify a data format of type ranges, table or array');
    }
    this.isCalculated = false
  }

  // Imports the data and applies filtering
  public calculate() {
    this.processedData = filter(this.data, this.config);
    this.isCalculated = true
  }

  // Draw the storygram on the DOM. If the importation and filtering steps aren't yet made, perform these first
  public draw() {
    if (!this.isCalculated) {
      this.calculate()
    }
    this.processedData = fit(this.processedData, this.config) as Data;
    this.renderedGrid = DrawSpec.createGrid(this.processedData, this.config);
    if (this.config.verbose) {
      console.log(this.renderedGrid);
    }
    this.remove()
    if (this.processedData.events.length !== 0 && this.processedData.actors.size !== 0) {
      DrawSpec.drawD3(this.renderedGrid, this.config)
    } else {
      console.warn('Storygram: No data after filtering')
    }
  }

  public remove() {
    DrawSpec.remove(this.config)
  }

}
