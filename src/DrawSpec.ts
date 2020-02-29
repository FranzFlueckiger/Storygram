import {FullConfig, Data, RenderedPoint, Event} from './Types';
import d3 = require('d3');

interface Binned {
  key: string
  values: RenderedPoint[],
  value: any,
  bbox?: any
}

export default class DrawSpec {

  private static margin = {top: 50, right: 400, bottom: 200, left: 100}

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
    data.events.forEach((xLayer, eventIndex) => {
      let offset = 0;
      if(config.compact) {
        xLayer.state = xLayer.state.filter(y => y !== '')
        offset = xLayer.state.length % 2 === 0 ? -0.5 : 0;
      }
      let lastGroupedIndex: number | undefined = undefined
      if(eventValue === xLayer.eventValue) {
        eventValueLegend = '-'
      } else {
        eventValue = xLayer.eventValue
        eventValueLegend = String(xLayer.eventValue)
      }
      xLayer.state.forEach((actorID: string, actorIndex: number) => {
        const yVal = data.actors.get(actorID)
        const isGrouped = xLayer.group.some(a => a === actorID) ? 1 : 0;
        if(isGrouped) {
          activeActors.add(actorID)
          lastGroupedIndex = actorIndex
        }
        if(eventIndex != 0 && data.events[eventIndex - 1].remove.includes(actorID)) {
          activeActors.delete(actorID)
        }
        if(activeActors.has(actorID) || config.continuousStart) {
          let yDrawn = config.compact ? (xLayer.state.length - 1) / 2 - actorIndex : actorIndex;
          yDrawn += offset;
          const strokeWidth = config.strokeWidth(xLayer, yVal!);
          const strokeColor = config.strokeColor(xLayer, yVal!);
          const xDrawn = Math.pow(scaling, 4) * xLayer.eventXValue + (1 - Math.pow(scaling, 4)) * eventIndex;
          const eventDescription = config.eventDescription!(xLayer);
          const url = config.url(xLayer, yVal!)
          const hiddenActors = xLayer.hiddenActors
          const isHiglighted = config.highlight.includes(actorID) ? 1 : 0
          const point = new RenderedPoint(xDrawn, yDrawn, actorID, isGrouped, strokeWidth, strokeColor, eventValueLegend, eventDescription, url, isHiglighted);
          // this is necessary to show the hidden ys counter
          if(lastGroupedIndex! < actorIndex && lastGroupedIndex != undefined) {
            result[result.length - 1].hiddenActors = hiddenActors
            lastGroupedIndex = undefined
          } else if(isGrouped && xLayer.state.length - 1 === actorIndex) {
            point.hiddenActors = hiddenActors
          }
          result.push(point);
        }
      });
    });
    return [result, xLen, maxYLen];
  }

  public static drawD3(data: [RenderedPoint[], number, number], config: FullConfig) {

    let width = data[1] * config.eventPadding;
    let height = data[2] * config.actorPadding;

    let selectedEvent: number = data[0][0].x
    const selectedOpacity = 1
    const unSelectedOpacity = 0.25
    const selectedLineSize = config.lineSize
    const unSelectedLineSize = selectedLineSize - 3
    const opacity = 0.9
    const fontSize = 15
    const transitionSpeed = 100
    const xPadding = 0.01
    let tooltipEvent = -1

    // @ts-ignore
    let svg, layer1, layer2, tooltip

    if(document.getElementById("storygram")) {
      svg = d3.select("#storygram").remove()
    }

    svg = d3.select(config.root).append("svg")
      .attr('id', 'storygram')
      .attr("width", width + this.margin.left + this.margin.right)
      .attr("height", height + this.margin.top + this.margin.bottom);

    layer1 = svg
      .append("g")
      .attr('id', 'layer1')
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    layer2 = svg
      .append("g")
      .attr('id', 'layer2')
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    tooltip = d3.select(config.root).append("div")
      .attr('id', 'tooltip')
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style('position', 'absolute')
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "10px")
      .style("padding", "5px")
      .style('font', String(fontSize - 3) + 'px sans-serif');

    let actorBin: Binned[] = d3.nest()
      .key(d => d instanceof RenderedPoint ? d.z : '')
      .entries(data[0])

    let groupBin: Binned[] = d3.nest()
      //Todo this 'casting' is ugly, numeric key?
      .key(d => d instanceof RenderedPoint ? String(d.x) : '')
      // @ts-ignore
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

    var colorEntries = data[0].map(d => String(d.strokeColor))

    var color = d3.scaleOrdinal()
      .domain(colorEntries)
      .range(d3[config.colorScheme])

    var bisect = d3.bisector((d: RenderedPoint) => d.x).left;

    let xScale = d3.scaleLinear()
      .domain([d3.min(data[0].map(d => d.x))!, d3.max(data[0].map(d => d.x))!])
      .range([0, width]);

    let yScale = d3.scaleLinear()
      .domain([d3.min(data[0].map(d => d.y))!, d3.max(data[0].map(d => d.y))!])
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
      .data(actorBin).enter()
      .append("path")
      .attr("class", "actorHighlighted")
      .attr('stroke-linecap', 'round')
      .attr("fill", "none")
      .attr("stroke-width", 2)

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
      .attr('height', height)
      .on('mousemove', mousemove)

    drawAll()
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
    }

    function drawAll() {
      actors
        .transition()
        .duration(transitionSpeed)
        .ease(d3.easeLinear)
        .attr("stroke", d => color(String(d.values[0].strokeColor)) as string)
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
            (d.values.reduce<Array<[number, number]>>((arr, p) => {
              if(p.isGrouped) {
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
            update.transition()
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
            if(v.hiddenActors.length > 0) arr.push(v)
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
              if(d.x === selectedEvent) return yScale(d.y) - 25.5
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
            if(v.hiddenActors.length > 0) arr.push(v)
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
              if(d.x === selectedEvent) return opacity
              else return 0.4
            })
            .attr("x", (d: RenderedPoint) => xScale(d.x) + 7.25)
            .attr("y", (d: RenderedPoint) => {
              if(d.x === selectedEvent) return yScale(d.y) - 31
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
          .html('<b>Hidden actors:</b>' + d.hiddenActors.map(p => '<br>' + p))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("width", "200px")
        tooltipEvent = d.x
      }

      if(tooltipEvent != selectedEvent) {
        // @ts-ignore
        tooltip
          .html('')
          .style("opacity", .0);
      }

      hiddenActors.on(
        //@ts-ignore
        "mouseover", function(d) {
          //@ts-ignore
          d3.select(this).style("cursor", "pointer")
        })
        .on(
          //@ts-ignore
          "mouseout", function(d) {
            //@ts-ignore
            d3.select(this).style("cursor", "default");
          })
        //@ts-ignore
        .on("click", function(d) {
          showTooltip(d)
        })

      //@ts-ignore
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
            .attr("y1", (d: RenderedPoint) => yScale(d.y) - config.eventPadding / 5)
            .attr("y2", (d: RenderedPoint) => yScale(d.y) + config.eventPadding / 5)
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
              .on("click", function(d: RenderedPoint) {
                window.open(d.url)
              })
              .on(
                //@ts-ignore
                "mouseover", function(d) {
                  //@ts-ignore
                  d3.select(this).style("cursor", "pointer")
                })
              .on(
                //@ts-ignore
                "mouseout", function(d) {
                  //@ts-ignore
                  d3.select(this).style("cursor", "default");
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
        selection.each(function(d: RenderedPoint) {d.bbox = this.getBBox()})
      }

    }

  }

}
