from Types import YLayer, XLayer
import numpy as np


def filterPoints(data, config):
    # filter xs
    data = filterX(data, config)
    # todo check if Ys comply with the interactedWith filter
    data = interactedWith(data, config)
    # filter ys
    data = filterY(data, config)
    # remove x points without y points
    data[0] = list(filter(lambda layer: len(layer.group) > 0, data[0]))
    setLifeCycles(data, config)
    return data


def isInRange(p, obj, key):
    if key in obj:
        range = obj[key]
        if range:
            cond = True
            if range[0] and range[0] == float(range[0]):
                cond = p >= range[0]
            if range[1] and range[1] == float(range[1]) and cond:
                return p <= range[1]
            return cond
        else:
            return True
    else:
        return True


def filterX(data, config):
    ys = {}
    xs = []
    if isinstance(config['mustContain'], list):
        mustContainArr = config['mustContain']
    else:
        mustContainArr = []
    for x in data[0]:
        contains = set(mustContainArr).issubset(set(x.group))
        if isInRange(len(x.group), config, 'filterGroupSize') and isInRange(x.xValue, config, 'filterXValue') and len(x.group) != 0 and contains:
            xs.append(x)
            for y in x.group:
                ys[y] = data[1][y]
        else:
            x.isHidden = True
    return [xs, ys]


def interactedWith(data, config):
    if config['interactedWith'] and len(config['interactedWith'][0]):
        depth = 0
        if config['interactedWith'][1]:
            depth = config['interactedWith'][1]
        allowedYs = set(config['interactedWith'][0])
        for i in range(-1, depth):
            for layer in data[0]:
                if len(allowedYs.intersection(layer.group)) > 0:
                    allowedYs.add(layer.group)
        for y, yVal in data[1].items():
            if not y in allowedYs:
                yVal.isHidden = True
    return data


def filterY(data, config):
    for y, yVal in data[1].items():
        activeLayers = list(filter(lambda x: not x.isHidden, yVal.layers))
        if activeLayers:
            firstLayer = activeLayers[0]
            lastLayer = activeLayers[len(activeLayers) - 1]
            if not (isInRange(lastLayer.xValue - firstLayer.xValue, config, 'filterXValueLifeTime') and isInRange(len(activeLayers), config, 'filterGroupAmt') and not yVal.isHidden):
                yVal.isHidden = True
                for layer in yVal.layers:
                    layer.group = list(filter(lambda yv: yv != y, layer.group))
                    layer.hiddenYs.append(y)
    return data


def setLifeCycles(data, config):
    for idx, layer in enumerate(data[0]):
        if not layer.isHidden:
            layer.index = idx
    for y, yVal in data[1].items():
        activeLayers = list(filter(lambda x: not x.isHidden, yVal.layers))
        if not yVal.isHidden:
            if config['continuousStart']:
                data[0][0].add.append(y)
            else:
                data[0][activeLayers[0].index].add.append(y)
            if config['continuousEnd']:
                data[0][len(data[0]) - 1].remove.append(y)
            else:
                data[0][activeLayers[len(
                    activeLayers) - 1].index].remove.append(y)
