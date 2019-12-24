import {Spec, stringValue} from 'vega';
import {FullConfig, Data, RenderedPoint, ActorData} from './Types';
import d3 = require('d3');


interface Binned {
  key: string
  values: RenderedPoint[],
  value: any,
  bbox?: any
}

export default class DrawSpec {

  /**
   * After pasting a new Chart Spec do the following:
   * set the height, width
   * set all line and tick sizes
   * set the adaptive tick length
   */
  public static draw(data: Data, config: FullConfig): [RenderedPoint[], number, number] {
    let result: RenderedPoint[] = [];
    const maxYLen = data.events.reduce((max, layer) => Math.max(max, layer.state.length), 0);
    const xLen = data.events.length;
    const scaling = config.eventValueScaling;
    let eventValue: number | string = ''
    let active_Ys: Set<string> = new Set()
    data.events.forEach((xLayer, xIndex) => {
      let offset = 0;
      if(config.compact) {
        xLayer.state = xLayer.state.filter(y => y !== '')
        offset = xLayer.state.length % 2 === 0 ? -0.5 : 0;
      }
      let lastGroupedIndex: number | undefined = undefined
      // this is the eventValue that is shown at the bottom of the chart
      // if it changes it will be drawn
      let eventValueLegend: number | string
      if(eventValue === xLayer.eventValue) eventValueLegend = '-'
      else eventValueLegend = xLayer.eventValue
      xLayer.state.forEach((yID: string, yIndex: number) => {
        const yVal = data.actors.get(yID)
        const isGrouped = xLayer.group.some(a => a === yID) ? 1 : 0;
        if(isGrouped) {
          active_Ys.add(yID)
          lastGroupedIndex = yIndex
        }
        if(xIndex != 0 && data.events[xIndex - 1].remove.includes(yID)) {
          active_Ys.delete(yID)
        }
        if(active_Ys.has(yID) || config.continuousStart) {
          let yDrawn = config.compact ? (xLayer.state.length - 1) / 2 - yIndex : yIndex;
          yDrawn += offset;
          const strokeWidth = config.strokeWidth(xLayer, yVal!);
          const strokeColor = config.strokeColor(xLayer, yVal!);
          eventValue = xLayer.eventValue;
          const xDrawn = scaling * eventValue + (1 - scaling) * xIndex;
          const eventDescription = config.eventDescription!(xLayer);
          const url = config.url(xLayer, yVal!)
          const hiddenYs = xLayer.hiddenActors
          const isHiglighted = config.highlight.includes(yID) ? 1 : 0
          const point = new RenderedPoint(xDrawn, yDrawn, yID, isGrouped, strokeWidth, strokeColor, eventValueLegend, eventDescription, url, isHiglighted);
          // this is necessary to show the hidden ys counter
          if(lastGroupedIndex! < yIndex && lastGroupedIndex != undefined) {
            result[result.length - 1].hiddenYs = hiddenYs
            result[result.length - 1].hiddenYsAmt = hiddenYs.length
            lastGroupedIndex = undefined
          } else if(isGrouped && xLayer.state.length - 1 === yIndex) {
            point.hiddenYs = hiddenYs
            point.hiddenYsAmt = hiddenYs.length
          }
          result.push(point);
        }
      });
    });
    result = this.aggregateGroupArrays(result)
    //console.log(result)
    //console.log(JSON.stringify(result))
    return [result, xLen, maxYLen];
  }

