import DrawSpec from './DrawSpec';
import { filter } from './Filter';
import { fit } from './Optimizer';
import { fromArray, fromRanges, fromTable } from './PreProcessing';
import { Config, Data, RenderedPoint, BaseConfig, FullConfig } from './Types';

/**
 * href
 */

export default class KnotDiagram<T extends {}> {
  public processedData!: Data;

  public data!: Data;

  private renderedGrid!: [RenderedPoint[], number, number];

  private baseConfig: BaseConfig = {
    verbose: false,
    colorScheme: 'tableau10',
    lineSize: 12,
    xDescription: l => String(l.xValue),
    url: (xLayer, yLayer) => 'https://www.google.ch/search?q=' + String(xLayer.xValue) + ' ' + yLayer.yID,
    xPadding: 60,
    yPadding: 40,
    xValueScaling: 0.625,
    generationAmt: 20,
    populationSize: 50,
    selectionRate: 0.25,
    selectionSeverity: 8,
    mutationProbability: 0.025,
    continuousStart: false,
    continuousEnd: false,
    centered: false,
    strokeWidth: () => 0,
    mustContain: [],
    interactedWith: [[], 0],
    filterXValue: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    filterGroupSize: [0, Number.MAX_SAFE_INTEGER],
    filterCustomX: () => true,
    filterCustomY: () => true,
    filterXValueLifeTime: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    filterGroupAmt: [0, Number.MAX_SAFE_INTEGER],
    linearLoss: 1,
    amtLoss: 1,
    lengthLoss: 1,
  };

  public config: FullConfig;

  public constructor(rawData: T[], config: Config) {
    this.config = { ...this.baseConfig, ...config };
    this.setData(rawData);
  }

  private setData(data: T[]): void {
    switch (this.config.dataFormat) {
      case 'ranges':
        this.data = fromRanges(data, this.config.yField, this.config.startField, this.config.endField);
        break;
      case 'table':
        this.data = fromTable(data, this.config.yFields, this.config.xField, this.config.splitFunction);
        break;
      case 'array':
        this.data = fromArray(data, this.config.yArrayField, this.config.xField);
        break;
      default:
        console.error('Please specify a data format of type ranges|table|array');
    }
  }

  public getSpec() {
    this.processedData = filter(this.data, this.config);
    this.processedData = fit(this.processedData, this.config) as Data;
    this.renderedGrid = DrawSpec.draw(this.processedData, this.config);
    if (this.config.verbose) {
      console.log(this.renderedGrid);
    }
    return DrawSpec.getSpecNew(this.renderedGrid, this.config);
  }
}
