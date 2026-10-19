import * as d3 from 'd3';
import type { RenderedPoint } from '../Types';
import { actorPath, hasGroupedPointAt } from './model';
import {
  FONT_SIZE,
  OPACITY,
  SELECTED_OPACITY,
  TRANSITION_MS,
  UNSELECTED_OPACITY,
} from './types';
import type {
  ActorSeries,
  EventGroup,
  RenderChart,
  RenderModel,
  RenderState,
} from './types';

export function renderSelection(
  chart: RenderChart,
  model: RenderModel,
  state: RenderState,
): void {
  const selectedGroup = state.selectedX === null
    ? undefined
    : model.eventByX.get(state.selectedX);
  const selectedX = selectedGroup ? selectedGroup.x : null;
  const ruleData = selectedGroup ? [selectedGroup] : [];
  const labelData = selectedGroup ? selectedGroup.points : [];

  chart.layer1.selectAll<SVGPathElement, ActorSeries>('path.actor')
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .attr('opacity', series =>
      hasGroupedPointAt(series, selectedX) ? SELECTED_OPACITY : UNSELECTED_OPACITY)
    .attr('stroke-width', series =>
      hasGroupedPointAt(series, selectedX)
        ? model.selectedLineSize - 1
        : model.unselectedLineSize);

  chart.layer1.selectAll<SVGPathElement, ActorSeries>('path.actorHighlighted')
    .data(
      model.actorSeries.filter(series => state.highlighted.has(series.key)),
      series => series.key,
    )
    .join(
      enter => enter
        .insert('path', 'path.group')
        .attr('class', 'actorHighlighted')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .style('stroke-dasharray', '2,5'),
      update => update,
      exit => exit.remove(),
    )
    .attr('stroke-linecap', 'butt')
    .attr('d', series => actorPath(model, series.values))
    .attr('opacity', series =>
      hasGroupedPointAt(series, selectedX) ? SELECTED_OPACITY : UNSELECTED_OPACITY)
    .attr('stroke-width', series =>
      hasGroupedPointAt(series, selectedX)
        ? model.selectedLineSize - 1
        : model.unselectedLineSize);

  chart.layer1.selectAll<SVGPathElement, EventGroup>('path.group')
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .attr('opacity', UNSELECTED_OPACITY)
    .attr('stroke-width', group =>
      group.x === selectedX ? model.selectedLineSize : model.unselectedLineSize);

  const ruleSelection = chart.layer1.selectAll<SVGLineElement, EventGroup>('line.rule')
    .data(ruleData);
  const ruleEnter = ruleSelection
    .enter()
    .append('line')
    .attr('class', 'rule')
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .attr('fill', 'none')
    .attr('x1', group => model.xScale(group.x))
    .attr('y1', 0)
    .attr('x2', group => model.xScale(group.x))
    .attr('y2', model.dimensions.plotHeight);
  ruleSelection.exit().remove();
  ruleEnter
    .merge(ruleSelection)
    .attr('y1', 0)
    .attr('y2', model.dimensions.plotHeight);
  ruleSelection
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .attr('x1', group => model.xScale(group.x))
    .attr('x2', group => model.xScale(group.x));

  const descriptionSelection = chart.layer1
    .selectAll<SVGTextElement, EventGroup>('text.event_desc')
    .data(ruleData);
  const descriptionEnter = descriptionSelection
    .enter()
    .append('text')
    .attr('class', 'event_desc')
    .attr('font-family', 'sans-serif')
    .attr('font-size', FONT_SIZE + 1)
    .attr('x', group => model.xScale(group.x) + 10)
    .attr('y', -35);
  descriptionSelection.exit().remove();
  descriptionEnter
    .merge(descriptionSelection)
    .text(group => group.eventDescription)
    .on('click', (_event: MouseEvent, group: EventGroup) => {
      openUrl(group.eventUrl, model.config.urlOpensNewTab);
    })
    .on('mouseover', function (this: SVGTextElement) {
      d3.select(this).style('cursor', 'pointer');
    })
    .on('mouseout', function (this: SVGTextElement) {
      d3.select(this).style('cursor', 'default');
    });
  descriptionSelection
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .attr('x', group => model.xScale(group.x) + 10)
    .attr('y', -35);

  chart.layer1.selectAll<SVGTextElement, EventGroup>('text.xAxis')
    .attr('font-size', group =>
      group.x === selectedX ? (FONT_SIZE - 2) + 'px' : (FONT_SIZE - 3) + 'px')
    .attr('font-weight', group => group.x === selectedX ? 'bold' : 'normal');

  chart.layer2.selectAll<SVGGElement, RenderedPoint>('g.hiddenActorsBadge')
    .attr('opacity', point => point.x === selectedX ? 1 : 0.8);

  const markerData = selectedGroup
    ? model.actorSeries
      .filter(series =>
        series.values.some(point => point.x === selectedGroup.x && point.isGrouped))
      .reduce<RenderedPoint[]>((result, series) => {
        series.values.forEach(point => {
          if (point.isGrouped) result.push(point);
        });
        return result;
      }, [])
    : [];

  const markerSelection = chart.layer1
    .selectAll<SVGLineElement, RenderedPoint>('line.actorEvent')
    .data(markerData, point => point.x + ' ' + point.y + ' ' + point.z);
  const markerEnter = markerSelection
    .enter()
    .append('line')
    .attr('class', 'actorEvent')
    .attr('stroke', 'black')
    .attr('stroke-width', model.selectedLineSize)
    .attr('stroke-linecap', 'round')
    .attr('fill', 'none');
  markerSelection.exit().remove();
  markerEnter
    .merge(markerSelection)
    .attr('x1', point => model.xScale(point.x))
    .attr('x2', point => model.xScale(point.x))
    .attr('y1', point => model.yScale(point.y) - model.config.actorPadding / 5)
    .attr('y2', point => model.yScale(point.y) + model.config.actorPadding / 5)
    .attr('stroke-opacity', OPACITY);

  const measureSelection = chart.layer1
    .selectAll<SVGTextElement, RenderedPoint>('text.actorDescInv')
    .data(labelData, point => point.z);
  const measureEnter = measureSelection
    .enter()
    .append('text')
    .attr('class', 'actorDescInv')
    .attr('font-family', 'sans-serif')
    .attr('font-size', (model.config.lineSize + 3) + 'px')
    .attr('dominant-baseline', 'middle')
    .attr('opacity', 0);
  measureSelection.exit().remove();
  measureEnter
    .merge(measureSelection)
    .attr('x', point => model.xScale(point.x) + 10)
    .attr('y', point => model.yScale(point.y))
    .text(point => point.z)
    .each(function (this: SVGTextElement, point: RenderedPoint) {
      point.bbox = this.getBBox();
    });

  const backgroundSelection = chart.layer2
    .selectAll<SVGRectElement, RenderedPoint>('rect.actorDescBackground')
    .data(labelData, point => point.z);
  const backgroundEnter = backgroundSelection
    .enter()
    .append('rect')
    .attr('class', 'actorDescBackground')
    .attr('opacity', OPACITY)
    .attr('fill', 'white')
    .attr('rx', 10)
    .attr('ry', 10)
    .style('stroke-width', 3)
    .style('cursor', 'pointer')
    .attr('x', point => model.xScale(point.x) + model.selectedLineSize / 2 + 5)
    .attr('y', point => point.bbox.y - 5);
  backgroundSelection.exit().remove();
  backgroundEnter
    .merge(backgroundSelection)
    .attr('width', point => point.bbox.width + 10)
    .attr('height', point => point.bbox.height + 10)
    .attr('fill', 'white')
    .style('stroke', point => model.color(String(point.strokeColor)))
    .on('click', (_event: MouseEvent, point: RenderedPoint) => {
      openUrl(point.url, model.config.urlOpensNewTab);
    });
  backgroundSelection
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .attr('x', point => model.xScale(point.x) + model.selectedLineSize / 2 + 5)
    .attr('y', point => point.bbox.y - 5);

  const labelSelection = chart.layer2
    .selectAll<SVGTextElement, RenderedPoint>('text.actorDesc')
    .data(labelData, point => point.z);
  const labelEnter = labelSelection
    .enter()
    .append('text')
    .attr('class', 'actorDesc')
    .attr('font-family', 'sans-serif')
    .attr('font-size', (model.config.lineSize + 3) + 'px')
    .attr('dominant-baseline', 'middle')
    .attr('x', point => model.xScale(point.x) + model.selectedLineSize / 2 + 10)
    .attr('y', point => model.yScale(point.y));
  labelSelection.exit().remove();
  labelEnter
    .merge(labelSelection)
    .text(point => point.z)
    .on('click', (_event: MouseEvent, point: RenderedPoint) => {
      openUrl(point.url, model.config.urlOpensNewTab);
    })
    .on('mouseover', function (this: SVGTextElement, _event: MouseEvent, point: RenderedPoint) {
      if (!state.highlighted.has(point.z)) {
        state.highlighted.add(point.z);
        renderSelection(chart, model, state);
      }
      d3.select(this).style('cursor', 'pointer');
    })
    .on('mouseout', function (this: SVGTextElement, _event: MouseEvent, point: RenderedPoint) {
      if (!model.config.highlight.includes(point.z)) {
        state.highlighted.delete(point.z);
        renderSelection(chart, model, state);
      }
      d3.select(this).style('cursor', 'default');
    });
  labelSelection
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .attr('x', point => model.xScale(point.x) + model.selectedLineSize / 2 + 10)
    .attr('y', point => model.yScale(point.y));
}

function openUrl(url: string, newTab: boolean): void {
  if (newTab) window.open(url);
  else window.open(url, '_self');
}
