import { XLayer, YLayer, XData, YData, Data } from './Types'

/**
  * This function prepares the data for the processing from a 
  * JSON object array containing two range fields. It ignores 
  * undefined and null values. This form of input contains no additional
  * information of the xLayers except for the id.
  */
function fromRanges(data: any[], yField: string, fromField: string, toField: string): Data {
    let xs: Set<number> = new Set()
    let yData: YData = new Map()
    data.forEach(d => {
        if (d[fromField]) xs.add(d[fromField])
        if (d[toField]) xs.add(d[toField])
        yData.set(d[yField], new YLayer(d[yField], d))
    })
    let sortedXs = Array.from(xs).sort((a, b) => a - b)
    let xData: XData = sortedXs.map(x => {
        let xLayer = new XLayer(x, {})
        data.forEach(d => {
            if ((d[fromField] <= x || !d[fromField]) && (d[toField] >= x || !d[toField])) {
                let yID = d[yField]
                xLayer.group.push(yID)
                let yVal = yData.get(yID)
                yVal.layers.push(xLayer)
                yData.set(yID, yVal)
            }
        })
        return xLayer
    })
    return { xData, yData }
}

/**
* This function prepares the data for the processing from a 
* JSON object array. It removes duplicates in groups and ignores 
* undefined and null values. This form of input contains no additional
* information of the yLayers except for the id.
*/
function fromArray(inputData: object[], xField: string, yFields: string[], splitFunction?: (arg: string) => string[]): Data {
    inputData.sort((a, b) => a[xField] - b[xField])
    let yData: Map<string, YLayer> = new Map()
    let xData: XLayer[] = inputData.map((x: object, i: number) => {
        let xObj: XLayer = new XLayer(x[xField], x)
        xObj.id = i
        xObj.group = [...Array.from(yFields.reduce<Set<string>>((acc, y) => {
            if (x[y]) splitFunction ? splitFunction(x[y]).forEach(p => { if (p) acc.add(p) }) : acc.add(x[y])
            return acc
        }, new Set()))]
        xObj.group = xObj.group.map(y => {
            let yObj = yData.get(y)
            if (!yObj) {
                // create the y object
                yObj = new YLayer(y, {})
            }
            yObj.layers.push(xObj)
            yData.set(y, yObj)
            return y
        })
        return xObj
    })
    return { xData, yData }
}

export { fromArray, fromRanges }
