import DrawSpec from './DrawSpec';
import { filter } from './Filter';
import { fit } from './Optimizer';
import { fromArray, fromRanges, fromTable } from './PreProcessing';
import { Config, Data, RenderedPoint, BaseConfig, FullConfig } from './Types';

export default class Storygram<T extends {}> {
  // Data with filtering and optimization
  public processedData!: Data;

  // Data without filtering and optimization
  public data!: Data;

  // Array containing a grid of rendered points, the x length and the maximal y length
  private renderedGrid!: [RenderedPoint[], number, number];

  // Whether the storygram has been filtered, optimized and rendered
  private isCalculated: boolean = false;

  // Default values
  private baseConfig: BaseConfig = {
    verbose: false,
    colorScheme: 'schemeAccent',
    lineSize: 9,
    eventDescription: l => String(l.eventValue),
    url: (event, actor) => 'https://www.google.ch/search?q=' + String(event.eventValue) + ' ' + actor.actorID,
    marginTop: 50,
    marginBottom: 50,
    marginLeft: 50,
    marginRight: 50,
    eventPadding: 40,
    actorPadding: 30,
    eventValueScaling: 0.9,
    generationAmt: 30,
    populationSize: 50,
    selectionRate: 0.25,
    selectionSeverity: 8,
    mutationProbability: 0.025,
    continuous: false,
    compact: false,
    highlight: [],
    strokeWidth: (event, actor) => 0,
    actorColor: (actor) => actor.actorID,
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
    tooltipXDisplacement: 0,
    tooltipYDisplacement: 0
  };

  // Custom and default configuration
  public config: FullConfig;

  public constructor(rawData: T[], config: Config) {
    this.config = { ...this.baseConfig, ...config };
    this.setData(rawData);
  }

  private setData(data: T[]): void {
    switch (this.config.dataFormat) {
      case 'ranges':
        this.data = fromRanges(data, this.config.actorField, this.config.startField, this.config.endField);
        break;
      case 'table':
        this.data = fromTable(data, this.config.actorFields, this.config.eventField, this.config.actorSplitFunction);
        break;
      case 'array':
        this.data = fromArray(data, this.config.actorArrayField, this.config.eventField);
        break;
      default:
        console.error('Please specify a data format of type ranges, table or array');
    }
  }

  // Filter, optimise and render the storygram
  public calculate() {
    this.processedData = filter(this.data, this.config);
    this.processedData = fit(this.processedData, this.config) as Data;
    this.renderedGrid = DrawSpec.createGrid(this.processedData, this.config);
    if (this.config.verbose) {
      console.log(this.renderedGrid);
    }
    this.isCalculated = true
  }

  // Draw the storygram on the DOM. If the filter, optimization and rendering steps aren't yet made, perform these first
  public async draw() {
    if (!this.isCalculated) {
      this.calculate()
    }
    if (this.processedData.events.length !== 0 && this.processedData.actors.size !== 0) {
      DrawSpec.drawD3(this.renderedGrid, this.config)
    } else {
      console.warn('Storygram: No data after filtering')
    }
  }

}
