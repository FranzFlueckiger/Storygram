import { FullConfig, Data, RenderedPoint, Event } from './Types';
import * as d3 from 'd3';
import {getCompactedLocation} from './Optimizer';

interface Binned {
  key: string
  values: RenderedPoint[],
  value: any,
  bbox?: any
}

export default class DrawSpec {

  public static createGrid(data: Data, config: FullConfig): [RenderedPoint[], number, number] {
    let result: RenderedPoint[] = [];
    const maxYLen = data.events.reduce((max, layer) => Math.max(max, layer.state.length), 0);
    const xLen = data.events.length;
    const scaling = config.eventValueScaling;
    // this is the eventValue that is shown on the legend of the chart
    // if it changes it will be drawn
    let eventValueLegend: string
    let eventValue: number | string | undefined
    let activeActors: Set<string> = new Set()
    data.events.forEach((event, eventIndex) => {
      let offset = 0;
      if (config.compact) {
        event.state = event.state.filter(y => y !== '')
      }
      let lastGroupedIndex: number | undefined = undefined
      if (eventValue === event.eventValue) {
        eventValueLegend = '-'
      } else {
        eventValue = event.eventValue
        eventValueLegend = String(event.eventValue)
      }
      event.state.forEach((actorID: string, actorIndex: number) => {
        const actor = data.actors.get(actorID)
        const isGrouped = event.group.some(a => a === actorID) ? 1 : 0;
        if (isGrouped) {
          activeActors.add(actorID)
          lastGroupedIndex = actorIndex
        }
        if (eventIndex != 0 && data.events[eventIndex - 1].remove.includes(actorID)) {
          activeActors.delete(actorID)
        }
        if (activeActors.has(actorID) || config.continuous) {
          let yDrawn = config.compact ? getCompactedLocation(actorIndex, event.state.length) : actorIndex;
          yDrawn += offset;
          const strokeWidth = config.strokeWidth(event, actor!);
          const strokeColor = config.actorColor(event, actor!);
          const xDrawn = Math.pow(scaling, 4) * event.eventXValue + (1 - Math.pow(scaling, 4)) * eventIndex;
          const eventDescription = config.eventDescription!(event);
          const url = config.url(event, actor!)
          const eventUrl = config.eventUrl(event)
          const hiddenActors = event.hiddenActors
          const isHiglighted = config.highlight.includes(actorID) ? 1 : 0
          const point = new RenderedPoint(xDrawn, yDrawn, actorID, isGrouped, strokeWidth, strokeColor, eventValueLegend, eventDescription, url, eventUrl, isHiglighted, actor!, event);
          // this is necessary to show the hidden ys counter
          if (lastGroupedIndex! < actorIndex && lastGroupedIndex != undefined) {
            result[result.length - 1].hiddenActors = hiddenActors
            lastGroupedIndex = undefined
          } else if (isGrouped && event.state.length - 1 === actorIndex) {
            point.hiddenActors = hiddenActors
          }
          result.push(point);
        }
      });
    });
    return [result, xLen, maxYLen];
  }

  public static remove(config: FullConfig) {
    if (document.getElementById("storygram" + config.uid)) {
      d3.select("#storygram" + config.uid).remove()
      d3.select("#tooltip" + config.uid).remove()
    }
  }

  public static drawD3(renderedPoints: [RenderedPoint[], number, number], config: FullConfig) {

    let width = renderedPoints[1] * config.eventPadding;
    let height = renderedPoints[2] * config.actorPadding;

    let selectedEvent: number = renderedPoints[0][0].x
    const selectedOpacity = 1
    const unSelectedOpacity = 0.25
    const selectedLineSize = config.lineSize
    const unSelectedLineSize = selectedLineSize - 3
    const opacity = 0.9
    const fontSize = 15
    const transitionSpeed = 100
    const xPadding = 0.01
    let tooltipEvent = -1
    let highlightedActors = JSON.parse(JSON.stringify(config.highlight))

    // @ts-ignore
    let svg, layer1, layer2, tooltip

    const root = d3.select(config.root);
    if (!document.getElementById("storygram" + config.uid)) {
      svg = root.append("svg")
        .attr('id', "storygram" + config.uid)
        .attr("width", width + config.marginLeft + config.marginRight)
        .attr("height", height + config.marginTop + config.marginBottom);

      tooltip = root.append("div")
        .attr('id', 'tooltip' + config.uid)
        .attr("class", "tooltip")
        .style("opacity", 0)
        // todo fix this, should be absolute or relative
        .style('position', config.tooltipPosition)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "10px")
        .style("padding", "5px")
        .style('font', String(fontSize - 3) + 'px sans-serif');
    } else {
      svg = root.select("storygram" + config.uid)
      tooltip = root.select("tooltip" + config.uid)
    }

