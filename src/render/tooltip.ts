import * as d3 from 'd3';
import type { RenderedPoint } from '../Types';
import { OPACITY, TRANSITION_MS } from './types';
import type { RenderChart, RenderModel, RenderState } from './types';

export function showTooltip(
  chart: RenderChart,
  model: RenderModel,
  state: RenderState,
  event: MouseEvent,
  point: RenderedPoint,
): void {
  chart.tooltip
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .style('opacity', OPACITY);

  chart.tooltip
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY - 28) + 'px')
    .style('width', '200px');

  chart.tooltip.selectAll('*').remove();
  chart.tooltip
    .append('b')
    .text(model.config.hiddenActorsTooltipTitle + ':');
  point.hiddenActors.forEach(actorID => {
    chart.tooltip.append('br');
    chart.tooltip.append('span').text(actorID);
  });

  state.tooltipEventX = point.x;
}

export function hideTooltip(chart: RenderChart, state: RenderState): void {
  chart.tooltip
    .transition()
    .duration(TRANSITION_MS)
    .ease(d3.easeLinear)
    .style('opacity', 0);
  chart.tooltip.selectAll('*').remove();
  state.tooltipEventX = -1;
}
