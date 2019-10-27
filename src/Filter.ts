import { Config, Data, XLayer, YLayer } from "./Types";

function filter(data: Data, config: Config): Data {
  console.log("Pre Filtering", data);
  // filter xs
  data = filterX(data, config);
  // filter ys
  data = filterY(data, config);
  // remove x points without y points
  data.xData = data.xData.filter((layer) => layer.group.length > 0);
  setLifeCycles(data, config);
  console.log("Post Filtering", data);
  return data;
}

// todo test this
function isInRange(p: number, range: [number, number] | undefined): boolean {
  return range ?
    ((range[0] ? p >= range[0] : true) && (range[1] ? p <= range[1] : true)) : true;
}

function filterX(data: Data, config: Config): Data {
  const yData: Map<string, YLayer> = new Map();
  const xData = data.xData.filter((xLayer) => {
    let contains = true;
    // todo initialise this before loop
    if (config.mustContain && config.mustContain.length) {
      contains = config.mustContain.every((query) => {
        return xLayer.group.includes(query);
      });
    }
    let isCustomXFilter = false;
    if (config.filterCustomX) {
      isCustomXFilter = !config.filterCustomX(xLayer);
    }
    if (
      !isInRange(xLayer.group.length, config.filterGroupSize) ||
      !isInRange(xLayer.xValue, config.filterXValue) ||
      xLayer.group.length == 0 || !contains || isCustomXFilter
    ) {
      xLayer.isHidden = true;
      return false;
    } else {
      xLayer.group.forEach((y) => {
        const yVal = data.yData.get(y)!;
        yData.set(y, yVal);
      });
      return true;
    }
  });
  return { xData, yData };
}

function filterY(data: Data, config: Config): Data {
  Array.from(data.yData).forEach((yMap) => {
    const yVal: YLayer = yMap[1];
    const activeLayers = yVal.layers ? yVal.layers.filter((l) => !l.isHidden) : [];
    let isCustomYFilter = false;
    if (config.filterCustomY) {
      isCustomYFilter = !config.filterCustomY(yVal);
    }
    if (
      // check if y value has an xValue lifetime in the allowed range
      !isInRange(activeLayers[activeLayers.length - 1].xValue - activeLayers[0].xValue, config.filterXValueLifeTime) ||
      // check if y value has an amount of non-hidden groups in the allowed range
      !isInRange(activeLayers.length, config.filterGroupAmt) ||
      yVal.isHidden || isCustomYFilter) {
      yVal.isHidden = true;
      yVal.layers.forEach((l) => {
        l.group = l.group.filter((a) => a != yVal.yID);
        l.hiddenYs.push(yVal.yID);
      });
    }
  });
  return data;
}

function setLifeCycles(data: Data, config: Config) {
  data.xData.forEach((xLayer, i) => {
    if (!xLayer.isHidden) { xLayer.index = i; }
  });
  Array.from(data.yData).forEach((yMap) => {
    const y: YLayer = yMap[1];
    const activeLayers = y.layers ? y.layers.filter((l) => !l.isHidden) : [];
    if (!y.isHidden) {
      // check where to add the y-point
      if (config.continuousStart) {
        data.xData[0].add.push(y.yID);
      } else {
        data.xData[activeLayers[0].index].add.push(y.yID);
      }
      if (config.continuousEnd) {
        data.xData[data.xData.length - 1].remove.push(y.yID);
      } else {
        data.xData[activeLayers[activeLayers.length - 1].index].remove.push(y.yID);
      }
    }
  });
}

export default filter;
