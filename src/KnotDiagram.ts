import { DrawSpec } from "./DrawSpec";
import filter from "./Filter";
import { fit } from "./Optimizer";
import { Config, Data, RenderedPoint } from "./Types";
import { Spec } from "vega";

export class KnotDiagram {

  public spec: Spec;
  private processedData: Data;
  private renderedGrid: [RenderedPoint[], number, number];

  public constructor(private data: Data, private config: Config) {
    this.checkDefaultConfig();
    this.processedData = filter(this.data, config);
    this.processedData = fit(this.processedData, config);
    this.renderedGrid = DrawSpec.draw(this.processedData, config);
    console.log(this.renderedGrid);
    this.spec = DrawSpec.getSpecOld(this.renderedGrid, config);
  }

  /**
   * If undefined, set default values for the config object
   */
  private checkDefaultConfig() {
    if (!this.config.yPadding) { this.config.yPadding = 40; }
    if (!this.config.xPadding) { this.config.xPadding = 60; }
    if (!this.config.lineSize) { this.config.lineSize = 12; }
    if (!this.config.xValueScaling) { this.config.xValueScaling = 0; }
    if (!this.config.generationAmt) { this.config.generationAmt = 10; }
    if (!this.config.populationSize) { this.config.populationSize = 10; }
    if (!this.config.selectionRate) { this.config.selectionRate = 0.125; }
    if (!this.config.mutationProbability) { this.config.mutationProbability = 0.05; }
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
    if (!this.config.filterIndexLifeTime) { this.config.filterIndexLifeTime = [0, Number.MAX_SAFE_INTEGER]; }
    if (!this.config.filterGroupAmt) { this.config.filterGroupAmt = [0, Number.MAX_SAFE_INTEGER]; }
    if (!this.config.filterCustomY) { this.config.filterCustomY = (yLayer) => true; }
    if (!this.config.amtLoss) { this.config.amtLoss = 80; }
    if (!this.config.lengthLoss) { this.config.lengthLoss = 4; }
    if (!this.config.centeredAddLoss) { this.config.centeredAddLoss = 0; }
    if (!this.config.centeredRemoveLoss) { this.config.centeredRemoveLoss = 0; }
  }

}
