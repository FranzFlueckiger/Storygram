from Types import XLayer, YLayer
from Filter import filter


class KnotDiagram:

    def __init__(self, inputData, config):
        self.config = config
        fullData = self.initialize(inputData)
        newData = filter(fullData, self.config)

    def initialize(self, inputData):
        inputData.sort_values(by=self.config['xValue'])
        ys = {}
        xs = []
        for x in inputData.iterrows():
            xObj = XLayer(x[1][self.config['xValue']], x)
            for yField in x[1][self.config['yValues']]:
                if type(yField) == str:
                    if 'splitFunc' in self.config:
                        yField = self.config['splitFunc'](yField)
                        xObj.group.extend(yField)
                    else:
                        xObj.group.append(yField)
            xs.append(xObj)
            for yField in xObj.group:
                if yField in ys:
                    yVal = ys[yField]
                else:
                    yVal = YLayer(yField, x)
                    ys[yField] = yVal
        return [xs, ys]

    '''
    private draw(visitor: Data, config: Config): [RenderedPoint[], number] {
    let result: RenderedPoint[] = []
    let maxYLen = this.fullData[0].reduce((max, layer) => Math.max(max, layer.state.length), 0)
    let xLen = this.fullData[0].length
    let maxXValue = this.fullData[0].reduce((max, x) => Math.max(max, x.xValue), 0)
    let scaling = config.xValueScaling
    visitor[0].forEach((layer, i) => {
        let offset: number = layer.state.length % 2 === 0 ? - 0.5 : 0
        layer.state.forEach((p, y) => {
          let yVal = visitor[1].get(p)
          y = this.config.centered ? (layer.state.length - 1) / 2 - y : y
          let isGrouped = visitor[0][i].group.some(a => a === p)
          let strokeWidth = layer.data.Int
          let xVal = layer.xValue
          let xDrawn = scaling * xVal + (1 - scaling) * i
          let xDescription = this.config.xDescription(layer)
          let point = new RenderedPoint(xDrawn, y+offset, p, isGrouped, strokeWidth, xVal, xDescription)
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
    result.map((r: RenderedPoint) => {
      let point = points.get(r.z)
      r.pointsX = point.map(g => g.x)
      r.pointsY = point.map(g => g.y)
      r.pointsBool = point.map(g => g.bool)
      r.pointsSize = point.map(g => g.strokeWidth)
      return r
    })
    return [result, maxYLen]
  }

}
'''


if __name__ == "__main__":
    from DummyConfig import getConfig2
    conf = getConfig2()
    kd = KnotDiagram(conf[0], conf[1])
