import { Data, XData, XLayer, YData, YLayer } from "./Types";

/**
  * This function prepares the data for the processing from a
  * JSON object array containing two range fields. It ignores
  * undefined and null values. This form of input contains no additional
  * information of the xLayers except for the id.
  */
function fromRanges(data: any[], yField: string, fromField: string, toField: string): Data {
    const xs: Set<number> = new Set();
    const yData: YData = new Map();
    data.forEach((d) => {
        if (d[fromField]) { xs.add(d[fromField]); }
        if (d[toField]) { xs.add(d[toField]); }
        yData.set(d[yField], new YLayer(d[yField], d));
    });
    const sortedXs: number[] = Array.from(xs).sort((a, b) => a - b);
    const xData: XData = sortedXs.map(x => {
        const xLayer = new XLayer(x, {});
        data.forEach((d) => {
            if ((d[fromField] <= x || !d[fromField]) && (d[toField] >= x || !d[toField])) {
                const yID = d[yField];
                xLayer.group.push(yID);
                const yVal = yData.get(yID)!;
                yVal.layers.push(xLayer);
                yData.set(yID, yVal);
            }
        });
        return xLayer;
    });
    return { xData, yData };
}

/**
* This function prepares the data for the processing from a
* JSON object array. It removes duplicates in groups and ignores
* undefined and null values. This form of input contains no additional
* information of the yLayers except for the id.
*/
function fromTable(inputData: object[], xField: string, yFields: string[], splitFunction?: (arg: string) => string[]): Data {
    inputData.sort((a: any, b: any) => a[xField] - b[xField]);
    const yData: YData = new Map();
    const xData: XData = inputData.map((x: object, i: number) => {
        // @ts-ignore
        const xObj: XLayer = new XLayer(x[xField], x);
        xObj.id = i;
        xObj.group = [...Array.from(yFields.reduce<Set<string>>((acc, y) => {
            // @ts-ignore
            if (x[y]) { splitFunction ? splitFunction(x[y]).forEach((p) => { if (p) { acc.add(p); } }) : acc.add(x[y]); }
            return acc;
        }, new Set()))];
        xObj.group = xObj.group.map((y) => {
            let yObj = yData.get(y);
            if (!yObj) {
                // create the y object
                yObj = new YLayer(y, {});
            }
            yObj.layers.push(xObj);
            yData.set(y, yObj);
            return y;
        });
        return xObj;
    });
    return { xData, yData };
}

export { fromTable as fromArray, fromRanges };
