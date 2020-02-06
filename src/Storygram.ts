import DrawSpec from './DrawSpec';
import {filter} from './Filter';
import {fit} from './Optimizer';
import {fromArray, fromRanges, fromTable} from './PreProcessing';
import {Config, Data, RenderedPoint, BaseConfig, FullConfig} from './Types';

/**
 * href
 */

export default class Storygram<T extends {}> {
  public processedData!: Data;

  public data!: Data;

  private renderedGrid!: [RenderedPoint[], number, number];

  private isCalculated: boolean = false;

  private isRendered: boolean = false;

  private baseConfig: BaseConfig = {
    verbose: false,
    colorScheme: 'tableau10',
    lineSize: 12,
    eventDescription: l => String(l.eventValue),
    url: (event, actor) => 'https://www.google.ch/search?q=' + String(event.eventValue) + ' ' + actor.actorID,
    eventPadding: 60,
    actorPadding: 40,
    eventValueScaling: 0.625,
    generationAmt: 30,
    populationSize: 50,
    selectionRate: 0.25,
    selectionSeverity: 8,
    mutationProbability: 0.025,
    continuousStart: false,
    continuousEnd: false,
    compact: false,
    highlight: [],
    strokeWidth: (event, actor) => 0,
    strokeColor: (event, actor) => actor.actorID,
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
    yExtentLoss: 0
  };

  public config: FullConfig;

  public constructor(rawData: T[], config: Config) {
    this.config = {...this.baseConfig, ...config};
    this.setData(rawData);
  }

  private setData(data: T[]): void {
    switch(this.config.dataFormat) {
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

  public calculate() {
    this.processedData = filter(this.data, this.config);
    this.processedData = fit(this.processedData, this.config) as Data;
    this.isCalculated = true
  }

  public render() {
    if(!this.isCalculated) {
      this.calculate()
    }
    this.renderedGrid = DrawSpec.createGrid(this.processedData, this.config);
    if(this.config.verbose) {
      console.log(this.renderedGrid);
    }
    this.isRendered = true
  }

  public async draw() {
    if(!this.isCalculated) {
      this.calculate()
    }
    if(!this.isRendered) {
      this.render()
    }
    DrawSpec.drawD3(this.renderedGrid, this.config, this.processedData)
  }

}
