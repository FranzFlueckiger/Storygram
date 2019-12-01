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
        if (xIndex != 0 && data.xData[xIndex-1].remove.includes(yID)) {
          active_Ys.delete(yID)
        }
        if (active_Ys.has(yID) || config.continuousStart) {
          let yDrawn = config.centered ? (xLayer.state.length - 1) / 2 - yIndex : yIndex;
          yDrawn += offset;
          const strokeWidth = config.strokeWidth(xLayer);
          xVal = xLayer.xValue;
          const xDrawn = scaling * xVal + (1 - scaling) * xIndex;
          const xDescription = config.xDescription!(xLayer);
          const url = config.url(xLayer, yVal!)
          const hiddenYs = xLayer.hiddenYs
          const point = new RenderedPoint(xDrawn, yDrawn, yID, isGrouped, strokeWidth, xValueLegend, xDescription, url);
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
    // console.log(JSON.stringify(result))
    return [result, maxYLen, xLen];
  }

  public static aggregateGroupArrays(renderedPoints: RenderedPoint[]) {
    // todo this is ugly and inefficient, should be resolved inside altair's chart spec
    // in this first step we gather all the information from the previously rendered
    // points and group them by their yID (for altair it's the z-value)
    const points = new Map();
    renderedPoints.forEach(r => {
      const arr = points.get(r.z) ? points.get(r.z) : [];
      arr.push({ x: r.x, y: r.y, bool: r.isGrouped, strokeWidth: r.strokeWidth });
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
      "height": (data[1] + 1) * config.yPadding,
      "style": "cell",
      "data": [
        {
          "name": "selector006_store",
          "values": [
            {
              "unit": "\"layer_2\"",
              "fields": [{ "type": "E", "field": "x" }],
              "values": [0]
            }
          ]
        },
        {
          "name": "data-3002a207708f2275c3cad2eaee3bf157",
          "values": data[0]
        },
        {
          "name": "data_0",
          "source": "data-3002a207708f2275c3cad2eaee3bf157",
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
          "transform": [{ "type": "filter", "expr": "datum.isGrouped" }]
        },
        {
          "name": "data_4",
          "source": "data_3",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
            }
          ]
        },
        {
          "name": "data_5",
          "source": "data_3",
          "transform": [
            {
              "type": "filter",
              "expr": "(vlSelectionTest(\"selector006_store\", datum))"
            }
          ]
        },
        {
          "name": "data_6",
          "source": "data_5",
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
          "name": "data_7",
          "source": "data_5",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
            }
          ]
        },
        {
          "name": "data_8",
          "source": "data_2",
          "transform": [
            {
              "type": "joinaggregate",
              "as": ["yHi", "yLo"],
              "ops": ["max", "min"],
              "fields": ["y", "y"]
            },
            { "type": "formula", "expr": "datum.yHi + 1", "as": "yHigh" },
            { "type": "formula", "expr": "datum.yLo - 0.5", "as": "yLow" },
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yHigh\"] !== null && !isNaN(datum[\"yHigh\"])"
            }
          ]
        },
        {
          "name": "data_9",
          "source": "data_2",
          "transform": [
            {
              "type": "filter",
              "expr": "(vlSelectionTest(\"selector006_store\", datum))"
            }
          ]
        },
        {
          "name": "data_10",
          "source": "data_9",
          "transform": [
            {
              "type": "flatten",
              "fields": ["pointsX", "pointsY", "pointsBool", "pointsSize"],
              "as": ["pointX", "pointY", "pointBool", "pointSize"]
            }
          ]
        },
        {
          "name": "data_11",
          "source": "data_10",
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
          "name": "data_12",
          "source": "data_10",
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
          "name": "data_13",
          "source": "data_9",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"])"
            }
          ]
        },
        {
          "name": "data_14",
          "source": "data_2",
          "transform": [{ "type": "filter", "expr": "(datum.hiddenYsAmt !== 0)" }]
        },
        {
          "name": "data_15",
          "source": "data_14",
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
          "name": "data_16",
          "source": "data_14",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
            }
          ]
        },
        {
          "name": "data_17",
          "source": "data_0",
          "transform": [
            {
              "type": "aggregate",
              "groupby": ["xVal", "x"],
              "ops": ["min"],
              "fields": ["y"],
              "as": ["min_y"]
            },
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"])"
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
          "name": "selector006",
          "update": "vlSelectionResolve(\"selector006_store\")"
        },
        {
          "name": "selector006_tuple",
          "on": [
            {
              "events": [{ "source": "scope", "type": "mouseover" }],
              "update": "datum && item().mark.marktype !== 'group' ? {unit: \"layer_2\", fields: selector006_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)[\"x\"]]} : null",
              "force": true
            },
            { "events": [{ "source": "scope", "type": "dblclick" }], "update": "null" }
          ]
        },
        {
          "name": "selector006_tuple_fields",
          "value": [{ "type": "E", "field": "x" }]
        },
        {
          "name": "selector006_modify",
          "update": "modify(\"selector006_store\", selector006_tuple, true)"
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
              "groupby": ["z"]
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
                  "stroke": { "scale": "color", "field": "z" },
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
          "type": "rect",
          "style": ["tick"],
          "from": { "data": "data_4" },
          "encode": {
            "update": {
              "opacity": { "value": 0.2 },
              "fill": { "value": "black" },
              "xc": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                { "scale": "x", "field": "x" }
              ],
              "yc": { "scale": "y", "field": "y" },
              "height": { "value": config.yPadding },
              "width": { "value": 9 }
            }
          }
        },
        {
          "name": "layer_2_marks",
          "type": "rule",
          "style": ["rule"],
          "from": { "data": "data_8" },
          "encode": {
            "update": {
              "strokeCap": { "value": "round" },
              "stroke": { "value": "black" },
              "opacity": [
                {
                  "test": "(vlSelectionTest(\"selector006_store\", datum))",
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
          "name": "layer_2_voronoi",
          "type": "path",
          "from": { "data": "layer_2_marks" },
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
          "name": "layer_3_pathgroup",
          "type": "group",
          "from": {
            "facet": {
              "name": "faceted_path_layer_3_main",
              "data": "data_11",
              "groupby": ["z"]
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
              "name": "layer_3_marks",
              "type": "line",
              "style": ["line"],
              "sort": { "field": "datum[\"value\"]" },
              "from": { "data": "faceted_path_layer_3_main" },
              "encode": {
                "update": {
                  "strokeCap": { "value": "round" },
                  "interpolate": { "value": "monotone" },
                  "stroke": { "scale": "color", "field": "z" },
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
          "name": "layer_4_marks",
          "type": "rect",
          "style": ["tick"],
          "from": { "data": "data_12" },
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
              "height": { "value": config.yPadding },
              "width": { "value": 9 }
            }
          }
        },
        {
          "name": "layer_5_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_13" },
          "encode": {
            "update": {
              "align": { "value": "left" },
              "dx": { "value": 10 },
              "dy": { "value": 0 },
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
          "name": "layer_6_marks",
          "type": "rect",
          "style": ["rect"],
          "from": { "data": "data_15" },
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
          "name": "layer_7_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_16" },
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
          "name": "layer_8_marks",
          "type": "rect",
          "style": ["rect"],
          "from": { "data": "data_6" },
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
          "name": "layer_9_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_7" },
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
          "name": "layer_10_marks",
          "type": "text",
          "style": ["text"],
          "from": { "data": "data_17" },
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
              "y": { "scale": "y", "field": "min_y" },
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
              { "data": "data_4", "field": "x" },
              { "data": "data_8", "field": "x" },
              { "data": "data_11", "field": "value" },
              { "data": "data_12", "field": "pointX" },
              { "data": "data_13", "field": "x" },
              { "data": "data_15", "field": "x" },
              { "data": "data_15", "field": "x2" },
              { "data": "data_16", "field": "x" },
              { "data": "data_6", "field": "x" },
              { "data": "data_6", "field": "x2" },
              { "data": "data_7", "field": "x" },
              { "data": "data_17", "field": "x" }
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
              { "data": "data_4", "field": "y" },
              { "data": "data_8", "field": "yHigh" },
              { "data": "data_8", "field": "yLow" },
              { "data": "data_11", "field": "pointY" },
              { "data": "data_12", "field": "pointY" },
              { "data": "data_15", "field": "yLo" },
              { "data": "data_15", "field": "yHi" },
              { "data": "data_16", "field": "y" },
              { "data": "data_6", "field": "yLo" },
              { "data": "data_6", "field": "yHi" },
              { "data": "data_7", "field": "y" },
              { "data": "data_17", "field": "min_y" }
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
              { "data": "data_2", "field": "z" },
              { "data": "data_11", "field": "z" }
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
