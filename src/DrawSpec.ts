import { Spec } from 'vega';
import { FullConfig, Data, RenderedPoint } from './Types';

export default class DrawSpec {
  /**
   * After pasting a new Chart Spec do the following:
   * set the height, width
   * set all line and tick sizes
   * set the adaptive tick length
   */

  // todo normalize coordinates
  public static draw(data: Data, config: FullConfig): [RenderedPoint[], number, number] {
    const result: RenderedPoint[] = [];
    const maxYLen = data.xData.reduce((max, layer) => Math.max(max, layer.state.length), 0);
    const xLen = data.xData.length;
    const scaling = config.xValueScaling;
    data.xData.forEach((xLayer, xIndex) => {
      let offset = 0;
      if (config.centered) {
        offset = xLayer.state.length % 2 === 0 ? -0.5 : 0;
      }
      xLayer.state.forEach((yID: string, yIndex: number) => {
        const isGrouped = xLayer.group.some(a => a === yID);
        let yDrawn = config.centered ? (xLayer.state.length - 1) / 2 - yIndex : yIndex;
        yDrawn += offset;
        const strokeWidth = config.strokeWidth(xLayer);
        const xVal = xLayer.xValue;
        const xDrawn = scaling * xVal + (1 - scaling) * xIndex;
        const xDescription = config.xDescription!(xLayer);
        const point = new RenderedPoint(xDrawn, yDrawn, yID, isGrouped, strokeWidth, xVal, xDescription);
        result.push(point);
      });
    });
    // console.log(visitor)
    // console.log(result)
    // todo this is ugly and inefficient
    const points = new Map();
    result.forEach(r => {
      const arr = points.get(r.z) ? points.get(r.z) : [];
      arr.push({ x: r.x, y: r.y, bool: r.isGrouped, strokeWidth: r.strokeWidth });
      points.set(r.z, arr);
    });
    result.map((r: any) => {
      const point = points.get(r.z);
      r.pointsX = point.map((g: any) => g.x);
      r.pointsY = point.map((g: any) => g.y);
      r.pointsBool = point.map((g: any) => g.bool);
      r.pointsSize = point.map((g: any) => g.strokeWidth);
      return r;
    });
    return [result, maxYLen, xLen];
  }

  public static getSpecNew(data: [RenderedPoint[], number, number], config: FullConfig): Spec {
    return {};
  }