    layer1 = svg
      .append("g")
      .attr('id', 'layer1')
      .attr("transform", "translate(" + config.marginLeft + "," + config.marginTop + ")");
    layer2 = svg
      .append("g")
      .attr('id', 'layer2')
      .attr("transform", "translate(" + config.marginLeft + "," + config.marginTop + ")");

    let actorBin: Binned[] = d3.nest()
      .key(d => d instanceof RenderedPoint ? d.z : '')
      .entries(renderedPoints[0])

    let groupBin: Binned[] = d3.nest()
      //Todo this 'casting' is ugly, numeric key?
      .key(d => d instanceof RenderedPoint ? String(d.x) : '')
      // @ts-ignore
      .rollup((p: Binned) => {
        if (Array.isArray(p) && p.every(d => d instanceof RenderedPoint)) {
          return {
            min: d3.min(p, (d: RenderedPoint) => d.y),
            max: d3.max(p, (d: RenderedPoint) => d.y),
            event: d3.values(p)
          }
        }
        return { min: null, max: null, event: null }
      })
      .entries(renderedPoints[0].filter(d => d.isGrouped))

    var colorEntries = renderedPoints[0].map(d => String(d.strokeColor))

    var color = d3.scaleOrdinal()
      .domain(colorEntries)
      .range(d3[config.colorScheme])

    var bisect = d3.bisector((d: RenderedPoint) => d.x).left;

    let xScale = d3.scaleLinear()
      .domain([d3.min(renderedPoints[0].map(d => d.x))!, d3.max(renderedPoints[0].map(d => d.x))!])
      .range([0, width]);

    let yScale = d3.scaleLinear()
      .domain([d3.min(renderedPoints[0].map(d => d.y))!, d3.max(renderedPoints[0].map(d => d.y))!])
      .range([height, 0]);

    // actor lines
    let actors = layer1.selectAll(".actors")
      .data(actorBin).enter()
      .append("path")
      .attr("class", "actor")
      .attr('stroke-linecap', 'round')
      .attr("fill", "none")
      .attr("stroke-width", unSelectedLineSize)

    // actor highlight lines
    let actorsHighlighted = layer1.selectAll(".actorsHighlighted")
      .data(actorBin.filter(actorB => {
        return highlightedActors.includes(actorB.key)
      })).enter()
      .append("path")
      .style("stroke-dasharray", "2,5")
      .attr("class", "actorHighlighted")
      .attr("fill", "none")
      .attr("stroke-width", unSelectedLineSize)

    // group lines
    let groups = layer1.selectAll(".groups")
      .data(groupBin).enter()
      .append("path")
      .attr("class", "group")
      .attr('id', d => d.key)
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
      .attr("font-size", (fontSize + 1))

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    layer2
      .append('rect')
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("class", "rect_pointerID")
      .attr('width', width)
      .attr('height', height + config.marginBottom)
      .on('mousemove', mousemove)

    drawAll()
    drawAll()

    function mousemove() {
      // recover coordinate we need
      var x0 = xScale.invert(d3.mouse(d3.event.currentTarget)[0]);
      var i = bisect(renderedPoints[0], x0, 1);
      var d0 = renderedPoints[0][i - 1].x
      var d1 = renderedPoints[0][i].x
      var d = x0 - d0 > d1 - x0 ? d1 : d0;
      selectedEvent = d
      drawAll()
    }

