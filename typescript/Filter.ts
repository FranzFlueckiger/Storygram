import { YLayer, XLayer, Config, Data } from "./Types"

export class Filter {

  public static filter(data: Data, config: Config): Data {
    console.log('Pre Filtering', data)
    // filter xs 
    data = this.filterX(data, config)
    // check if Ys comply with the interacteWith filter
    data = this.interactedWith(data, config)
    // filter ys
    data = this.filterY(data, config)
    // remove x points without y points
    data[0] = data[0].filter(layer => layer.group.length > 0)
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
    let Ys: Map<string, YLayer> = new Map()
    let Xs = data[0].filter(layer => {
      let contains = true
      // todo initialise this before loop
      if (config.mustContain && config.mustContain.length) {
        contains = config.mustContain.every(query => {
          return layer.group.includes(query)
        })
      }
      if (
        !this.isInRange(layer.group.length, config.filterGroupSize) ||
        !this.isInRange(layer.xValue, config.filterXValue) ||
        layer.group.length == 0 || !contains
      ) {
        layer.isHidden = true
        return false
      } else {
        layer.group.forEach(y => {
          let yVal = data[1].get(y)
          Ys.set(y, yVal)
        })
        return true
      }
    })
    return [Xs, Ys]
  }

  private static interactedWith(data: Data, config: Config): Data {
    let allowedYs: Set<string>
    if (config.interactedWith && config.interactedWith[0].length) {
      let depth = 0
      if (config.interactedWith[1]) depth = config.interactedWith[1]
      allowedYs = new Set(config.interactedWith[0])
      for (let i = -1; i < depth; i++) {
        for (let layer of data[0]) {
          if (Array.from(allowedYs).some(y => layer.group.includes(y))) {
            layer.group.forEach(y => allowedYs.add(y))
          }
        }
      }
      Array.from(data[1]).forEach(y => allowedYs.has(y[0]) ? y : y[1].isHidden = true)
    }
    return data
  }

  private static filterY(data: Data, config: Config): Data {
    Array.from(data[1]).forEach(yMap => {
      let y: YLayer = yMap[1]
      let activeLayers = y.layers ? y.layers.filter(l => !l.isHidden) : []
      if (
        // check if y value has an xValue lifetime in the allowed range
        !this.isInRange(activeLayers[activeLayers.length - 1].xValue - activeLayers[0].xValue, config.filterXValueLifeTime) ||
        // check if y value has an amount of non-hidden groups in the allowed range
        !this.isInRange(activeLayers.length, config.filterGroupAmt) ||
        y.isHidden) {
        y.isHidden = true
        y.layers.forEach(l => {
          l.group = l.group.filter(a => a != y.yID)
          l.hiddenYs.push(y.yID)
        })
      }
    })
    return data
  }

  private static setLifeCycles(data: Data, config: Config) {
    data[0].forEach((layer, i) => {
      if (!layer.isHidden) layer.index = i
    })
    Array.from(data[1]).forEach(yMap => {
      let y: YLayer = yMap[1]
      let activeLayers = y.layers ? y.layers.filter(l => !l.isHidden) : []
      if (!y.isHidden) {
        // check where to add the y-point
        if (config.continuousStart) {
          data[0][0].add.push(y.yID)
        } else {
          data[0][activeLayers[0].index].add.push(y.yID)
        }
        if (config.continuousEnd) {
          data[0][data[0].length - 1].remove.push(y.yID)
        } else {
          data[0][activeLayers[activeLayers.length - 1].index].remove.push(y.yID)
        }
      }
    }
  }

}