  public static getSpecOld(data: [RenderedPoint[], number, number], config: FullConfig): Spec {
    return {
      config: {
        // @ts-ignore
        view: { width: 400, height: 300, strokeWidth: 0 },
        mark: { tooltip: null },
        axis: {
          domainOpacity: 0,
          grid: false,
          labelOpacity: 0,
          tickOpacity: 0,
          title: null,
        },
      },
      layer: [
        {
          mark: {
            type: 'line',
            interpolate: 'monotone',
            size: config.lineSize,
            strokeCap: 'round',
          },
          encoding: {
            color: { type: 'nominal', field: 'z', legend: null, scale: { scheme: config.colorScheme } },
            opacity: { value: 0.2 },
            x: { type: 'quantitative', field: 'value' },
            y: { type: 'quantitative', field: 'y' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
          ],
        },
        {
          mark: { type: 'tick', size: config.yPadding! * 1.1, thickness: config.lineSize },
          encoding: {
            color: { value: 'black' },
            opacity: {
              condition: { value: 0.2, test: 'datum.isGrouped' },
              value: 0,
            },
            x: { type: 'quantitative', field: 'value' },
            y: { type: 'quantitative', field: 'y' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            { filter: 'floor(datum.value) == datum.value' },
          ],
        },
        {
          mark: 'point',
          encoding: {
            opacity: { value: 0 },
            x: { type: 'quantitative', field: 'value' },
          },
          selection: {
            selector049: {
              type: 'single',
              on: 'mouseover',
              empty: 'none',
              fields: ['x'],
              nearest: true,
              init: { x: 0 },
            },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            { filter: 'datum.isGrouped' },
          ],
        },
        {
          mark: {
            type: 'line',
            interpolate: 'monotone',
            size: config.lineSize,
            strokeCap: 'round',
            opacity: 0.8,
          },
          encoding: {
            color: { type: 'nominal', field: 'z', legend: null },
            order: { type: 'quantitative', field: 'value' },
            x: { type: 'quantitative', field: 'value' },
            y: { type: 'quantitative', field: 'pointY' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            { filter: { selection: 'selector049' } },
            { filter: 'datum.isGrouped' },
            {
              flatten: ['pointsX', 'pointsY', 'pointsBool', 'pointsSize'],
              as: ['pointX', 'pointY', 'pointBool', 'pointSize'],
            },
            { calculate: 'datum.pointX - 0.2', as: 'pointXPre' },
            { calculate: 'datum.pointX + 0.2', as: 'pointXPost' },
            { fold: ['pointX', 'pointXPre', 'pointXPost'] },
          ],
        },
        {
          mark: { type: 'tick', size: config.yPadding! * 1.1, thickness: config.lineSize },
          encoding: {
            color: { value: 'black' },
            opacity: {
              condition: { value: 0.25, test: 'datum.pointBool' },
              value: 0,
            },
            x: { type: 'quantitative', field: 'pointX' },
            y: { type: 'quantitative', field: 'pointY' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            { filter: { selection: 'selector049' } },
            { filter: 'datum.isGrouped' },
            {
              flatten: ['pointsX', 'pointsY', 'pointsBool'],
              as: ['pointX', 'pointY', 'pointBool'],
            },
          ],
        },
        {
          mark: { type: 'rule', size: 3 },
          encoding: {
            opacity: {
              condition: { value: 0.7, selection: 'selector049' },
              value: 0,
            },
            x: { type: 'quantitative', field: 'value' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            { filter: 'datum.isGrouped' },
            { filter: 'floor(datum.value) == datum.value' },
          ],
        },
        {
          mark: {
            type: 'text',
            align: 'left',
            dx: 10,
            dy: -260,
            fontSize: 20,
          },
          encoding: {
            text: { type: 'ordinal', field: 'xDescription' },
            x: { type: 'quantitative', field: 'value' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            { filter: 'datum.isGrouped' },
            { filter: { selection: 'selector049' } },
            { filter: 'floor(datum.value) == datum.value' },
          ],
        },
        {
          mark: 'rect',
          encoding: {
            fill: { value: 'black' },
            opacity: { value: 0.7 },
            stroke: { value: 'white' },
            x: { type: 'quantitative', field: 'value' },
            x2: { field: 'x2' },
            y: { type: 'quantitative', field: 'yLo' },
            y2: { field: 'yHi' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            { calculate: 'datum.x + 2.5', as: 'x2' },
            { calculate: 'datum.y - 0.3', as: 'yLo' },
            { calculate: 'datum.y + 0.3', as: 'yHi' },
            { filter: { selection: 'selector049' } },
            { filter: 'datum.isGrouped' },
            { filter: 'floor(datum.value) == datum.value' },
          ],
        },
        {
          mark: {
            type: 'text',
            align: 'left',
            dx: 10,
            dy: 1,
            limit: 115,
          },
          encoding: {
            color: { value: 'white' },
            href: { type: 'nominal', field: 'url' },
            text: { type: 'nominal', field: 'z' },
            x: { type: 'quantitative', field: 'value' },
            y: { type: 'quantitative', field: 'y' },
          },
          transform: [
            { calculate: 'datum.x - 0.2', as: 'xPre' },
            { calculate: 'datum.x + 0.2', as: 'xPost' },
            { fold: ['x', 'xPre', 'xPost'] },
            {
              calculate: "((('https://www.google.ch/search?q=' + datum.xDescription) + ' ') + datum.z)",
              as: 'url',
            },
            { filter: { selection: 'selector049' } },
            { filter: 'datum.isGrouped' },
            { filter: 'floor(datum.value) == datum.value' },
          ],
        },
      ],
      // @ts-ignore
      data: { name: 'data-31a3ca55662c252b94e9791f188d05fe' },
      datasets: {
        'data-31a3ca55662c252b94e9791f188d05fe': data[0],
      },
      height: config.yPadding * data[1],
      width: config.xPadding * data[2],
      $schema: 'https://vega.github.io/schema/vega-lite/v3.4.0.json',
    };
  }
}
