import * as d3 from 'd3';
import type { RenderedPoint } from '../Types';
import { hideTooltip } from './tooltip';
import type { RenderChart, RenderModel, RenderState } from './types';

const IGNORED_TARGETS = '.actorDescBackground, .actorDesc, .event_desc, .hiddenActorsBadge';

export function attachInteraction(
  chart: RenderChart,
  model: RenderModel,
  state: RenderState,
  renderSelection: () => void,
): void {
  const pointerRect = chart.pointerRect.node();
  const bisect = d3.bisector((point: RenderedPoint) => point.x).center;

  chart.svg.on('mousemove.storygram', function (event: MouseEvent) {
    const target = event.target as Element | null;
    if (target?.closest?.(IGNORED_TARGETS)) {
      return;
    }
    if (!pointerRect || model.points.length === 0) {
      return;
    }

    const [pointerX, pointerY] = d3.pointer(event, pointerRect);
    const { plotWidth, plotHeight, marginBottom } = model.dimensions;
    if (
      pointerX < 0 ||
      pointerX > plotWidth ||
      pointerY < 0 ||
      pointerY > plotHeight + marginBottom
    ) {
      return;
    }

    const index = bisect(model.points, model.xScale.invert(pointerX));
    const next = model.points[Math.max(0, Math.min(model.points.length - 1, index))];
    if (next.x === state.selectedX) {
      return;
    }

    state.selectedX = next.x;
    if (state.tooltipEventX !== state.selectedX) {
      hideTooltip(chart, state);
    }
    renderSelection();
  });
}
