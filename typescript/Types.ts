export interface Config {
    // the height of the whole chart
    yPadding?: number,
    // the width of the whole chart
    xPadding?: number,
    // the line size of the lines and ticks
    lineSize?: number,
    // x Value scaling factor (0 has no effect, 1 has 100% effect)
    xValueScaling?: number,
    // amount of consecutive Generations to be evaluated
    generationAmt?: number,
    // Size of one generation
    populationSize?: number,
    // Selection rate for the next generation
    selectionRate?: number,
    // probability that a gene mutates (value between 0 and 1)
    mutationProbability?: number,
    // whether the y-points start at the beginning or at the first grouping
    continuousStart?: boolean,
    // whether the y-points go until the end or until the last grouping
    continuousEnd?: boolean,
    // whether the graph is centered or not
    centered?: boolean,
    // numeric field that determines the stroke width
    strokeWidth?: (arg: XLayer) => number,
    // function that returns a string describing the selected x
    xDescription: (arg: XLayer) => string,
    // function that returns a string describing the y
    tooltipText?: (arg: XLayer) => string,
    // x filter check if the XLayer contains the given YLayer
    mustContain?: string[],
    // x filter (Positive and Negative x-Value ranges possible) 
    filterXValue?: [number, number],
    // x filter (Positive group sizes only)
    filterGroupSize?: [number, number],
    // todo x filter for data predicates
    filterCustomX?: (xLayer: XLayer) => boolean,
    // y filter check if the YLayers interacted with the given ones at the specified depth
    interactedWith?: [string[], number],
    // y filter (Positive and Negative x value lifetimes possible)
    filterXValueLifeTime?: [number, number],
    // y filter (Positive index lifetimes only)
    filterIndexLifeTime?: [number, number],
    // y filter (Positive group amounts only)
    filterGroupAmt?: [number, number],
    // todo y filter for data predicates
    filterCustomY?: (yLayer: YLayer) => boolean,
    // Penalty for the amount of switches
    amtLoss?: number
    // Penalty for the length of the switches
    lengthLoss?: number
    // Penalty for adding yLayers in the middle
    centeredAddLoss?: number
    // Penalty for removing yLayers in the middle
    centeredRemoveLoss?: number
}

export class XLayer {
    public id: number
    public index: number
    public isHidden: boolean
    public add: string[]
    public remove: string[]
    public group: string[]
    public state: string[]
    public switch: Switch[]
    public hiddenYs: string[]

    public constructor(
        public xValue: number,
        public data: any) {
        this.isHidden = false
        this.add = []
        this.remove = []
        this.group = []
        this.state = []
        this.hiddenYs = []
    }
}

export class YLayer {
    public layers: XLayer[]
    public isHidden: boolean

    public constructor(public yID: string, public data: any) {
        this.isHidden = false
        this.layers = []
    }
}

export interface Child {
    loss: number
    gene: GenePool
    x: XLayer[]
}

export interface Switch {
    target: number
    prev: number
}

export interface Distance {
    p: string
    distance: number
}

export type GenePool = Map<string, number>

export type XData = XLayer[]

export type YData = Map<string, YLayer>

export type Data = {xData: XData, yData: YData}

export class RenderedPoint {

    pointsX: []
    pointsY: []
    pointsBool: []
    pointsSize: []

    public constructor(public x: number,
        public y: number,
        public z: string,
        public isGrouped: boolean, 
        public strokeWidth: number, 
        public xVal: any,
        public xDescription: string
    ) {}
}
