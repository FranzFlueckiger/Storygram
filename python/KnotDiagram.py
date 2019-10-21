from Types import XLayer, YLayer
from Filter import filterPoints
from Visitor import visit
from DrawSpec import getDrawSpecOld, getDummySpec
from functools import reduce
import numpy as np
import pandas as pd


class KnotDiagram:

    def __init__(self, inputData, config):
        self.config = config
        self.fullData = self.initialize(inputData)
        self.newData = filterPoints(self.fullData, self.config)
        self.newData = visit(self.newData)
        self.drawnGraph = self.draw()
        getDrawSpecOld(self.drawnGraph[0])
        #getDummySpec()

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
                yVal.layers.append(xObj)
        return [xs, ys]

    def draw(self):
        result = []
        maxYlen = np.max([len(s.state) for s in self.newData[0]])
        xLen = len(self.newData[0])
        maxXValue = np.max([s.xValue for s in self.newData[0]])
        scaling = self.config['xValueScaling']
        for idx, layer in enumerate(self.newData[0]):
            offset = - 0.5 if len(layer.state) % 2 == 0 else 0
            for y, p in enumerate(layer.state):
                yVal = self.newData[0][y]
                y = (len(layer.state) - 1) / 2 - y if self.config['centered'] else y
                isGrouped = p in self.newData[0][int(idx)].group
                # todo this is wrong
                strokeWidth = layer.data
                xVal = layer.xValue
                xDrawn = scaling * xVal + (1 - scaling) * idx
                xDescription = self.config['xDescription'](layer)
                # todo strokeWidth
                point = {'x': xDrawn, 'y': y, 'z': p, 'isGrouped': isGrouped, 'strokeWidth': None, 'xVal': xVal, 'xDescription': xDescription}
                result.append(point)
        # todo this is ugly and inefficient
        points = {}
        for r in result:
            arr = points[r['z']] if r['z'] in points else []
            arr.append({ 'x': r['x'], 'y': r['y'], 'bool': r['isGrouped'], 'strokeWidth': r['strokeWidth'] })
            points[r['z']] = arr
        for r in result:
            point = points[r['z']]
            r['pointsX'] = [g['x'] for g in point]
            r['pointsY'] = [g['y'] for g in point]
            r['pointsBool'] = [g['bool'] for g in point]
            r['pointsSize'] = [g['strokeWidth'] for g in point]
        # print(result[0])
        return [pd.DataFrame(result), maxYlen]


if __name__ == "__main__":
    from DummyConfig import getConfig2
    conf = getConfig2()
    kd = KnotDiagram(conf[0], conf[1])