    function drawAll() {
      actors
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr("stroke", d => color(String(d.values[0].strokeColor)) as string)
        .attr('opacity', (d: Binned) => {
          if (d.values.some(v => v.x === selectedEvent && v.isGrouped)) return selectedOpacity
          else return unSelectedOpacity
        })
        .attr("stroke-width", (d: Binned) => {
          if (d.values.some(v => v.x === selectedEvent && v.isGrouped)) return selectedLineSize - 1
          else return unSelectedLineSize
        })
        .attr("d", (d: Binned) => {
          return d3.line()
            .x(p => xScale(p[0]))
            .y(p => yScale(p[1]))
            .curve(d3.curveMonotoneX)
            (d.values.reduce<Array<[number, number]>>((arr, p) => {
              if (p.isGrouped) {
                arr.push([p.x - xPadding, p.y])
                arr.push([p.x, p.y])
                arr.push([p.x + xPadding, p.y])
              } else {
                arr.push([p.x, p.y])
              }
              return arr
            }, []))
        })

      actorsHighlighted
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr("stroke", "black")
        .attr('opacity', (d: Binned) => {
          if (d.values.some(v => v.x === selectedEvent && v.isGrouped)) return selectedOpacity
          else return unSelectedOpacity
        })
        .attr("stroke-width", (d: Binned) => {
          if (d.values.some(v => v.x === selectedEvent && v.isGrouped)) return selectedLineSize - 1
          else return unSelectedLineSize
        })
        .attr("d", (d: Binned) => {
          return d3.line()
            .x(p => xScale(p[0]))
            .y(p => yScale(p[1]))
            .curve(d3.curveMonotoneX)
            (d.values.reduce<Array<[number, number]>>((arr, p) => {
              if (p.isGrouped) {
                arr.push([p.x - xPadding, p.y])
                arr.push([p.x, p.y])
                arr.push([p.x + xPadding, p.y])
              } else {
                arr.push([p.x, p.y])
              }
              return arr
            }, []))
        })

      //xAxis description background
      // @ts-ignore
      let xAxisLines = layer1.selectAll(".xAxisLine")
        .data(groupBin.filter((d: Binned) => {
          return d.value.event[0].eventValue != '-'
        }))
        .join((enter: any) => {
          enter.append('line')
            .attr("class", "xAxisLine")
            .attr("stroke", "black")
            .attr("stroke-width", 1.2)
            .attr("stroke-opacity", 0.4)
            .style("stroke-dasharray", ("4, 4"))
        },
          (update: any) => {
            update
              .transition()
              .duration(transitionSpeed)
              .ease(d3.easeLinear)
              .attr('x1', (d: Binned) => xScale(Number(d.key)))
              .attr('y1', 0)
              .attr('x2', (d: Binned) => xScale(Number(d.key)))
              .attr('y2', height)
          },
          (exit: any) => {
            exit.remove()
          })

      groups
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr('opacity', (d: Binned) => {
          if (Number(d.key) === selectedEvent) return unSelectedOpacity
          else return unSelectedOpacity
        })
        .attr("stroke-width", (d: Binned) => {
          if (Number(d.key) === selectedEvent) return selectedLineSize
          else return unSelectedLineSize
        })
        .attr("d", (d) => {
          return d3.line()
            .x(p => xScale(p[0]))
            .y(p => yScale(p[1]))
            .curve(d3.curveMonotoneX)
            ([[Number(d.key), d.value.min], [Number(d.key), d.value.max]])
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
        // todo
        .on("click", function (d) {
          if (config.urlOpensNewTab) window.open(d.value.event[0].eventUrl)
          else window.open(d.value.event[0].eventUrl, "_self")
        })
        .on(
          //@ts-ignore
          "mouseover", function (d) {
            //@ts-ignore
            d3.select(this).style("cursor", "pointer")
          })
        .on(
          //@ts-ignore
          "mouseout", function (d) {
            //@ts-ignore
            d3.select(this).style("cursor", "default");
          })
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr("x", xScale(selectedEvent) + 10)
        .attr("y", -35)
        .text((d) => {
          if (Number(d.key) === selectedEvent)
            return d.value.event[0].eventDescription
        })

      //xAxis description
      // @ts-ignore
      let xAxis = layer1.selectAll(".xAxis")
        .data(groupBin)
        .join((enter: any) => {
          enter.append('text')
            .attr("class", "xAxis")
            .attr("font-family", "sans-serif")
        },
          (update: any) => {
            update
              .transition()
              .duration(transitionSpeed)
              .ease(d3.easeLinear)
              .attr('text-anchor', 'end')
              .attr("x", (d: Binned) => xScale(d.value.event[0].x))
              .attr("y", height + 60)
              .attr('id', (_: any, i: number) => i)
              .attr("font-size", (d: Binned) => Number(d.key) === selectedEvent ? (fontSize - 2) + "px" : (fontSize - 3) + "px")
              .attr('font-weight', (d: Binned) => Number(d.key) === selectedEvent ? 'bold' : 'normal')
              .text((d: Binned) => {
                return d.value.event[0].eventValue
              })
              .attr("transform", (d: Binned) => "rotate(-45, " + (xScale(d.value.event[0].x) - 35) + ", " + (height + 35) + ")")
          },
          (exit: any) => {
            exit.remove()
          })

      // @ts-ignore
      let hiddenActors = layer2.selectAll(".hiddenActors")
        .data(groupBin.reduce<RenderedPoint[]>((arr, d) => {
          d.value.event.forEach((v: RenderedPoint) => {
            if (v.hiddenActors.length > 0) arr.push(v)
          })
          return arr
        }, []), (d: RenderedPoint) => String(d.x))
        .join(
          (enter: any) => enter.append("text")
            .attr("class", "hiddenActors")
            .attr("font-family", "sans-serif")
            .attr("font-size", (fontSize - 4) + "px")
            .attr('fill', 'white')
            .attr("dominant-baseline", "middle")
            .attr("x", (d: RenderedPoint) => xScale(d.x) + 8.)
            .attr("y", (d: RenderedPoint) => yScale(d.y) + 0.4)
            .text((d: RenderedPoint) => d.hiddenActors ? d.hiddenActors.length : '')
            .call(getTextBox),
          (update: any) => update
            .transition()
            .duration(transitionSpeed)
            .ease(d3.easeLinear)
            .attr("y", (d: RenderedPoint) => {
              if (d.x === selectedEvent) return yScale(d.y) - 25.5
              else return yScale(d.y) + 0.4
            })
            .call(getTextBox),
          (exit: any) => {
            exit.remove()
          }
        )

      //hidden actors => invisible to get bounding box 
      //@ts-ignore
      let hiddenActorsBackground = layer1.selectAll(".hiddenActorsBackground")
        .data(groupBin.reduce<RenderedPoint[]>((arr, d: Binned) => {
          d.value.event.forEach((v: any) => {
            if (v.hiddenActors.length > 0) arr.push(v)
          })
          return arr
        }, []), (d: RenderedPoint) => String(d.x))
        .join(
          (enter: any) => enter.append("rect")
            .attr("class", "hiddenActorsBackground")
            .attr('opacity', 0.4)
            .attr('fill', 'red')
            .attr('rx', 4)
            .attr('ry', 4)
            .style('stroke-width', 1)
            .style('stroke', 'gray')
            .attr("width", (d: RenderedPoint) => d.bbox.width + 2)
            .attr("height", (d: RenderedPoint) => d.bbox.height),
          (update: any) => update
            .transition()
            .duration(transitionSpeed)
            .ease(d3.easeLinear)
            .attr('opacity', (d: RenderedPoint) => {
              if (d.x === selectedEvent) return opacity
              else return 0.4
            })
            .attr("x", (d: RenderedPoint) => xScale(d.x) + 7.25)
            .attr("y", (d: RenderedPoint) => {
              if (d.x === selectedEvent) return yScale(d.y) - 32.5;
              else return yScale(d.y) - selectedLineSize / 2 - 2
            })
            .text((d: RenderedPoint) => d.hiddenActors ? d.hiddenActors.length : ''),
          (exit: any) => {
            exit.remove()
          }
        )

      function showTooltip(d: RenderedPoint) {
        // @ts-ignore
        tooltip.transition()
          .duration(transitionSpeed)
          .style("opacity", opacity);
        // @ts-ignore
        tooltip
          .attr("font-size", (fontSize - 10) + "px")
          .html('<b>' + config.hiddenActorsTooltipTitle + ':</b>' + d.hiddenActors.map(p => '<br>' + p))
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("width", "200px")
        tooltipEvent = d.x
      }

      if (tooltipEvent != selectedEvent) {
        // @ts-ignore
        tooltip
          .html('')
          .style("opacity", .0);
      }

      hiddenActors.on(
        //@ts-ignore
        "mouseover", function (d) {
          //@ts-ignore
          showTooltip(d)
        })
        .on(
          //@ts-ignore
          "mouseout", function (d) {
            //@ts-ignore
            d3.select(this).style("cursor", "default");
          })

      //@ts-ignore
      let actorEvents = layer1.selectAll(".actorEvent")
        .data(actorBin.filter((d: Binned) => d.values.some(v => v.x === selectedEvent && v.isGrouped))
          .reduce<RenderedPoint[]>((arr, d) => {
            d.values.forEach(v => {
              if (v.isGrouped) arr.push(v)
            })
            return arr
          }, []), (d: RenderedPoint) => {
            return String(d.x) + ' ' + String(d.y) + ' ' + d.z
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
            .attr("y1", (d: RenderedPoint) => yScale(d.y) - config.actorPadding / 5)
            .attr("y2", (d: RenderedPoint) => yScale(d.y) + config.actorPadding / 5)
            .attr("stroke-opacity", opacity),
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

      // @ts-ignore
      let actorDescInv = layer1.selectAll(".actorDescInv")
        .data(groupBin.filter(d => d.value.event[0].x === selectedEvent)[0].value.event,
          //@ts-ignore
          (d: RenderedPoint) => d.z)
        .join(
          (enter: any) => {
            enter
              .append("text")
              .attr("class", "actorDescInv")
              .attr("font-family", "sans-serif")
              .attr("font-size", (config.lineSize + 3) + "px")
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

      // @ts-ignore
      let actorDescBackground = layer2.selectAll(".actorDescBackground")
        .data(groupBin.filter(d => d.value.event[0].x === selectedEvent)[0].value.event,
          //@ts-ignore
          (d: RenderedPoint) => d.z)
        .join(
          (enter: any) => {
            enter
              .append("rect")
              .attr("class", "actorDescBackground")
              .attr('opacity', opacity)
              .attr('fill', 'white')
              .attr('rx', 10)
              .attr('ry', 10)
              .style('stroke-width', 3)
              .style('stroke', (d: RenderedPoint) => color(String(d.strokeColor)) as string)
              .attr("x", xScale(selectedEvent) + selectedLineSize / 2 + 5)
              .attr("y", (d: RenderedPoint) => d.bbox.y - 5)
              .attr("width", (d: RenderedPoint) => d.bbox.width + 10)
              .attr("height", (d: RenderedPoint) => d.bbox.height + 10)
          },
          (update: any) => {
            update.transition()
              .duration(transitionSpeed)
              .ease(d3.easeLinear)
              .attr("x", xScale(selectedEvent) + selectedLineSize / 2 + 5)
              .attr("y", (d: RenderedPoint) => d.bbox.y - 5)
          },
          (exit: any) => {
            exit
              .remove()
          }
        );

      // @ts-ignore
      let actorDesc = layer2.selectAll(".actorDesc")
        .data(groupBin.filter(d => d.value.event[0].x === selectedEvent)[0].value.event,
          //@ts-ignore
          (d: RenderedPoint) => d.z)
        .join(
          (enter: any) => {
            enter
              .append("text")
              .attr("class", "actorDesc")
              .attr("font-family", "sans-serif")
              .attr("font-size", (config.lineSize + 3) + "px")
              .attr("dominant-baseline", "middle")
              .attr("x", (d: RenderedPoint) => xScale(d.x) + selectedLineSize / 2 + 10)
              .attr("y", (d: RenderedPoint) => yScale(d.y))
              .text((d: RenderedPoint) => d.z)
              .on("click", function (d: RenderedPoint) {
                if(config.urlOpensNewTab) window.open(d.url)
                else window.open(d.url, "_self")
              })
              .on(
                //@ts-ignore
                "mouseover", function (d: RenderedPoint) {
                  //@ts-ignore
                  if (!highlightedActors.includes(d.z)) highlightedActors.push(d.z)
                  // @ts-ignore
                  d3.select(this).style("cursor", "pointer")
                  drawAll()
                })
              .on(
                //@ts-ignore
                "mouseout", function (d: RenderedPoint) {
                  //@ts-ignore
                  highlightedActors = highlightedActors.filter(h => h !== d.z || config.highlight.includes(d.z))
                  // @ts-ignore
                  d3.select(this).style("cursor", "default");
                  drawAll()
                })
          },
          (update: any) => {
            update.transition()
              .duration(transitionSpeed)
              .ease(d3.easeLinear)
              .attr("x", (d: RenderedPoint) => xScale(d.x) + selectedLineSize / 2 + 10)
              .attr("y", (d: RenderedPoint) => yScale(d.y))
          },
          (exit: any) => {
            exit
              .remove()
          }
        );

      function getTextBox(selection: any) {
        //@ts-ignore
        selection.each(function (d: RenderedPoint) { d.bbox = this.getBBox() })
      }

    }

  }

}
