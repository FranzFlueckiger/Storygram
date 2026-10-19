import * as d3 from 'd3';
import type { RenderedPoint } from '../Types';
import { actorPath, groupPath } from './model';
import { hideTooltip, showTooltip } from './tooltip';
import { BADGE_OFFSET_Y } from './types';
import type { ActorSeries, ChartSelection, EventGroup, RenderChart, RenderModel, RenderState } from './types';

export function ensureChart(model: RenderModel): RenderChart {
  const { config } = model;
  const root = d3.select(config.root) as ChartSelection<HTMLElement>;
  const svgID = 'storygram' + config.uid;
  const tooltipID = 'tooltip' + config.uid;

  let svg = root.select<SVGSVGElement>('#' + svgID);
  if (svg.empty()) {
    svg = root.append<SVGSVGElement>('svg').attr('id', svgID);
  }
  svg
    .attr('width', model.dimensions.width)
    .attr('height', model.dimensions.height);

  let tooltip = root.select<HTMLDivElement>('#' + tooltipID);
  if (tooltip.empty()) {
    tooltip = root.append<HTMLDivElement>('div').attr('id', tooltipID);
  }
  tooltip
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .style('position', config.tooltipPosition)
    .style('background-color', 'white')
    .style('border-radius', '10px')
    .style('padding', '8px 10px')
    .style('box-shadow', '0 0 0 1px rgba(0,0,0,.08), 0 4px 14px rgba(0,0,0,.12)')
    .style('max-width', '240px')
    .style('font', '12px/1.45 sans-serif');

  const layer1 = ensureLayer(svg, 1, config.uid);
  const layer2 = ensureLayer(svg, 2, config.uid);
  const translate = 'translate(' + config.marginLeft + ',' + config.marginTop + ')';
  layer1.attr('transform', translate);
  layer2.attr('transform', translate);

  let pointerRect = layer2.select<SVGRectElement>('rect.rect_pointerID');
  if (pointerRect.empty()) {
    pointerRect = layer2.insert<SVGRectElement>('rect', ':first-child')
      .attr('class', 'rect_pointerID');
  }
  pointerRect
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .attr('width', model.dimensions.plotWidth)
    .attr('height', model.dimensions.plotHeight + config.marginBottom);

  return { root, svg, tooltip, layer1, layer2, pointerRect };
}

function ensureLayer(
  svg: ChartSelection<SVGSVGElement>,
  index: number,
  uid: string,
): ChartSelection<SVGGElement> {
  const id = 'layer' + index + '-' + uid;
  let layer = svg.select<SVGGElement>('#' + id);
  if (layer.empty()) {
    layer = svg.append<SVGGElement>('g').attr('id', id).attr('class', 'layer' + index);
  }
  return layer;
}

export function renderStatic(
  chart: RenderChart,
  model: RenderModel,
  state: RenderState,
): void {
  chart.layer1.selectAll<SVGPathElement, ActorSeries>('path.actor')
    .data(model.actorSeries, series => series.key)
    .join(
      enter => enter
        .append('path')
        .attr('class', 'actor')
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none')
        .attr('stroke-width', model.unselectedLineSize),
      update => update,
      exit => exit.remove(),
    )
    .attr('stroke', series => model.color(String(series.values[0].strokeColor)))
    .attr('d', series => actorPath(model, series.values));

  chart.layer1.selectAll<SVGPathElement, EventGroup>('path.group')
    .data(model.eventGroups, group => group.key)
    .join(
      enter => enter
        .append('path')
        .attr('class', 'group')
        .attr('id', group => group.key)
        .attr('stroke', 'black')
        .attr('stroke-width', model.unselectedLineSize)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none'),
      update => update,
      exit => exit.remove(),
    )
    .attr('d', group => groupPath(model, group));

  chart.layer1.selectAll<SVGLineElement, EventGroup>('line.xAxisLine')
    .data(
      model.eventGroups.filter(group => group.eventValue !== '-'),
      group => group.key,
    )
    .join(
      enter => enter
        .append('line')
        .attr('class', 'xAxisLine')
        .attr('stroke', 'black')
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.4)
        .style('stroke-dasharray', '4, 4'),
      update => update,
      exit => exit.remove(),
    )
    .attr('x1', group => model.xScale(group.x))
    .attr('y1', 0)
    .attr('x2', group => model.xScale(group.x))
    .attr('y2', model.dimensions.plotHeight);

  chart.layer1.selectAll<SVGTextElement, EventGroup>('text.xAxis')
    .data(model.eventGroups, group => group.key)
    .join(
      enter => enter
        .append('text')
        .attr('class', 'xAxis')
        .attr('font-family', 'sans-serif'),
      update => update,
      exit => exit.remove(),
    )
    .attr('text-anchor', 'end')
    .attr('x', group => model.xScale(group.x))
    .attr('y', model.dimensions.plotHeight + 60)
    .attr('id', (_group, index) => index)
    .attr('transform', group =>
      'rotate(-45, ' + (model.xScale(group.x) - 35) + ', ' + (model.dimensions.plotHeight + 35) + ')')
    .text(group => String(group.eventValue));

  chart.layer2.selectAll<SVGGElement, RenderedPoint>('g.hiddenActorsBadge')
    .data(model.hiddenActorPoints, point => String(point.x))
    .join(
      enter => {
        const badge = enter
          .append('g')
          .attr('class', 'hiddenActorsBadge')
          .style('cursor', 'pointer');
        badge.append('text')
          .attr('class', 'hiddenActorsBadgeText')
          .attr('font-family', 'sans-serif')
          .attr('font-size', '10px')
          .attr('font-weight', 700)
          .attr('fill', '#991b1b')
          .attr('stroke', 'white')
          .attr('stroke-width', 2.5)
          .attr('stroke-linejoin', 'round')
          .attr('paint-order', 'stroke')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle');
        return badge;
      },
      update => update,
      exit => exit.remove(),
    )
    .attr('transform', point =>
      'translate(' + model.xScale(point.x) + ',' + (model.yScale(point.y) - BADGE_OFFSET_Y) + ')')
    .on('mouseover', function (this: SVGGElement, event: MouseEvent, point: RenderedPoint) {
      d3.select(this).style('cursor', 'pointer');
      showTooltip(chart, model, state, event, point);
    })
    .on('mouseout', function () {
      hideTooltip(chart, state);
    })
    .select<SVGTextElement>('text.hiddenActorsBadgeText')
    .text(point => String(point.hiddenActors.length));

  chart.layer2.selectAll<SVGGElement, RenderedPoint>('g.hiddenActorsBadge')
    .attr('opacity', point => point.x === state.selectedX ? 1 : 0.8);
}
