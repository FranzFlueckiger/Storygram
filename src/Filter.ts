import { YLayer, XLayer, Config, Data } from "./Types"
import _ from 'lodash'

export class Filter {

  // private filteredYs: Set<string>

  public constructor(private d: Data) {
    // this.filteredYs = new Set()
  }

  public filter(config: Config): Data {
    // filter xs
    this.d = this.filterX(config)
    // filter ys
    this.d = this.filterY(config)
    // set lifecycles
    this.d = this.setLifeCycles()
    // check hidden Ys
    this.d = this.removeHiddenYs(config)
    // check hidden Xs
    this.d = this.removeHiddenXs(config)
    return this.d
  }

  private isInRange(p: number, range: [number, number]): boolean {
    return range ?
      ((range[0] ? p >= range[0] : true) && (range[1] ? p <= range[1] : true)) : true
  }

  private filterY(config: Config): Data {
    Array.from(this.d[1]).forEach(yMap => {
      let y: YLayer = yMap[1]
      let layers = y.layers.filter(l => !l.isHidden)
      if (layers.length) {
        if (
          // check if y value has an xValue in the allowed range
          !this.isInRange(layers[layers.length - 1].xValue - layers[0].xValue, config.xValueLifeTime) ||
          // check if y value has a index lifetime in the allowed range
          !this.isInRange(layers[layers.length - 1].index - layers[0].index, config.indexLifeTime)) {
          y.isHidden = true
        }
      }
    })
    return this.d
  }

  private filterX(config: Config): Data {
    let hiddenYs = new Set<string>()
    let xs = this.d[0].map(layer => {
      hiddenYs.clear()
      // remove hidden ys from the group
      layer.group = layer.group.reduce((acc, y) => {
        !this.d[1].get(y).isHidden ? acc.push(y) : hiddenYs.add(y)
        return acc
      }, [])
      layer.hiddenYs = Array.from(hiddenYs)
      // check if layer is hidden
      if (
        !this.isInRange(layer.group.length, config.groupSize) ||
        !this.isInRange(layer.index, config.index) ||
        !this.isInRange(layer.xValue, config.xValue) ||
        !(layer.group.length > 0)
      ) {
        layer.isHidden = true
      }
      return layer
    })
    return [xs, this.d[1]]
  }

  private interactedWith(config: Config): Data {

    return this.d
  }

  private removeHiddenYs(config: Config): Data {
    this.d[1].forEach(y => {
      let activeLayers = y.layers.filter(l => !l.isHidden)
      if (!this.isInRange(activeLayers.length, config.groupAmt)) {
        y.layers.forEach(l => {
          if (l.add.includes(y.yID) || l.remove.includes(y.yID) || y.isHidden) {
            l.add = l.add.filter(a => a != y.yID)
            l.remove = l.remove.filter(a => a != y.yID)
            l.group = l.group.filter(a => a != y.yID)
            l.hiddenYs.push(y.yID)
          }
        })
      }
    })
    return this.d
  }

  private removeHiddenXs(config: Config): Data {
    this.d[0].forEach(layer => {
      if(layer.group.length == 0) {
        layer.isHidden = true
      }
    })
    return this.d
  }

  private setLifeCycles(): Data {
    this.d[1].forEach(y => {
      let visibleLayers: XLayer[] = y.layers.filter(layer => layer.isHidden != true)
      if (visibleLayers.length) {
        this.d[0][visibleLayers[0].index].add.push(y.yID)
        this.d[0][visibleLayers[visibleLayers.length - 1].index].remove.push(y.yID)
      } else {
        y.isHidden = true
      }
    })
    return this.d
  }

}
