class XLayer:
    def __init__(self, xValue, data):
        self.xValue = xValue
        self.data = data
        self.isHidden = False
        self.add = []
        self.remove = []
        self.group = []
        self.state = []
        self.hiddenYs = []


class YLayer:
    def __init__(self, yID, data):
        self.yID = yID
        self.data = data
        self.isHidden = False
        self.layers = []


#class RenderedPoint:
#    def __init__(self, x, y, z, isGrouped, strokeWidth, xVal, xDescription):
