from Types import YLayer, XLayer
import numpy as np


def filter(data, config):
    # filter xs
    data = filterX(data, config)
    # todo check if Ys comply with the interacteWith filter
    # data = interactedWith(data, config)
    # filter ys
    # data = filterY(data, config)
    # remove x points without y points
    # data[0] = data[0].filter(layer= > layer.group.length > 0)
    # setLifeCycles(data, config)
    # print('Post Filtering', data)
    return data


def isInRange(p, obj, key):
    if key in obj:
        range = obj[key]
        cond = True
        if range[0] and range[0] == float(range[0]):
            cond = p >= range[0]
        if range[1] == float(range[1]) and cond:
            return p <= range[1]
        return cond
    else:
        return True


def filterX(data, config):
    ys = {}
    xs = []
    if 'mustContain' in config and isinstance(config['mustContain'], list):
      mustContainArr = config['mustContain']
    else: 
      mustContainArr = []
    for x in data[0]:
        contains = set(mustContainArr).issubset(set(x.group))
        if isInRange(len(x.group), config, 'filterGroupSize') and isInRange(x.xValue, config, 'filterXValue') and len(x.group) != 0 and contains:
            xs.append(x)
            for y in x.group:
              yVal = data[1][y]
              ys[y] = yVal
        else:
            x.isHidden =  True
    return [xs, ys]


""" def interactedWith(data, config):
    allowedYs: Set<string>
    if (config.interactedWith && config.interactedWith[0].length) {
      depth = 0
      if (config.interactedWith[1]) depth = config.interactedWith[1]
      allowedYs = new Set(config.interactedWith[0])
      for (let i = -1; i < depth; i++) {
        for (let layer of data[0]) {
          if (Array.from(allowedYs).some(y => layer.group.includes(y))) {
            layer.group.forEach(y => allowedYs.add(y))
      Array.from(data[1]).forEach(y => allowedYs.has(y[0]) ? y : y[1].isHidden = true)
    return data


  def filterY(data, config):
    Array.from(data[1]).forEach(yMap => {
      y: YLayer = yMap[1]
      activeLayers = y.layers ? y.layers.filter(l => !l.isHidden) : []
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
    return data
  }

  def setLifeCycles(data, config):
    data[0].forEach((layer, i) => {
      if (!layer.isHidden) layer.index = i)
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
          data[0][activeLayers[activeLayers.length - \
              1].index].remove.push(y.yID)
        }
      }
    }
  }

} """
