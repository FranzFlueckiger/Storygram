import { Config, XLayer, YLayer, Data } from '././Types'
import { Filter } from '././Filter'
import { Optimizer } from './Optimizer'
import { DrawSpec } from './DrawSpec'

export class KnotDiagram {

  private data: Data
  private result: any[]
  private vizData: any[]
  public spec: any
  private filter: Filter
  private optimizer: Optimizer

  public constructor(private inputData: object[], private config: Config) {
    this.checkConfig()
    this.data = this.initialize(inputData)
    this.filter = new Filter(this.data)
    this.optimizer = new Optimizer(this.data, config)
    console.log(this.data)
    this.data = this.filter.filter(config)
    this.result = this.optimizer.fit()
    this.vizData = this.draw(this.result)
    this.spec = DrawSpec.getSpec(this.vizData, config)
    // console.log(JSON.stringify(vizData))
  }

  /**
   * If undefined, set default values for the config object
   */
  private checkConfig() {
    if (!this.config.height) this.config.height = 550
    if (!this.config.width) this.config.width = 1000
    if (!this.config.lineSize) this.config.lineSize = 12
    if (!this.config.generationAmt) this.config.generationAmt = 160
    if (!this.config.populationSize) this.config.populationSize = 40
    if (!this.config.selectionRate) this.config.selectionRate = 0.25
    if (!this.config.mutationProbability) this.config.mutationProbability = 0.05
    if (!this.config.centered) this.config.centered = true
    if (!this.config.xValue) this.config.xValue = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    if (!this.config.index) this.config.index = [0, Number.MAX_SAFE_INTEGER]
    if (!this.config.groupSize) this.config.groupSize = [0, Number.MAX_SAFE_INTEGER]
    if (!this.config.xCustom) this.config.xCustom = []
    if (!this.config.xValueLifeTime) this.config.xValueLifeTime = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    if (!this.config.indexLifeTime) this.config.indexLifeTime = [0, Number.MAX_SAFE_INTEGER]
    if (!this.config.groupAmt) this.config.groupAmt = [0, Number.MAX_SAFE_INTEGER]
    if (!this.config.yCustom) this.config.yCustom = []
    if (!this.config.amtLoss) this.config.amtLoss = 8
    if (!this.config.lengthLoss) this.config.lengthLoss = 4
    if (!this.config.centeredAddLoss) this.config.centeredAddLoss = 1
    if (!this.config.centeredRemoveLoss) this.config.centeredRemoveLoss = 1
  }

  /**
   * This function prepares the data for the processing from a 
   * JSON-Array. It removes duplicates in groups and ignores 
   * undefined and null values.
   */
  private initialize(d: object[]): [XLayer[], Map<string, YLayer>] {
    d.sort((a, b) => a[this.config.xField] - b[this.config.xField])
    let ys: Map<string, YLayer> = new Map()
    let xs: XLayer[] = d.map((x: object, i: number) => {
      let xObj: XLayer = new XLayer(i, x[this.config.xField], x)
      xObj.group = [...Array.from(this.config.yFields.reduce((acc, y) => {
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

  private draw(visitor) {
    let result = []
    let maxLen = this.data[0].reduce((max, layer) => Math.max(max, layer.state.length), 0)
    visitor[0].forEach((layer, x) => {
      let offset: number = layer.state.length % 2 === 0 ? - 0.5 : 0
      layer.state.forEach((p, y) => {
        y = this.config.centered ? (layer.state.length - 1) / 2 - y : y
        let isGrouped = visitor[0][x].group.some(a => a === p)
        let strokeWidth = layer.data.Int
        let xVal = layer.xValue
        let xDescription = this.config.xDescription(layer)
        let yVal = visitor[1].get(p)
        result.push({ 'x': x, 'y': y + offset, 'z': p, 'isGrouped': isGrouped, 'strokeWidth': strokeWidth, 'xVal': xVal, 'xDescription': xDescription })
      })
    })
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
