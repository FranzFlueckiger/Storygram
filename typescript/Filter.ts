import { YLayer, XLayer, Config, Data } from "./Types"

export class Filter {

  public static filter(data: Data, config: Config): Data {
    console.log('Pre Filtering', data)
    // filter xs 
    data = this.filterX(data, config)
    // filter ys
    data = this.filterY(data, config)
    // remove x points without y points
    data.xData = data.xData.filter(layer => layer.group.length > 0)
    this.setLifeCycles(data, config)
    console.log('Post Filtering', data)
    return data
  }

  // todo test this
  private static isInRange(p: number, range: [number, number]): boolean {
    return range ?
      ((range[0] ? p >= range[0] : true) && (range[1] ? p <= range[1] : true)) : true
  }

  private static filterX(data: Data, config: Config): Data {
    let yData: Map<string, YLayer> = new Map()
    let xData = data.xData.filter(xLayer => {
      let contains = true
      // todo initialise this before loop
      if (config.mustContain && config.mustContain.length) {
        contains = config.mustContain.every(query => {
          return xLayer.group.includes(query)
        })
      }
      if (
        !this.isInRange(xLayer.group.length, config.filterGroupSize) ||
        !this.isInRange(xLayer.xValue, config.filterXValue) ||
        xLayer.group.length == 0 || !contains || !config.filterCustomX(xLayer)
      ) {
        xLayer.isHidden = true
        return false
      } else {
        xLayer.group.forEach(y => {
          let yVal = data.yData.get(y)
          yData.set(y, yVal)
        })
        return true
      }
    })
    return { xData, yData }
  }

  private static filterY(data: Data, config: Config): Data {
    Array.from(data.yData).forEach(yMap => {
      let yVal: YLayer = yMap[1]
      let activeLayers = yVal.layers ? yVal.layers.filter(l => !l.isHidden) : []
      if (
        // check if y value has an xValue lifetime in the allowed range
        !this.isInRange(activeLayers[activeLayers.length - 1].xValue - activeLayers[0].xValue, config.filterXValueLifeTime) ||
        // check if y value has an amount of non-hidden groups in the allowed range
        !this.isInRange(activeLayers.length, config.filterGroupAmt) ||
        yVal.isHidden || !config.filterCustomY(yVal)) {
        yVal.isHidden = true
        yVal.layers.forEach(l => {
          l.group = l.group.filter(a => a != yVal.yID)
          l.hiddenYs.push(yVal.yID)
        })
      }
    })
    return data
  }

  private static setLifeCycles(data: Data, config: Config) {
    data.xData.forEach((xLayer, i) => {
      if (!xLayer.isHidden) xLayer.index = i
    })
    Array.from(data.yData).forEach(yMap => {
      let y: YLayer = yMap[1]
      let activeLayers = y.layers ? y.layers.filter(l => !l.isHidden) : []
      if (!y.isHidden) {
        // check where to add the y-point
        if (config.continuousStart) {
          data.xData[0].add.push(y.yID)
        } else {
          data.xData[activeLayers[0].index].add.push(y.yID)
        }
        if (config.continuousEnd) {
          data.xData[data.xData.length - 1].remove.push(y.yID)
        } else {
          data.xData[activeLayers[activeLayers.length - 1].index].remove.push(y.yID)
        }
      }
    })
  }

}
