import { Spec } from 'vega';
import { FullConfig, Data, RenderedPoint, YData } from './Types';


export default class DrawSpec {
  /**
   * After pasting a new Chart Spec do the following:
   * set the height, width
   * set all line and tick sizes
   * set the adaptive tick length
   */

  public static draw(data: Data, config: FullConfig): [RenderedPoint[], number, number] {
    let result: RenderedPoint[] = [];
    const maxYLen = data.xData.reduce((max, layer) => Math.max(max, layer.state.length), 0);
    const xLen = data.xData.length;
    const scaling = config.xValueScaling;
    let xVal: number | string = ''
    let active_Ys: Set<string> = new Set()
    data.xData.forEach((xLayer, xIndex) => {
      let offset = 0;
      if (config.centered) {
        xLayer.state = xLayer.state.filter(y => y !== '')
        offset = xLayer.state.length % 2 === 0 ? -0.5 : 0;
      }
      let lastGroupedIndex: number | undefined = undefined
      // this is the xValue that is shown at the bottom of the chart
      // if it changes it will be drawn
      let xValueLegend: number | string
      if (xVal === xLayer.xValue) xValueLegend = '-'
      else xValueLegend = xLayer.xValue
      xLayer.state.forEach((yID: string, yIndex: number) => {
        const yVal = data.yData.get(yID)
        const isGrouped = xLayer.group.some(a => a === yID) ? 1 : 0;
        if (isGrouped) {
          active_Ys.add(yID)
          lastGroupedIndex = yIndex
        }
        if (xIndex != 0 && data.xData[xIndex - 1].remove.includes(yID)) {
          active_Ys.delete(yID)
        }
        if (active_Ys.has(yID) || config.continuousStart) {
          let yDrawn = config.centered ? (xLayer.state.length - 1) / 2 - yIndex : yIndex;
          yDrawn += offset;
          const strokeWidth = config.strokeWidth(xLayer, yVal!);
          const strokeColor = config.strokeColor(xLayer, yVal!);
          xVal = xLayer.xValue;
          const xDrawn = scaling * xVal + (1 - scaling) * xIndex;
          const xDescription = config.xDescription!(xLayer);
          const url = config.url(xLayer, yVal!)
          const hiddenYs = xLayer.hiddenYs
          const point = new RenderedPoint(xDrawn, yDrawn, yID, isGrouped, strokeWidth, strokeColor, xValueLegend, xDescription, url);
          // this is necessary to show the hidden ys counter
          if (lastGroupedIndex! < yIndex && lastGroupedIndex != undefined) {
            result[result.length - 1].hiddenYs = hiddenYs
            result[result.length - 1].hiddenYsAmt = hiddenYs.length
            lastGroupedIndex = undefined
          } else if (isGrouped && xLayer.state.length - 1 === yIndex) {
            point.hiddenYs = hiddenYs
            point.hiddenYsAmt = hiddenYs.length
          }
          result.push(point);
        }
      });
    });
    result = this.aggregateGroupArrays(result)
    console.log(JSON.stringify(result))
    return [result, maxYLen, xLen];
  }

  public static aggregateGroupArrays(renderedPoints: RenderedPoint[]) {
    // todo this is ugly and inefficient, should be resolved inside altair's chart spec
    // in this first step we gather all the information from the previously rendered
    // points and group them by their yID (for altair it's the z-value)
    const points = new Map();
    renderedPoints.forEach(r => {
      const arr = points.get(r.z) ? points.get(r.z) : [];
      arr.push({ x: r.x, y: r.y, bool: r.isGrouped, strokeWidth: r.strokeWidth, strokeColor: r.strokeColor });
      points.set(r.z, arr);
    });
    // then we insert these 'interaction arrays' in the grouped points
    renderedPoints.map((r: any) => {
      if (r.isGrouped) {
        const point = points.get(r.z);
        r.pointsX = point.map((g: any) => g.x);
        r.pointsY = point.map((g: any) => g.y);
        r.pointsBool = point.map((g: any) => g.bool);
        r.pointsSize = point.map((g: any) => g.strokeWidth);
        r.pointsColor = point.map((g: any) => g.strokeColor);
      }
      return r;
    });
    return renderedPoints
  }