  public static aggregateGroupArrays(renderedPoints: RenderedPoint[]) {
    // todo this is ugly and inefficient, should be resolved inside altair's chart spec
    // in this first step we gather all the information from the previously rendered
    // points and group them by their yID (for altair it's the z-value)
    const points = new Map();
    renderedPoints.forEach(r => {
      const arr = points.get(r.z) ? points.get(r.z) : [];
      arr.push({x: r.x, y: r.y, bool: r.isGrouped, strokeWidth: r.strokeWidth, strokeColor: r.strokeColor});
      points.set(r.z, arr);
    });
    // then we insert these 'interaction arrays' in the grouped points
    renderedPoints.map((r: any) => {
      if(r.isGrouped) {
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

  public static drawD3(data: [RenderedPoint[], number, number], config: FullConfig) {
    let margin = {top: 50, right: 400, bottom: 50, left: 50}
    let width = data[1] * config.eventPadding;
    let height = data[2] * config.actorPadding;

    let svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    let layer1 = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let layer2 = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let selectedEvent: number = data[0][0].x
    const selectedOpacity = 1
    const unSelectedOpacity = 0.15
    const selectedLineSize = 12
    const unSelectedLineSize = 10
    const transitionSpeed = 100
    const xPadding = 0.01
    const actorDescSize = 15

    let actorBin: Binned[] = d3.nest()
      .key(d => d instanceof RenderedPoint ? d.z : '')
      .entries(data[0])

    let groupBin: Binned[] = d3.nest()
      //Todo this 'casting' is ugly, numeric key?
      .key(d => d instanceof RenderedPoint ? String(d.x) : '')
      .rollup((p: Binned) => {
        if(Array.isArray(p) && p.every(d => d instanceof RenderedPoint)) {
          return {
            min: d3.min(p, (d: RenderedPoint) => d.y),
            max: d3.max(p, (d: RenderedPoint) => d.y),
            event: d3.values(p)
          }
        }
        return {min: null, max: null, event: null}
      })
      .entries(data[0].filter(d => d.isGrouped))

    var colorEntries = data[0].map(d => d.strokeColor as string)

    var color = d3.scaleOrdinal()
      .domain(colorEntries)
      .range(d3.schemePaired)

    var bisect = d3.bisector((d: RenderedPoint) => d.x).left;

    let xScale = d3.scaleLinear()
      .domain([d3.min(data[0].map(d => d.x))!, d3.max(data[0].map(d => d.x))!])
      .range([0, width]);

    let yScale = d3.scaleLinear()
      .domain([d3.min(data[0].map(d => d.y))!, d3.max(data[0].map(d => d.y))!])
      .range([height, 0]);

    //xAxis description background
    let xAxisLines = layer1.selectAll(".xAxisLine")
      .data(groupBin.filter((d: Binned) => {
        if(d.value.event[0].eventValue != '-') return true
      }))
      .join("line")
      .attr("class", "xAxisLine")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
      .style("stroke-dasharray", ("4, 4"))

    // actor lines
    let actors = layer1.selectAll(".actors")
      .data(actorBin).enter()
      .append("path")
      .attr("class", "actor")
      .attr('stroke-linecap', 'round')
      .attr("fill", "none")
      .attr("stroke-width", unSelectedLineSize)

    // group lines
    let groups = layer1.selectAll(".groups")
      .data(groupBin).enter()
      .append("path")
      .attr("class", "group")
      .attr("stroke", "black")
      .attr("stroke-width", unSelectedLineSize)
      .attr('stroke-linecap', 'round')
      .attr("fill", "none")

    // event ruler
    let rule = layer1.selectAll(".rule")
      .data(groupBin.filter(d => Number(d.key) === selectedEvent))
      .enter()
      .append("line")
      .attr("class", "rule")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .attr("fill", "none")

    // event description
    let event_desc = layer1.selectAll(".event_desc")
      .data(groupBin.filter(d => Number(d.key) === selectedEvent))
      .enter()
      .append("text")
      .attr("class", "event_desc")
      .attr("font-family", "sans-serif")
      .attr("font-size", "20px")

    //xAxis description
    let xAxis = layer1.selectAll(".xAxis")
      .data(groupBin)
      .join("text")
      .attr("class", "xAxis")
      .attr("font-family", "sans-serif")
      .attr("font-size", "15px")
      .attr('text-anchor', 'middle')

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    layer2
      .append('rect')
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("class", "rect_pointerID")
      .attr('width', width)
      .attr('height', height)
      .on('mousemove', mousemove)

    drawAll()

    function mousemove() {
      // recover coordinate we need
      var x0 = xScale.invert(d3.mouse(d3.event.currentTarget)[0]);
      var i = bisect(data[0], x0, 1);
      var d0 = data[0][i - 1].x
      var d1 = data[0][i].x
      var d = x0 - d0 > d1 - x0 ? d1 : d0;
      selectedEvent = d
      drawAll()
      drawAll()
    }

    function drawAll() {
      groups
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr('opacity', (d: Binned) => {
          if(Number(d.key) === selectedEvent) return unSelectedOpacity
          else return unSelectedOpacity
        })
        .attr("stroke-width", (d: Binned) => {
          if(Number(d.key) === selectedEvent) return selectedLineSize
          else return unSelectedLineSize
        })
        .attr("d", (d) => {
          return d3.line()
            .x(p => xScale(p[0]))
            .y(p => yScale(p[1]))
            .curve(d3.curveMonotoneX)
            ([[Number(d.key), d.value.min], [Number(d.key), d.value.max]])
        })

      actors
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr("stroke", d => color(d.key) as string)
        .attr('opacity', (d: Binned) => {
          if(d.values.some(v => v.x === selectedEvent && v.isGrouped)) return selectedOpacity
          else return unSelectedOpacity
        })
        .attr("stroke-width", (d: Binned) => {
          if(d.values.some(v => v.x === selectedEvent && v.isGrouped)) return selectedLineSize - 1
          else return unSelectedLineSize
        })
        .attr("d", (d: Binned) => {
          return d3.line()
            .x(p => xScale(p[0]))
            .y(p => yScale(p[1]))
            .curve(d3.curveMonotoneX)
            (d.values.reduce((arr, p) => {
              arr.push([p.x - xPadding, p.y])
              arr.push([p.x, p.y])
              arr.push([p.x + xPadding, p.y])
              return arr
            }, []))
        })

      rule
        .data(groupBin.filter(d => Number(d.key) === selectedEvent))
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr('x1', xScale(selectedEvent))
        .attr('y1', 0)
        .attr('x2', xScale(selectedEvent))
        .attr('y2', height)

      event_desc
        .data(groupBin.filter(d => Number(d.key) === selectedEvent))
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr("x", xScale(selectedEvent) + 10)
        .attr("y", -35)
        .text((d) => {
          if(Number(d.key) === selectedEvent)
            return d.value.event[0].eventDescription
        })

      xAxis
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr("x", (d: Binned) => xScale(d.value.event[0].x))
        .attr("y", height + 35)
        .text((d: Binned) => d.value.event[0].eventValue)

      xAxisLines
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr('x1', d => xScale(Number(d.key)))
        .attr('y1', 0)
        .attr('x2', d => xScale(Number(d.key)))
        .attr('y2', height)

      //hidden actors => invisible to get bounding box 
      let hiddenActors = layer2.selectAll(".hiddenActors")
        .data(groupBin.reduce<RenderedPoint[]>((arr, d) => {
          d.value.event.forEach(v => {
            if(v.hiddenYs.length > 0) arr.push(v)
          })
          return arr
        }, []), (d: RenderedPoint) => String(d.x))
        .join((enter: any) => enter.append("text")
          .attr("class", "hiddenActors")
          .attr("font-family", "sans-serif")
          .attr("font-size", "13px")
          .attr("dominant-baseline", "middle")
          .attr("x", (d: RenderedPoint) => xScale(d.x) + 10)
          .attr("y", (d: RenderedPoint) => yScale(d.y))
          .text((d: RenderedPoint) => d.hiddenYs ? d.hiddenYs.length : '')
          .call(getTextBox),
          (update: any) => update
            .transition()
            .duration(transitionSpeed)
            .ease(d3.easeLinear)
            .attr("y", (d: RenderedPoint) => {
              if(d.x === selectedEvent) return yScale(d.y) - 25
              else return yScale(d.y)
            })
            .call(getTextBox)
        )

      //hidden actors => invisible to get bounding box 
      let hiddenActorsBackground = layer2.selectAll(".hiddenActorsBackground")
        .data(groupBin.reduce<RenderedPoint[]>((arr, d) => {
          d.value.event.forEach(v => {
            if(v.hiddenYs.length > 0) arr.push(v)
          })
          return arr
        }, []), (d: RenderedPoint) => String(d.x))
        .join((enter: any) => enter.append("rect")
          .attr("class", "hiddenActorsBackground")
          .attr('opacity', 0.8)
          .attr('fill', 'red')
          .attr('rx', 4)
          .attr('ry', 4)
          .attr("x", (d: RenderedPoint) => xScale(d.x) +10)
          .attr("y", (d: RenderedPoint) => yScale(d.y))
          .attr("width", (d: RenderedPoint) => d.bbox.width)
          .attr("height", (d: RenderedPoint) => d.bbox.height)
          .text((d: RenderedPoint) => d.hiddenYs ? d.hiddenYs.length : '')
          .call(getTextBox),
          (update: any) => update
            .transition()
            .duration(transitionSpeed)
            .ease(d3.easeLinear)
            .attr("y", (d: RenderedPoint) => {
              if(d.x === selectedEvent) return yScale(d.y) - 32
              else return yScale(d.y)
            })
            .call(getTextBox)
        )

      let actorEvents = layer1.selectAll(".actorEvent")
        .data(actorBin.filter((d: Binned) => {
          if(d.values.some(v => v.x === selectedEvent && v.isGrouped)) return true
          return false
        }).reduce<RenderedPoint[]>((arr, d) => {
          d.values.forEach(v => {
            if(v.isGrouped) arr.push(v)
          })
          return arr
        }, []), (d: RenderedPoint) => {
          return String(d.x) + ' ' + String(d.y) + ' ' + d.z + d.strokeColor
        })
        .join(
          (enter: any) => enter.append("line")
            .attr("class", "actorEvent")
            .attr("stroke", "black")
            .attr("stroke-width", selectedLineSize)
            .attr('stroke-linecap', 'round')
            .attr("fill", "none")
            .attr("x1", (d: RenderedPoint) => xScale(d.x))
            .attr("x2", (d: RenderedPoint) => xScale(d.x))
            .attr("y1", (d: RenderedPoint) => yScale(d.y) - config.eventPadding / 5)
            .attr("y2", (d: RenderedPoint) => yScale(d.y) + config.eventPadding / 5)
            .attr("stroke-opacity", 0.8),
          (update: any) => {
            return update
          },
          (exit: any) => exit.transition()
            .duration(transitionSpeed)
            .ease(d3.easeLinear)
            .attr("y1", (d: RenderedPoint) => yScale(d.y))
            .attr("y2", (d: RenderedPoint) => yScale(d.y))
            .attr("stroke-opacity", 0.0)
            .remove()
        );

      let actorDescInv = layer1.selectAll(".actorDescInv")
        .data(groupBin.filter(d => d.value.event[0].x === selectedEvent)[0].value.event,
          (d: RenderedPoint) => d.z)
        .join(
          (enter: any) => {
            enter
              .append("text")
              .attr("class", "actorDescInv")
              .attr("font-family", "sans-serif")
              .attr("font-size", actorDescSize + "px")
              .attr("dominant-baseline", "middle")
              .attr("opacity", 0)
              .attr("x", (d: RenderedPoint) => xScale(d.x) + 10)
              .attr("y", (d: RenderedPoint) => yScale(d.y))
              .text((d: RenderedPoint) => d.z)
              .call(getTextBox)
          },
          (update: any) => {
            update
              .attr("x", (d: RenderedPoint) => xScale(d.x) + 10)
              .attr("y", (d: RenderedPoint) => yScale(d.y))
              .call(getTextBox)
          },
          (exit: any) => {
            exit
              .remove()
          }
        );

      let actorDescBackground = layer2.selectAll(".actorDescBackground")
        .data(groupBin.filter(d => d.value.event[0].x === selectedEvent)[0].value.event,
          (d: RenderedPoint) => d.z)
        .join(
          (enter: any) => {
            enter
              .append("rect")
              .attr("class", "actorDescBackground")
              .attr('opacity', 0.8)
              .attr('fill', 'white')
              .attr('rx', 10)
              .attr('ry', 10)
              .style('stroke-width', 3)
              .style('stroke', d => color(d.z) as string)
              .attr("x", xScale(selectedEvent) + selectedLineSize / 2)
              .attr("y", (d: RenderedPoint) => d.bbox.y - 5)
              .attr("width", (d: RenderedPoint) => d.bbox.width + 10)
              .attr("height", (d: RenderedPoint) => d.bbox.height + 10)
          },
          (update: any) => {
            update.transition()
              .duration(transitionSpeed)
              .ease(d3.easeLinear)
              .attr("x", xScale(selectedEvent) + selectedLineSize / 2)
              .attr("y", (d: RenderedPoint) => d.bbox.y - 5)
          },
          (exit: any) => {
            exit
              .remove()
          }
        );

      let actorDesc = layer2.selectAll(".actorDesc")
        .data(groupBin.filter(d => d.value.event[0].x === selectedEvent)[0].value.event,
          (d: RenderedPoint) => d.z)
        .join(
          (enter: any) => {
            enter
              .append("text")
              .attr("class", "actorDesc")
              .attr("font-family", "sans-serif")
              .attr("font-size", actorDescSize + "px")
              .attr("dominant-baseline", "middle")
              .attr("x", (d: RenderedPoint) => xScale(d.x) + 10)
              .attr("y", (d: RenderedPoint) => yScale(d.y))
              .text((d: RenderedPoint) => d.z)
          },
          (update: any) => {
            update.transition()
              .duration(transitionSpeed)
              .ease(d3.easeLinear)
              .attr("x", (d: RenderedPoint) => xScale(d.x) + 10)
              .attr("y", (d: RenderedPoint) => yScale(d.y))
          },
          (exit: any) => {
            exit
              .remove()
          }
        );

      function getTextBox(selection: any) {
        selection.each(function(d: RenderedPoint) {d.bbox = this.getBBox()})
      }

    }

  }

  public static getSpecNew(data: [RenderedPoint[], number, number], config: FullConfig): Spec {
    return {
      "$schema": "https://vega.github.io/schema/vega/v5.json",
      "autosize": "pad",
      "padding": 15,
      "width": data[1] * config.eventPadding,
      "height": data[2] * config.actorPadding,
      "style": "cell",
      "data": [
        {
          "name": "selector010_store",
          "values": [
            {
              "unit": "\"layer_4\"",
              "fields": [{"type": "E", "field": "x"}],
              "values": [0]
            }
          ]
        },
        {
          "name": "data-62aa173cefa189ca06419e6e93ca30c4",
          "values": data[0]
        },
        {
          "name": "data_0",
          "source": "data-62aa173cefa189ca06419e6e93ca30c4",
          "transform": [
            {"type": "formula", "expr": "toNumber(datum[\"y\"])", "as": "y"}
          ]
        },
        {
          "name": "data_2",
          "source": "data_0",
          "transform": [
            {"type": "formula", "expr": "(datum.x - 0.001)", "as": "xPre"},
            {"type": "formula", "expr": "(datum.x + 0.001)", "as": "xPost"},
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
          "transform": [{"type": "filter", "expr": "datum.isHighlighted"}]
        },
        {
          "name": "data_4",
          "source": "data_2",
          "transform": [
            {
              "type": "joinaggregate",
              "as": ["yHi", "yLo"],
              "ops": ["max", "min"],
              "fields": ["y", "y"]
            },
            {"type": "formula", "expr": "datum.yHi + 0.5", "as": "yHigh"},
            {"type": "formula", "expr": "datum.yLo - 0.5", "as": "yLow"}
          ]
        },
        {
          "name": "data_5",
          "source": "data_4",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yHigh\"] !== null && !isNaN(datum[\"yHigh\"])"
            }
          ]
        },
        {
          "name": "data_6",
          "source": "data_4",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yHigh\"] !== null && !isNaN(datum[\"yHigh\"])"
            }
          ]
        },
        {
          "name": "data_7",
          "source": "data_2",
          "transform": [
            {
              "type": "filter",
              "expr": "(vlSelectionTest(\"selector010_store\", datum))"
            }
          ]
        },
        {
          "name": "data_8",
          "source": "data_7",
          "transform": [
            {
              "type": "flatten",
              "fields": ["pointsX", "pointsY", "pointsBool", "pointsSize"],
              "as": ["pointX", "pointY", "pointBool", "pointSize"]
            }
          ]
        },
        {
          "name": "data_9",
          "source": "data_8",
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
            {"type": "filter", "expr": "datum.isGrouped"}
          ]
        },
        {
          "name": "data_10",
          "source": "data_8",
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
            {"type": "filter", "expr": "datum.isGrouped"},
            {"type": "filter", "expr": "datum.isHighlighted"}
          ]
        },
        {
          "name": "data_11",
          "source": "data_8",
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
            {"type": "filter", "expr": "datum.isGrouped"},
            {
              "type": "filter",
              "expr": "datum[\"pointX\"] !== null && !isNaN(datum[\"pointX\"]) && datum[\"pointY\"] !== null && !isNaN(datum[\"pointY\"])"
            }
          ]
        },
        {
          "name": "data_12",
          "source": "data_7",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"])"
            }
          ]
        },
        {
          "name": "data_13",
          "source": "data_2",
          "transform": [{"type": "filter", "expr": "(datum.hiddenYsAmt !== 0)"}]
        },
        {
          "name": "data_14",
          "source": "data_13",
          "transform": [
            {"type": "formula", "expr": "(datum.x + 0.2)", "as": "x2"},
            {"type": "formula", "expr": "(datum.y + 0.3)", "as": "yLo"},
            {"type": "formula", "expr": "(datum.y + 0.6)", "as": "yHi"},
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yLo\"] !== null && !isNaN(datum[\"yLo\"])"
            }
          ]
        },
        {
          "name": "data_15",
          "source": "data_13",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
            }
          ]
        },
        {
          "name": "data_16",
          "source": "data_2",
          "transform": [{"type": "filter", "expr": "datum.isGrouped"}]
        },
        {
          "name": "data_17",
          "source": "data_16",
          "transform": [
            {
              "type": "filter",
              "expr": "(vlSelectionTest(\"selector010_store\", datum))"
            }
          ]
        },
        {
          "name": "data_18",
          "source": "data_17",
          "transform": [
            {"type": "formula", "expr": "datum.x + 2.5", "as": "x2"},
            {"type": "formula", "expr": "datum.y - 0.2", "as": "yLo"},
            {"type": "formula", "expr": "datum.y + 0.2", "as": "yHi"},
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"yLo\"] !== null && !isNaN(datum[\"yLo\"])"
            }
          ]
        },
        {
          "name": "data_19",
          "source": "data_17",
          "transform": [
            {
              "type": "filter",
              "expr": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
            }
          ]
        },
        {
          "name": "data_20",
          "source": "data_16",
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
          "name": "data_21",
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
            {"events": "mousemove", "update": "isTuple(group()) ? group() : unit"}
          ]
        },
        {
          "name": "selector010",
          "update": "vlSelectionResolve(\"selector010_store\")"
        },
        {
          "name": "selector010_tuple",
          "on": [
            {
              "events": [{"source": "scope", "type": "mouseover"}],
              "update": "datum && item().mark.marktype !== 'group' ? {unit: \"layer_4\", fields: selector010_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)[\"x\"]]} : null",
              "force": true
            },
            {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
          ]
        },
        {
          "name": "selector010_tuple_fields",
          "value": [{"type": "E", "field": "x"}]
        },
        {
          "name": "selector010_modify",
          "update": "modify(\"selector010_store\", selector010_tuple, true)"
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
              "groupby": ["strokeColor", "z"]
            }
          },
          "encode": {
            "update": {
              "width": {"field": {"group": "width"}},
              "height": {"field": {"group": "height"}}
            }
          },
          "marks": [
            {
              "name": "layer_0_marks",
              "type": "line",
              "style": ["line"],
              "sort": {"field": "datum[\"value\"]"},
              "from": {"data": "faceted_path_layer_0_main"},
              "encode": {
                "update": {
                  "strokeCap": {"value": "round"},
                  "interpolate": {"value": "monotone"},
                  "stroke": {"scale": "color", "field": "strokeColor"},
                  "opacity": {"value": 0.2},
                  "x": {"scale": "x", "field": "value"},
                  "y": {"scale": "y", "field": "y"},
                  "strokeWidth": {"value": 9},
                  "defined": {
                    "signal": "datum[\"value\"] !== null && !isNaN(datum[\"value\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "layer_1_pathgroup",
          "type": "group",
          "from": {
            "facet": {
              "name": "faceted_path_layer_1_main",
              "data": "data_3",
              "groupby": ["z"]
            }
          },
          "encode": {
            "update": {
              "width": {"field": {"group": "width"}},
              "height": {"field": {"group": "height"}}
            }
          },
          "marks": [
            {
              "name": "layer_1_marks",
              "type": "line",
              "style": ["line"],
              "sort": {"field": "datum[\"value\"]"},
              "from": {"data": "faceted_path_layer_1_main"},
              "encode": {
                "update": {
                  "strokeDash": {"value": [5, 5]},
                  "interpolate": {"value": "monotone"},
                  "stroke": {"value": "black"},
                  "opacity": {"value": 0.2},
                  "x": {"scale": "x", "field": "value"},
                  "y": {"scale": "y", "field": "y"},
                  "strokeWidth": {"value": 4.5},
                  "defined": {
                    "signal": "datum[\"value\"] !== null && !isNaN(datum[\"value\"]) && datum[\"y\"] !== null && !isNaN(datum[\"y\"])"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "layer_2_marks",
          "type": "rule",
          "style": ["rule"],
          "from": {"data": "data_20"},
          "encode": {
            "update": {
              "strokeCap": {"value": "round"},
              "stroke": {"value": "black"},
              "opacity": {"value": 0.2},
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "y": {"scale": "y", "field": "min_y"},
              "y2": {"scale": "y", "field": "max_y"},
              "strokeWidth": {"value": 9}
            }
          }
        },
        {
          "name": "layer_3_marks",
          "type": "rule",
          "style": ["rule"],
          "from": {"data": "data_5"},
          "encode": {
            "update": {
              "strokeDash": {"value": [5, 5]},
              "stroke": {"value": "#8c8c8c"},
              "opacity": [{"test": "datum.eventValue === '-'", "value": 0}, {"value": 1}],
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "y": {"scale": "y", "field": "yHigh"},
              "y2": {"scale": "y", "field": "yLow"}
            }
          }
        },
        {
          "name": "layer_4_marks",
          "type": "rule",
          "style": ["rule"],
          "from": {"data": "data_6"},
          "encode": {
            "update": {
              "strokeCap": {"value": "round"},
              "stroke": {"value": "black"},
              "opacity": [
                {
                  "test": "(vlSelectionTest(\"selector010_store\", datum))",
                  "value": 1
                },
                {"value": 0}
              ],
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "y": {"scale": "y", "field": "yHigh"},
              "y2": {"scale": "y", "field": "yLow"},
              "strokeWidth": {"value": 4}
            }
          }
        },
        {
          "name": "layer_4_voronoi",
          "type": "path",
          "from": {"data": "layer_4_marks"},
          "encode": {
            "update": {
              "fill": {"value": "transparent"},
              "strokeWidth": {"value": 0.35},
              "stroke": {"value": "transparent"},
              "isVoronoi": {"value": true}
            }
          },
          "transform": [
            {
              "type": "voronoi",
              "x": {"expr": "datum.datum.x || 0"},
              "y": {"expr": "datum.datum.y || 0"},
              "size": [{"signal": "width"}, {"signal": "height"}]
            }
          ]
        },
        {
          "name": "layer_5_pathgroup",
          "type": "group",
          "from": {
            "facet": {
              "name": "faceted_path_layer_5_main",
              "data": "data_9",
              "groupby": ["strokeColor", "z"]
            }
          },
          "encode": {
            "update": {
              "width": {"field": {"group": "width"}},
              "height": {"field": {"group": "height"}}
            }
          },
          "marks": [
            {
              "name": "layer_5_marks",
              "type": "line",
              "style": ["line"],
              "sort": {"field": "datum[\"value\"]"},
              "from": {"data": "faceted_path_layer_5_main"},
              "encode": {
                "update": {
                  "strokeCap": {"value": "round"},
                  "interpolate": {"value": "monotone"},
                  "stroke": {"scale": "color", "field": "strokeColor"},
                  "x": {"scale": "x", "field": "value"},
                  "y": {"scale": "y", "field": "pointY"},
                  "strokeWidth": {"value": 9},
                  "defined": {
                    "signal": "datum[\"value\"] !== null && !isNaN(datum[\"value\"]) && datum[\"pointY\"] !== null && !isNaN(datum[\"pointY\"])"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "layer_6_pathgroup",
          "type": "group",
          "from": {
            "facet": {
              "name": "faceted_path_layer_6_main",
              "data": "data_10",
              "groupby": ["z"]
            }
          },
          "encode": {
            "update": {
              "width": {"field": {"group": "width"}},
              "height": {"field": {"group": "height"}}
            }
          },
          "marks": [
            {
              "name": "layer_6_marks",
              "type": "line",
              "style": ["line"],
              "sort": {"field": "datum[\"value\"]"},
              "from": {"data": "faceted_path_layer_6_main"},
              "encode": {
                "update": {
                  "strokeDash": {"value": [5, 5]},
                  "interpolate": {"value": "monotone"},
                  "stroke": {"value": "black"},
                  "x": {"scale": "x", "field": "value"},
                  "y": {"scale": "y", "field": "pointY"},
                  "strokeWidth": {"value": 4.5},
                  "defined": {
                    "signal": "datum[\"value\"] !== null && !isNaN(datum[\"value\"]) && datum[\"pointY\"] !== null && !isNaN(datum[\"pointY\"])"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "layer_7_marks",
          "type": "rect",
          "style": ["tick"],
          "from": {"data": "data_11"},
          "encode": {
            "update": {
              "opacity": [{"test": "datum.pointBool", "value": 0.25}, {"value": 0}],
              "cursor": {"value": "pointer"},
              "fill": {"value": "black"},
              "href": {"signal": "''+datum[\"url\"]"},
              "xc": [
                {
                  "test": "datum[\"pointX\"] === null || isNaN(datum[\"pointX\"])",
                  "value": 0
                },
                {"scale": "x", "field": "pointX"}
              ],
              "yc": {"scale": "y", "field": "pointY"},
              "height": {"value": 40},
              "width": {"value": 9}
            }
          }
        },
        {
          "name": "layer_8_marks",
          "type": "text",
          "style": ["text"],
          "from": {"data": "data_12"},
          "encode": {
            "update": {
              "align": {"value": "left"},
              "dx": {"value": 10},
              "fontSize": {"value": 20},
              "fill": {"value": "black"},
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "y": {"value": 0},
              "text": {"signal": "''+datum[\"eventDescription\"]"},
              "baseline": {"value": "middle"}
            }
          }
        },
        {
          "name": "layer_9_marks",
          "type": "rect",
          "style": ["rect"],
          "from": {"data": "data_14"},
          "encode": {
            "update": {
              "cornerRadius": {"value": 4},
              "fill": {"value": "red"},
              "opacity": {"value": 0.35},
              "tooltip": {"signal": "''+datum[\"hiddenYs\"]"},
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "x2": [
                {
                  "test": "datum[\"x2\"] === null || isNaN(datum[\"x2\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x2"}
              ],
              "y": {"scale": "y", "field": "yLo"},
              "y2": {"scale": "y", "field": "yHi"}
            }
          }
        },
        {
          "name": "layer_10_marks",
          "type": "text",
          "style": ["text"],
          "from": {"data": "data_15"},
          "encode": {
            "update": {
              "align": {"value": "center"},
              "dx": {"value": 5},
              "dy": {"value": -17},
              "fill": {"value": "white"},
              "tooltip": {"signal": "''+datum[\"hiddenYs\"]"},
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "y": {"scale": "y", "field": "y"},
              "text": {"signal": "''+datum[\"hiddenYsAmt\"]"},
              "baseline": {"value": "middle"}
            }
          }
        },
        {
          "name": "layer_11_marks",
          "type": "rect",
          "style": ["rect"],
          "from": {"data": "data_18"},
          "encode": {
            "update": {
              "cursor": {"value": "pointer"},
              "fill": {"value": "black"},
              "opacity": {"value": 0.3},
              "href": {"signal": "''+datum[\"url\"]"},
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "x2": [
                {
                  "test": "datum[\"x2\"] === null || isNaN(datum[\"x2\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x2"}
              ],
              "y": {"scale": "y", "field": "yLo"},
              "y2": {"scale": "y", "field": "yHi"}
            }
          }
        },
        {
          "name": "layer_12_marks",
          "type": "text",
          "style": ["text"],
          "from": {"data": "data_19"},
          "encode": {
            "update": {
              "align": {"value": "left"},
              "dx": {"value": 10},
              "limit": {"value": 115},
              "cursor": {"value": "pointer"},
              "fill": {"value": "white"},
              "href": {"signal": "''+datum[\"url\"]"},
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "y": {"scale": "y", "field": "y"},
              "text": {"signal": "''+datum[\"z\"]"},
              "baseline": {"value": "middle"}
            }
          }
        },
        {
          "name": "layer_13_marks",
          "type": "text",
          "style": ["text"],
          "from": {"data": "data_21"},
          "encode": {
            "update": {
              "dy": {"value": 40},
              "fill": {"value": "black"},
              "x": [
                {
                  "test": "datum[\"x\"] === null || isNaN(datum[\"x\"])",
                  "value": 0
                },
                {"scale": "x", "field": "x"}
              ],
              "y": {"scale": "y", "field": "yLo"},
              "text": {"signal": "''+datum[\"eventValue\"]"},
              "align": {"value": "center"},
              "baseline": {"value": "middle"}
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
              {"data": "data_2", "field": "value"},
              {"data": "data_3", "field": "value"},
              {"data": "data_20", "field": "x"},
              {"data": "data_5", "field": "x"},
              {"data": "data_6", "field": "x"},
              {"data": "data_9", "field": "value"},
              {"data": "data_10", "field": "value"},
              {"data": "data_11", "field": "pointX"},
              {"data": "data_12", "field": "x"},
              {"data": "data_14", "field": "x"},
              {"data": "data_14", "field": "x2"},
              {"data": "data_15", "field": "x"},
              {"data": "data_18", "field": "x"},
              {"data": "data_18", "field": "x2"},
              {"data": "data_19", "field": "x"},
              {"data": "data_21", "field": "x"}
            ]
          },
          "range": [0, {"signal": "width"}],
          "nice": true,
          "zero": false
        },
        {
          "name": "y",
          "type": "linear",
          "domain": {
            "fields": [
              {"data": "data_2", "field": "y"},
              {"data": "data_3", "field": "y"},
              {"data": "data_20", "field": "min_y"},
              {"data": "data_20", "field": "max_y"},
              {"data": "data_5", "field": "yHigh"},
              {"data": "data_5", "field": "yLow"},
              {"data": "data_6", "field": "yHigh"},
              {"data": "data_6", "field": "yLow"},
              {"data": "data_9", "field": "pointY"},
              {"data": "data_10", "field": "pointY"},
              {"data": "data_11", "field": "pointY"},
              {"data": "data_14", "field": "yLo"},
              {"data": "data_14", "field": "yHi"},
              {"data": "data_15", "field": "y"},
              {"data": "data_18", "field": "yLo"},
              {"data": "data_18", "field": "yHi"},
              {"data": "data_19", "field": "y"},
              {"data": "data_21", "field": "yLo"}
            ]
          },
          "range": [{"signal": "height"}, 0],
          "nice": true,
          "zero": true
        },
        {
          "name": "color",
          "type": "ordinal",
          "domain": {
            "fields": [
              {"data": "data_2", "field": "strokeColor"},
              {"data": "data_9", "field": "strokeColor"}
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
          "tickCount": {"signal": "ceil(width/40)"},
          "zindex": 1
        },
        {
          "scale": "y",
          "orient": "left",
          "grid": false,
          "labelOverlap": true,
          "tickCount": {"signal": "ceil(height/40)"},
          "zindex": 1
        }
      ],
      "legends": [
        {
          "stroke": "color",
          "gradientLength": {"signal": "clamp(height, 64, 200)"},
          "symbolType": "stroke",
          "title": "Color:"
        }
      ],
      "config": {
        "axis": {
          "domainOpacity": 0,
          "grid": false,
          "labelOpacity": 0,
          "tickOpacity": 0,
        },
        "style": {"cell": {"strokeWidth": 0}}
      }
    }
  }

}
