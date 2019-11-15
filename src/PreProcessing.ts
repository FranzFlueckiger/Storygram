import { Data, XData, XLayer, YData, YLayer } from './Types';

/**
 * This function prepares the data for the processing from a
 * JSON object array containing two range fields. It ignores
 * undefined and null values. This form of input contains no additional
 * information of the xLayers except for the id.
 */

function fromRanges<T extends Record<string, unknown>>(
  data: T[],
  yField: string,
  fromField: string,
  toField: string
): Data {
  const xs: Set<number> = new Set();
  const yData: YData = new Map();
  data.forEach((d, i) => {
    const dFromField = d[fromField];
    if (typeof dFromField === 'number') {
      xs.add(dFromField);
    } else {
      console.warn(`Value of fromField (${dFromField}) of y point nr. ${i} should be of type number.`);
    }
    const dToField = d[toField];
    if (typeof dToField === 'number') {
      xs.add(dToField);
    } else {
      console.warn(`Value of toField (${dToField}) of y point nr. ${i} should be of type number.`);
    }
    const dyField = d[yField];
    if (typeof dyField != 'string') {
      console.warn(`Value of yField (${dyField}) of y point nr. ${i} should be of type string.`);
    }
    yData.set(String(dyField), new YLayer(String(dyField), d));
  });
  const sortedXs: number[] = Array.from(xs).sort((a, b) => a - b);
  const xData: XData = sortedXs.map(x => {
    const xLayer = new XLayer(x, {});
    data.forEach(d => {
      const dFromField = d[fromField];
      const dToField = d[toField];
      if (
        typeof dFromField === 'number' &&
        typeof dToField === 'number' &&
        (dFromField <= x || !dFromField) &&
        (dToField >= x || !dToField)
      ) {
        const yID = d[yField];
        if (typeof yID === 'string') {
          xLayer.group.push(yID);
          const yVal = yData.get(yID) as YLayer;
          yVal.layers.push(xLayer);
          yData.set(yID, yVal);
        }
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
function fromTable(
  inputData: Record<string, number>[],
  yFields: string[],
  xField?: string,
  splitFunction?: (arg: string) => string[]
): Data {
  return processXFirst('table', inputData, yFields, xField, splitFunction);
}

function fromArray(
  inputData: Record<string, number>[],
  yField: string,
  xField?: string,
  splitFunction?: (arg: string) => string[]
): Data {
  return processXFirst('array', inputData, yField, xField, splitFunction);
}

function processXFirst(
  format: 'table' | 'array',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputData: Record<string, any>[],
  yField: string | string[],
  xField?: string,
  splitFunction?: ((arg: string) => string[]) | undefined
) {
  inputData.sort((a, b) => (xField ? a[xField] - b[xField] : -1));
  const yData: YData = new Map();
  const xData: XData = inputData.map((x, i) => {
    let xObj: XLayer;
    if (xField && xField in x) {
      xObj = new XLayer(x[xField], x);
    } else {
      xObj = new XLayer(i, x);
      console.warn('xField not found on layer ' + i + ', using index instead.', x);
    }
    xObj.id = i;
    if (format === 'table') {
      xObj.group = extractYsFromTable(x, yField as string[], splitFunction);
    }
    if (format === 'array') {
      xObj.group = extractYsFromArray(x as Record<string, string[]>, yField as string, splitFunction);
    }
    xObj.group = xObj.group.map(y => {
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

function extractYsFromTable(
  x: Record<string, string>,
  yFields: string[],
  splitFunction: ((arg: string) => string[]) | undefined
): string[] {
  return [
    ...Array.from(
      yFields.reduce<Set<string>>((acc, y) => {
        if (x[y]) {
          if (splitFunction) {
            splitFunction(x[y]).forEach(p => {
              if (p) {
                acc.add(p);
              }
            });
          } else {
            acc.add(x[y]);
          }
        }
        return acc;
      }, new Set())
    ),
  ];
}

function extractYsFromArray(
  x: Record<string, string[]>,
  yField: string,
  splitFunction: ((arg: string) => string[]) | undefined
): string[] {
  if (yField in x) {
    return [
      ...Array.from(
        x[yField].reduce<Set<string>>((acc: Set<string>, y: string) => {
          if (y) {
            if (splitFunction) {
              splitFunction(y).forEach(p => {
                if (p) {
                  acc.add(p);
                }
              });
            } else {
              acc.add(y);
            }
          }
          return acc;
        }, new Set())
      ),
    ];
  }
  return [];
}

export { fromTable, fromRanges, fromArray };