  public static getSpecNew(data: [RenderedPoint[], number, number], config: FullConfig): Spec {
    return {
      "$schema": "https://vega.github.io/schema/vega/v5.json",
      "autosize": "pad",
      "padding": 5,
      "width": data[2] * config.xPadding,
      "height": data[1] * config.yPadding,
      "style": "cell",
      "data": [
        {
          "name": "selector063_store",
          "values": [
            {
              "unit": "\"layer_3\"",
              "fields": [{ "type": "E", "field": "x" }],
              "values": [0]
            }
          ]
        },
        {
          "name": "data-e29822218f4b17b396cb06d2f5a0436e",
          "values": data[0]
        },
        {
          "name": "data_0",
          "source": "data-e29822218f4b17b396cb06d2f5a0436e",
          "transform": [
            { "type": "formula", "expr": "toNumber(datum[\"y\"])", "as": "y" }
          ]
        },
        {
          "name": "data_2",
          "source": "data_0",
          "transform": [
            { "type": "formula", "expr": "(datum.x - 0.001)", "as": "xPre" },
            { "type": "formula", "expr": "(datum.x + 0.001)", "as": "xPost" },
            {
              "type": "fold",
              "fields": ["x", "xPre", "xPost"],
              "as": ["key", "value"]
            }
          ]
        },
        {
          "name": "data_3",
          "source": "data_2",
          "transform": [
            {
              "type": "joinaggregate",
              "as": ["yHi", "yLo"],
              "ops": ["max", "min"],
              "fields": ["y", "y"]
            },
            { "type": "formula", "expr": "datum.yHi + 0.5", "as": "yHigh" },
            { "type": "formula", "expr": "datum.yLo - 0.5", "as": "yLow" }
          ]
        },
        {
          "name": "data_4",
          "source": "data_3",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yHigh\"] !== null && !isNaN(datum[\"yHigh\"])"
            }
          ]
        },
        {
          "name": "data_5",
          "source": "data_3",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yHigh\"] !== null && !isNaN(datum[\"yHigh\"])"
            }
          ]
        },
        {
          "name": "data_6",
          "source": "data_2",
          "transform": [
            {
              "type": "filter",
              "expr": "(vlSelectionTest(\"selector063_store\", datum))"
            }
          ]
        },
        {
          "name": "data_7",
          "source": "data_6",
          "transform": [
            {
              "type": "flatten",
              "fields": ["pointsX", "pointsY", "pointsBool", "pointsSize"],
              "as": ["pointX", "pointY", "pointBool", "pointSize"]
            }
          ]
        },
        {
          "name": "data_8",
          "source": "data_7",
          "transform": [
            {
              "type": "lookup",
              "from": "data_0",
              "key": "x",
              "fields": ["x"],
              "as": ["x_selected"]
            },
            {
              "type": "formula",
              "expr": "(datum.pointX + 0.001)",
              "as": "pointXPre"
            },
            {
              "type": "formula",
              "expr": "(datum.pointX - 0.001)",
              "as": "pointXPost"
            },
            {
              "type": "fold",
              "fields": ["pointX", "pointXPre", "pointXPost"],
              "as": ["key", "value"]
            },
            { "type": "filter", "expr": "datum.isGrouped" }
          ]
        },
        {
          "name": "data_9",
          "source": "data_7",
          "transform": [
            {
              "type": "lookup",
              "from": "data_0",
              "key": "x",
              "fields": ["x"],
              "as": ["x_selected"]
            },
            {
              "type": "formula",
              "expr": "(datum.pointX + 0.001)",
              "as": "pointXPre"
            },
            {
              "type": "formula",
              "expr": "(datum.pointX - 0.001)",
              "as": "pointXPost"
            },
            {
              "type": "fold",
              "fields": ["pointX", "pointXPre", "pointXPost"],
              "as": ["key", "value"]
            },
            { "type": "filter", "expr": "datum.isGrouped" },
            {
              "type": "filter",
              "expr": "datum[\"pointX\"] !== null && !isNaN(datum[\"pointX\"]) && datum[\"pointY\"] !== null && !isNaN(datum[\"pointY\"])"
            }
          ]
        },
        {
          "name": "data_10",
          "source": "data_6",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"])"
            }
          ]
        },
        {
          "name": "data_11",
          "source": "data_2",
          "transform": [{ "type": "filter", "expr": "(datum.hiddenYsAmt !== 0)" }]
        },
        {
          "name": "data_12",
          "source": "data_11",
          "transform": [
            { "type": "formula", "expr": "(datum.x + 0.2)", "as": "x2" },
            { "type": "formula", "expr": "(datum.y + 0.3)", "as": "yLo" },
            { "type": "formula", "expr": "(datum.y + 0.6)", "as": "yHi" },
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yLo\"] !== null && !isNaN(datum[\"yLo\"])"
            }
          ]
        },
        {
          "name": "data_13",
          "source": "data_11",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
            }
          ]
        },
        {
          "name": "data_14",
          "source": "data_2",
          "transform": [{ "type": "filter", "expr": "datum.isGrouped" }]
        },
        {
          "name": "data_15",
          "source": "data_14",
          "transform": [
            {
              "type": "filter",
              "expr": "(vlSelectionTest(\"selector063_store\", datum))"
            }
          ]
        },
        {
          "name": "data_16",
          "source": "data_15",
          "transform": [
            { "type": "formula", "expr": "datum.x + 2.5", "as": "x2" },
            { "type": "formula", "expr": "datum.y - 0.2", "as": "yLo" },
            { "type": "formula", "expr": "datum.y + 0.2", "as": "yHi" },
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yLo\"] !== null && !isNaN(datum[\"yLo\"])"
            }
          ]
        },
        {
          "name": "data_17",
          "source": "data_15",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
            }
          ]
        },
        {
          "name": "data_18",
          "source": "data_14",
          "transform": [
            {
              "type": "aggregate",
              "groupby": ["x"],
              "ops": ["min", "max"],
              "fields": ["y", "y"],
              "as": ["min_y", "max_y"]
            },
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"])"
            }
          ]
        },
        {
          "name": "data_19",
          "source": "data_0",
          "transform": [
            {
              "type": "joinaggregate",
              "as": ["yHi", "yLo"],
              "ops": ["max", "min"],
              "fields": ["y", "y"]
            },
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yLo\"] !== null && !isNaN(datum[\"yLo\"])"
            }
          ]
        }
      ],
      "signals": [
        {
          "name": "unit",
          "value": {},
          "on": [
            { "events": "mousemove", "update": "isTuple(group()) ? group() : unit" }
          ]
        },
        {
          "name": "selector063",
          "update": "vlSelectionResolve(\"selector063_store\")"
        },
        {
          "name": "selector063_tuple",
          "on": [
            {
              "events": [{ "source": "scope", "type": "mouseover" }],
              "update": "datum && item().mark.marktype !== 'group' ? {unit: \"layer_3\", fields: selector063_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)[\"x\"]]} : null",
              "force": true
            },
            { "events": [{ "source": "scope", "type": "dblclick" }], "update": "null" }
          ]
        },
        {
          "name": "selector063_tuple_fields",
          "value": [{ "type": "E", "field": "x" }]
        },
        {
          "name": "selector063_modify",
          "update": "modify(\"selector063_store\", selector063_tuple, true)"
        }
      ],
      "marks": [
        {
          "name": "layer_0_pathgroup",
          "type": "group",
          "from": {
            "facet": {
              "name": "faceted_path_layer_0_main",
              "data": "data_2",
              "groupby": ["strokeColor"]
            }
          },
          "encode": {
            "update": {
              "width": { "field": { "group": "width" } },
              "height": { "field": { "group": "height" } }
            }
          },
          "marks": [
            {
              "name": "layer_0_marks",
              "type": "line",
              "style": ["line"],
              "sort": { "field": "datum[\"value\"]" },
              "from": { "data": "faceted_path_layer_0_main" },
              "encode": {
                "update": {
                  "strokeCap": { "value": "round" },
                  "interpolate": { "value": "monotone" },
                  "stroke": { "scale": "color", "field": "strokeColor" },
                  "opacity": { "value": 0.2 },
                  "x": { "scale": "x", "field": "value" },
                  "y": { "scale": "y", "field": "y" },
                  "strokeWidth": { "value": 9 },
                  "defined": {
                    "signal": "datum[\"value\"] !== null && !isNaN(datum[\"value\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "layer_1_marks",
          "type": "rule",
          "style": ["rule"],
          "from": { "data": "data_18" },
          "encode": {
            "update": {
              "strokeCap": { "value": "round" },
              "stroke": { "value": "black" },
              "opacity": { "value": 0.2 },
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "y": { "scale": "y", "field": "min_y" },
              "y2": { "scale": "y", "field": "max_y" },
              "strokeWidth": { "value": 9 }
            }
          }
        },
        {
          "name": "layer_2_marks",
          "type": "rule",
          "style": ["rule"],
          "from": { "data": "data_4" },
          "encode": {
            "update": {
              "strokeDash": { "value": [5, 5] },
              "stroke": { "value": "#8c8c8c" },
              "opacity": [{ "test": "datum.xVal === '-'", "value": 0 }, { "value": 1 }],
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "y": { "scale": "y", "field": "yHigh" },
              "y2": { "scale": "y", "field": "yLow" }
            }
          }
        },
        {
          "name": "layer_3_marks",
          "type": "rule",
          "style": ["rule"],
          "from": { "data": "data_5" },
          "encode": {
            "update": {
              "strokeCap": { "value": "round" },
              "stroke": { "value": "black" },
              "opacity": [
                {
                  "test": "(vlSelectionTest(\"selector063_store\", datum))",
                  "value": 1
                },
                { "value": 0 }
              ],
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "y": { "scale": "y", "field": "yHigh" },
              "y2": { "scale": "y", "field": "yLow" },
              "strokeWidth": { "value": 4 }
            }
          }
        },
        {
          "name": "layer_3_voronoi",
          "type": "path",
          "from": { "data": "layer_3_marks" },
          "encode": {
            "update": {
              "fill": { "value": "transparent" },
              "strokeWidth": { "value": 0.35 },
              "stroke": { "value": "transparent" },
              "isVoronoi": { "value": true }
            }
          },
          "transform": [
            {
              "type": "voronoi",
              "x": { "expr": "datum.datum.x || 0" },
              "y": { "expr": "datum.datum.y || 0" },
              "size": [{ "signal": "width" }, { "signal": "height" }]
            }
          ]
        },
        {
          "name": "layer_4_pathgroup",
          "type": "group",
          "from": {
            "facet": {
              "name": "faceted_path_layer_4_main",
              "data": "data_8",
              "groupby": ["strokeColor"]
            }
          },
          "encode": {
            "update": {
              "width": { "field": { "group": "width" } },
              "height": { "field": { "group": "height" } }
            }
          },
          "marks": [
            {
              "name": "layer_4_marks",
              "type": "line",
              "style": ["line"],
              "sort": { "field": "datum[\"value\"]" },
              "from": { "data": "faceted_path_layer_4_main" },
              "encode": {
                "update": {
                  "strokeCap": { "value": "round" },
                  "interpolate": { "value": "monotone" },
                  "stroke": { "scale": "color", "field": "strokeColor" },
                  "x": { "scale": "x", "field": "value" },
                  "y": { "scale": "y", "field": "pointY" },
                  "strokeWidth": { "value": 9 },
                  "defined": {
                    "signal": "datum[\"value\"] !== null && !isNaN(datum[\"value\"]) && datum[\"pointY\"] !== null && !isNaN(datum[\"pointY\"])"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "layer_5_marks",
          "type": "rect",
          "style": ["tick"],
          "from": { "data": "data_9" },
          "encode": {
            "update": {
              "opacity": [{ "test": "datum.pointBool", "value": 0.25 }, { "value": 0 }],
              "cursor": { "value": "pointer" },
              "fill": { "value": "black" },
              "href": { "signal": "''+datum[\"url\"]" },
              "xc": [
                {
                  "test": "datum[\"pointX\"] === null || isNaN(datum[\"pointX\"])",
                  "value": 0
                },
                { "scale": "x", "field": "pointX" }
              ],
              "yc": { "scale": "y", "field": "pointY" },
              "height": { "value": 40 },
              "width": { "value": 9 }
            }
          }
        },
        {
          "name": "layer_6_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_10" },
          "encode": {
            "update": {
              "align": { "value": "left" },
              "dx": { "value": 10 },
              "dy": { "value": 5 },
              "fontSize": { "value": 20 },
              "fill": { "value": "black" },
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "y": { "value": 0 },
              "text": { "signal": "''+datum[\"xDescription\"]" },
              "baseline": { "value": "middle" }
            }
          }
        },
        {
          "name": "layer_7_marks",
          "type": "rect",
          "style": ["rect"],
          "from": { "data": "data_12" },
          "encode": {
            "update": {
              "cornerRadius": { "value": 4 },
              "fill": { "value": "red" },
              "opacity": { "value": 0.35 },
              "tooltip": { "signal": "''+datum[\"hiddenYs\"]" },
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "x2": [
                {
                  "test": "datum[\"x2\"] === null || isNaN(datum[\"x2\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x2" }
              ],
              "y": { "scale": "y", "field": "yLo" },
              "y2": { "scale": "y", "field": "yHi" }
            }
          }
        },
        {
          "name": "layer_8_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_13" },
          "encode": {
            "update": {
              "align": { "value": "center" },
              "dx": { "value": 5 },
              "dy": { "value": -17 },
              "fill": { "value": "white" },
              "tooltip": { "signal": "''+datum[\"hiddenYs\"]" },
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "y": { "scale": "y", "field": "y" },
              "text": { "signal": "''+datum[\"hiddenYsAmt\"]" },
              "baseline": { "value": "middle" }
            }
          }
        },
        {
          "name": "layer_9_marks",
          "type": "rect",
          "style": ["rect"],
          "from": { "data": "data_16" },
          "encode": {
            "update": {
              "cursor": { "value": "pointer" },
              "fill": { "value": "black" },
              "opacity": { "value": 0.3 },
              "href": { "signal": "''+datum[\"url\"]" },
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "x2": [
                {
                  "test": "datum[\"x2\"] === null || isNaN(datum[\"x2\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x2" }
              ],
              "y": { "scale": "y", "field": "yLo" },
              "y2": { "scale": "y", "field": "yHi" }
            }
          }
        },
        {
          "name": "layer_10_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_17" },
          "encode": {
            "update": {
              "align": { "value": "left" },
              "dx": { "value": 10 },
              "limit": { "value": 115 },
              "cursor": { "value": "pointer" },
              "fill": { "value": "white" },
              "href": { "signal": "''+datum[\"url\"]" },
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "y": { "scale": "y", "field": "y" },
              "text": { "signal": "''+datum[\"z\"]" },
              "baseline": { "value": "middle" }
            }
          }
        },
        {
          "name": "layer_11_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_19" },
          "encode": {
            "update": {
              "dy": { "value": 40 },
              "fill": { "value": "black" },
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "y": { "scale": "y", "field": "yLo" },
              "text": { "signal": "''+datum[\"xVal\"]" },
              "align": { "value": "center" },
              "baseline": { "value": "middle" }
            }
          }
        }
      ],
      "scales": [
        {
          "name": "x",
          "type": "linear",
          "domain": {
            "fields": [
              { "data": "data_2", "field": "value" },
              { "data": "data_18", "field": "x" },
              { "data": "data_4", "field": "x" },
              { "data": "data_5", "field": "x" },
              { "data": "data_8", "field": "value" },
              { "data": "data_9", "field": "pointX" },
              { "data": "data_10", "field": "x" },
              { "data": "data_12", "field": "x" },
              { "data": "data_12", "field": "x2" },
              { "data": "data_13", "field": "x" },
              { "data": "data_16", "field": "x" },
              { "data": "data_16", "field": "x2" },
              { "data": "data_17", "field": "x" },
              { "data": "data_19", "field": "x" }
            ]
          },
          "range": [0, { "signal": "width" }],
          "nice": true,
          "zero": false
        },
        {
          "name": "y",
          "type": "linear",
          "domain": {
            "fields": [
              { "data": "data_2", "field": "y" },
              { "data": "data_18", "field": "min_y" },
              { "data": "data_18", "field": "max_y" },
              { "data": "data_4", "field": "yHigh" },
              { "data": "data_4", "field": "yLow" },
              { "data": "data_5", "field": "yHigh" },
              { "data": "data_5", "field": "yLow" },
              { "data": "data_8", "field": "pointY" },
              { "data": "data_9", "field": "pointY" },
              { "data": "data_12", "field": "yLo" },
              { "data": "data_12", "field": "yHi" },
              { "data": "data_13", "field": "y" },
              { "data": "data_16", "field": "yLo" },
              { "data": "data_16", "field": "yHi" },
              { "data": "data_17", "field": "y" },
              { "data": "data_19", "field": "yLo" }
            ]
          },
          "range": [{ "signal": "height" }, 0],
          "nice": true,
          "zero": true
        },
        {
          "name": "color",
          "type": "ordinal",
          "domain": {
            "fields": [
              { "data": "data_2", "field": "strokeColor" },
              { "data": "data_8", "field": "strokeColor" }
            ],
            "sort": true
          },
          "range": "category"
        }
      ],
      "axes": [
        {
          "scale": "x",
          "orient": "bottom",
          "grid": false,
          "labelFlush": true,
          "labelOverlap": true,
          "tickCount": { "signal": "ceil(width/40)" },
          "zindex": 1
        },
        {
          "scale": "y",
          "orient": "left",
          "grid": false,
          "labelOverlap": true,
          "tickCount": { "signal": "ceil(height/40)" },
          "zindex": 1
        }
      ],
      "config": {
        "axis": {
          "domainOpacity": 0,
          "grid": false,
          "labelOpacity": 0,
          "tickOpacity": 0
        },
        "style": { "cell": { "strokeWidth": 0 } }
      }
    }
  }
}
