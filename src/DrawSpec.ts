import { FullConfig, Data, RenderedPoint } from './Types';
import { buildLayout } from './Layout';
import { buildRenderModel } from './render/model';
import { ensureChart, renderStatic } from './render/chart';
import { renderSelection } from './render/selection';
import { attachInteraction } from './render/interaction';
import type { RenderState } from './render/types';

export function createGrid(data: Data, config: FullConfig): [RenderedPoint[], number, number] {
    const layout = buildLayout(data, config);
    const result: RenderedPoint[] = [];
    // this is the eventValue that is shown on the legend of the chart
    // if it changes it will be drawn
    let eventValueLegend: string
    let eventValue: number | string | undefined

    layout.events.forEach((eventLayout) => {
      const event = eventLayout.event;
      let badgePoint: RenderedPoint | undefined
      let badgeY = Number.NEGATIVE_INFINITY
      if (eventValue === event.eventValue) {
        eventValueLegend = '-'
      } else {
        eventValue = event.eventValue
        eventValueLegend = String(event.eventValue)
      }
      eventLayout.state.forEach((actorID: string) => {
        const actor = data.actors.get(actorID)
        const isGrouped = event.group.some(a => a === actorID) ? 1 : 0;
        if (!eventLayout.drawn.has(actorID)) {
          return
        }
        const yDrawn = eventLayout.y.get(actorID)!;
        const strokeWidth = config.strokeWidth(event, actor!);
        const strokeColor = config.actorColor(event, actor!);
        const eventDescription = config.eventDescription!(event);
        const url = config.url(event, actor!)
        const eventUrl = config.eventUrl(event)
        const isHiglighted = config.highlight.includes(actorID) ? 1 : 0
        const point = new RenderedPoint(eventLayout.x, yDrawn, actorID, isGrouped, strokeWidth, strokeColor, eventValueLegend, eventDescription, url, eventUrl, isHiglighted, actor!, event);
        // show one hidden-actors badge per event, anchored at the topmost group member
        if (isGrouped && yDrawn > badgeY) {
          badgeY = yDrawn
          badgePoint = point
        }
        result.push(point);
      });
      if (badgePoint && event.hiddenActors.length > 0) {
        badgePoint.hiddenActors = event.hiddenActors
      }
    });
    return [result, layout.xLen, layout.maxHeight];
  }

export function remove(config: FullConfig) {
  document.getElementById('storygram' + config.uid)?.remove()
  document.getElementById('tooltip' + config.uid)?.remove()
}

export function drawD3(renderedPoints: [RenderedPoint[], number, number], config: FullConfig) {
  const model = buildRenderModel(renderedPoints, config);
  const state: RenderState = {
    selectedX: renderedPoints[0].length ? renderedPoints[0][0].x : null,
    highlighted: new Set(config.highlight),
    tooltipEventX: -1,
  };

  const chart = ensureChart(model);
  renderStatic(chart, model, state);
  renderSelection(chart, model, state);
  attachInteraction(chart, model, state, () => renderSelection(chart, model, state));
}
