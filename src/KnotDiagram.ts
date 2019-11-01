import { Spec } from "vega";
import { DrawSpec } from "./DrawSpec";
import { filter } from "./Filter";
import { fit } from "./Optimizer";
import { fromArray, fromRanges, fromTable } from "./PreProcessing";
import { Config, Data, RenderedPoint } from "./Types";

export class KnotDiagram {

  public spec!: Spec;
  public processedData!: Data;
  public data!: Data;
  private renderedGrid!: [RenderedPoint[], number, number];

  public constructor(private rawData: any[], private config: Config) {
    this.checkDefaultConfig();
    this.setData(rawData)
  }

  private setData(data: any[]): void {
    if (this.config.dataFormat === "ranges") {
      if (!this.config.yField) { console.warn("Specify your y field"); }
      if (!this.config.startField) { console.warn("Specify your start field"); }
      if (!this.config.endField) { console.warn("Specify your end field"); }
      this.data = fromRanges(data, this.config.yField! as string, this.config.startField!, this.config.endField!);
    } else if (this.config.dataFormat === "table") {
      if (!this.config.xField) { console.warn("Specify your x field"); }
      if (!this.config.yField) { console.warn("Specify your y fields"); }
      this.data = fromTable(data, this.config.yField! as string[], this.config.xField!, this.config.splitFunction);
    } else if (this.config.dataFormat === "array") {
      if (!this.config.xField) { console.warn("Specify your x field"); }
      if (!this.config.yField) { console.warn("Specify your y-array field"); }
      this.data = fromArray(data, this.config.yField! as string, this.config.xField!);
    } else {
      console.warn("Invalid data format, choose between array, table and ranges");
    }
  }

  public getSpec() {
    this.processedData = filter(this.data, this.config);
    this.processedData = fit(this.processedData, this.config);
    this.renderedGrid = DrawSpec.draw(this.processedData, this.config);
    if (this.config.verbose) console.log(this.renderedGrid);
    return DrawSpec.getSpecOld(this.renderedGrid, this.config);
  }

  /**
   * If not set, set default values for the config object
   */
  private checkDefaultConfig() {
    if (!this.config.verbose) { this.config.verbose = false; }
    if (!this.config.xDescription) { this.config.xDescription = (l) => String(l.xValue); }
    if (!this.config.yPadding) { this.config.yPadding = 40; }
    if (!this.config.xPadding) { this.config.xPadding = 60; }
    if (!this.config.lineSize) { this.config.lineSize = 12; }
    if (!this.config.xValueScaling) { this.config.xValueScaling = 0; }
    if (!this.config.generationAmt) { this.config.generationAmt = 10; }
    if (!this.config.populationSize) { this.config.populationSize = 10; }
    if (!this.config.selectionRate) { this.config.selectionRate = 0.25; }
    if (!this.config.selectionSeverity) { this.config.selectionSeverity = 8; }
    if (!this.config.mutationProbability) { this.config.mutationProbability = 0.025; }
    if (this.config.continuousStart == undefined) { this.config.continuousStart = true; }
    if (this.config.continuousEnd == undefined) { this.config.continuousEnd = true; }
    if (this.config.centered == undefined) { this.config.centered = true; }
    if (this.config.strokeWidth == undefined) { this.config.strokeWidth = (d) => 0; }
    if (!this.config.mustContain) { this.config.mustContain = []; }
    if (!this.config.interactedWith) { this.config.interactedWith = [[], 0]; }
    if (!this.config.filterXValue) { this.config.filterXValue = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]; }
    if (!this.config.filterGroupSize) { this.config.filterGroupSize = [0, Number.MAX_SAFE_INTEGER]; }
    if (!this.config.filterCustomX) { this.config.filterCustomX = (xLayer) => true; }
    if (!this.config.filterXValueLifeTime) { this.config.filterXValueLifeTime = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]; }
    if (!this.config.filterGroupAmt) { this.config.filterGroupAmt = [0, Number.MAX_SAFE_INTEGER]; }
    if (!this.config.filterCustomY) { this.config.filterCustomY = (yLayer) => true; }
    if (!this.config.linearLoss) { this.config.linearLoss = 1; }
    if (!this.config.amtLoss) { this.config.amtLoss = 1; }
    if (!this.config.lengthLoss) { this.config.lengthLoss = 1; }
  }

}
