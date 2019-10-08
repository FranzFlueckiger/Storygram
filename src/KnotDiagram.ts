import { Config, XLayer, YLayer, Data, YData, RenderedPoint } from '././Types'
import { Filter } from '././Filter'
import { Optimizer } from './Optimizer'
import { DrawSpec } from './DrawSpec'

export class KnotDiagram {

  private fullData: Data
  private processedData: Data
  private renderedGrid: any[]
  public spec: any
  private filter: Filter
  private optimizer: Optimizer

  public constructor(private inputData: any[], private config: Config) {
    this.checkDefaultConfig()
    this.fullData = this.initialize(inputData)
    this.processedData = Filter.filter(this.fullData, config)
    this.processedData = Optimizer.fit(this.processedData, config)
    this.renderedGrid = this.draw(this.processedData)
    this.spec = DrawSpec.getSpec(this.renderedGrid, config)
  }

  /**
   * If undefined, set default values for the config object
   */
  private checkDefaultConfig() {
    if (!this.config.height) this.config.height = 550
    if (!this.config.width) this.config.width = 1000
    if (!this.config.lineSize) this.config.lineSize = 12
    if (!this.config.generationAmt) this.config.generationAmt = 100
    if (!this.config.populationSize) this.config.populationSize = 80
    if (!this.config.selectionRate) this.config.selectionRate = 0.125
    if (!this.config.mutationProbability) this.config.mutationProbability = 0.05
    if (this.config.continuousStart == null) this.config.continuousStart = true
    if (this.config.continuousEnd == null) this.config.continuousEnd = true
    if (this.config.centered == null) this.config.centered = true
    if (!this.config.mustContain) this.config.mustContain = []
    if (!this.config.interactedWith) this.config.interactedWith = [[], 0]
    if (!this.config.filterXValue) this.config.filterXValue = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    if (!this.config.filterGroupSize) this.config.filterGroupSize = [0, Number.MAX_SAFE_INTEGER]
    if (!this.config.filterCustomX) this.config.filterCustomX = []
    if (!this.config.filterXValueLifeTime) this.config.filterXValueLifeTime = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    if (!this.config.filterIndexLifeTime) this.config.filterIndexLifeTime = [0, Number.MAX_SAFE_INTEGER]
    if (!this.config.filterGroupAmt) this.config.filterGroupAmt = [0, Number.MAX_SAFE_INTEGER]
    if (!this.config.filterCustomY) this.config.filterCustomY = []
    if (!this.config.amtLoss) this.config.amtLoss = 80
    if (!this.config.lengthLoss) this.config.lengthLoss = 4
    if (!this.config.centeredAddLoss) this.config.centeredAddLoss = 0
    if (!this.config.centeredRemoveLoss) this.config.centeredRemoveLoss = 0
  }

  /**
   * This function prepares the data for the processing from a 
   * JSON-Array. It removes duplicates in groups and ignores 
   * undefined and null values.
   */
  private initialize(inputData: object[]): [XLayer[], Map<string, YLayer>] {
    inputData.sort((a, b) => a[this.config.xValue] - b[this.config.xValue])
    let ys: Map<string, YLayer> = new Map()
    let xs: XLayer[] = inputData.map((x: object) => {
      let xObj: XLayer = new XLayer(x[this.config.xValue], x)
      xObj.group = [...Array.from(this.config.yValues.reduce<Set<string>>((acc, y) => {
        if (x[y]) this.config.splitFunction ? this.config.splitFunction(x[y]).forEach(p => { if (p) acc.add(p) }) : acc.add(x[y])
        return acc
      }, new Set()))]
      xObj.group = xObj.group.map(y => {
        let yObj = ys.get(y)
        if (!yObj) {
          // create the y object
          yObj = new YLayer(y, x)
        }
        yObj.layers.push(xObj)
        ys.set(y, yObj)
        return y
      })
      return xObj
    })
    return [xs, ys]
  }

  private draw(visitor: Data): [RenderedPoint[], number] {
    let result: RenderedPoint[] = []
    let maxLen = this.fullData[0].reduce((max, layer) => Math.max(max, layer.state.length), 0)
    visitor[0].forEach((layer, i) => {
        let offset: number = layer.state.length % 2 === 0 ? - 0.5 : 0
        layer.state.forEach((p, y) => {
          let yVal = visitor[1].get(p)
          y = this.config.centered ? (layer.state.length - 1) / 2 - y : y
          let isGrouped = visitor[0][i].group.some(a => a === p)
          let strokeWidth = layer.data.Int
          let xVal = layer.xValue
          let xDescription = this.config.xDescription(layer)
          let point = new RenderedPoint(i, y+offset, p, isGrouped, strokeWidth, xVal, xDescription)
          result.push(point)
        })
    })
    // console.log(visitor)
    // console.log(result)
    // todo this is ugly and inefficient
    let points = new Map()
    result.forEach(r => {
      let arr = points.get(r.z) ? points.get(r.z) : []
      arr.push({ 'x': r.x, 'y': r.y, 'bool': r.isGrouped, 'strokeWidth': r.strokeWidth })
      points.set(r.z, arr)
    })
    result.map(r => {
      r.pointsX = points.get(r.z).map(g => g.x)
      r.pointsY = points.get(r.z).map(g => g.y)
      r.pointsBool = points.get(r.z).map(g => g.bool)
      r.pointsSize = points.get(r.z).map(g => g.strokeWidth)
      return r
    })
    return [result, maxLen]
  }

}
