from Types import XLayer, YLayer
import Optimizer
import numpy as np


def visit(data, yEntryPoints={}):
    visitor = []
    prevIndex = 0
    newXs = []
    for idx, layer in enumerate(data[0]):
        # todo this is redundant and could be removed
        if not layer.isHidden:
            # calculate the center
            center = getCenter(layer.group, visitor)
            if idx != 0:
                for x in data[0][prevIndex].remove:
                    visitor = remove(x, visitor)
            for y in layer.add:
                yVal = data[1][y]
                if not yVal.isHidden:
                    if not y in yEntryPoints:
                        # todo substitute this with gene generator
                        entryPoint = np.random.random() * 2 - 1
                        yEntryPoints[y] = entryPoint
                add(y, center, entryPoint, visitor)
            layer.switch = group(layer.group, visitor)
            layer.state = visitor.copy()
            #print('new Layer: ')
            #print(layer.group)
            #print(layer.add)
            #print(layer.remove)
            #print(layer.switch)
            #print(layer.state)
            prevIndex = idx
            newXs.append(layer)
    return [newXs, data[1]]


def add(a, center, gene, visitor):
    # add the new object at the distance from the center indicated by the entryPoint
    pos = 0
    if len(visitor):
        if gene > 0:
            pos = (len(visitor) - center) * gene
        else:
            pos = center * gene
    # todo check if rounding is correct
    return visitor.insert(int(np.round(pos)), a)


def switchP(switchY, visitor):
    # move the yObj to the group and shift all the others
    print('init', visitor, switchY)
    temp = visitor[switchY['prev']]
    print('temp is: ', temp, switchY)
    visitor.pop(switchY['prev'])
    visitor.insert(int(switchY['target']), temp)
    print('post', visitor)
    return visitor


def group(group, visitor):
    # calculate the center
    center = getCenter(group, visitor)
    # calculate the distance from the mass center
    dists = getDistances(group, center, visitor)
    # array containing the switch operations
    switches = []
    # array describing the outer boundary of the already-adiacent group elements
    edges = [center.copy(), center.copy()]
    # looping strategies for backward and forward searching
    strategies = {}
    # first element is the descending edge, the second one the ascending
    strategies[1] = {'init': 1, 'comp': lambda i: i < len(visitor)}
    strategies[-1] = {'init': 0, 'comp': lambda i: i >= 0}
    # Check for every y that has to be grouped if it is adjacent, else switch
    for p in dists:
        direction = -np.sign(p[1])
        if direction != 0:
            strategy = strategies[direction]
            index = visitor.index(p[0])
            i = edges[strategy['init']]
            cond = True
            while cond:
                if ((index >= edges[0] and index <= edges[1]) or (edges[1] == 0 and direction == 1) or (edges[0] == len(visitor) - 1 and direction == -1)):
                    # if the index of p in the visitor is inside the edges, it is adjacent
                    # if the edges are at the end of the visitor and the direction points
                    # to it, then p is adjacent
                    break
                elif not any(e[0] == visitor[int(i)] for e in dists):
                    # if the visited y is a non-grouped element, then switch it
                    # with the current element p
                    print('group', group)
                    switchY = {'target': i, 'prev': index}
                    switches.append(switchY)
                    visitor = switchP(switchY, visitor)
                    break
                else:
                    # extend adjacent edges
                    edges[strategy['init']] += direction
                i += direction
                cond = strategy['comp'](i)
        return switches  


def remove(a, visitor):
    return list(filter(lambda y: y != a, visitor))


def getCenter(group, visitor):
    count = 0
    for idx, y in enumerate(visitor):
        if y in group:
            count += idx
    return np.round(count / len(group))


def getDistances(group, center, visitor):
    dists = []
    for y in group:
        i = visitor.index(y)
        distance = center - i
        dists.append([y, distance])
    return sorted(dists, key=lambda d: abs(d[1]))
