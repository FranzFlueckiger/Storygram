import * as d3 from 'd3';
import type { FullConfig, RenderedPoint } from '../Types';
import type { ActorSeries, EventGroup, RenderModel } from './types';
import { X_PADDING } from './types';

const COLOR_SCHEMES: Record<FullConfig['colorScheme'], readonly string[]> = {
  schemeCategory10: d3.schemeCategory10,
  schemeAccent: d3.schemeAccent,
  schemeDark2: d3.schemeDark2,
  schemePaired: d3.schemePaired,
  schemePastel1: d3.schemePastel1,
  schemePastel2: d3.schemePastel2,
  schemeSet1: d3.schemeSet1,
  schemeSet2: d3.schemeSet2,
  schemeSet3: d3.schemeSet3,
};

export function buildRenderModel(
  renderedPoints: [RenderedPoint[], number, number],
  config: FullConfig,
): RenderModel {
  const [gridPoints, xLen, maxHeight] = renderedPoints;
  const points = gridPoints
    .slice()
    .sort((a, b) => a.x - b.x || a.z.localeCompare(b.z));

  const dimensions = {
    plotWidth: xLen * config.eventPadding,
    plotHeight: maxHeight * config.actorPadding,
    width: xLen * config.eventPadding + config.marginLeft + config.marginRight,
    height: maxHeight * config.actorPadding + config.marginTop + config.marginBottom,
    marginTop: config.marginTop,
    marginBottom: config.marginBottom,
    marginLeft: config.marginLeft,
    marginRight: config.marginRight,
  };

  const xValues = points.map(point => point.x);
  const yValues = points.map(point => point.y);
  const xMin = xValues.length ? d3.min(xValues)! : 0;
  const xMax = xValues.length ? d3.max(xValues)! : 1;
  const yMin = yValues.length ? d3.min(yValues)! : 0;
  const yMax = yValues.length ? d3.max(yValues)! : 1;

  const xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([0, dimensions.plotWidth]);
  const yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([dimensions.plotHeight, 0]);

  const categories = Array.from(new Set(points.map(point => String(point.strokeColor))));
  const scheme = COLOR_SCHEMES[config.colorScheme] ?? d3.schemeAccent;
  const color = d3.scaleOrdinal<string, string>()
    .domain(categories)
    .range([...scheme]);

  const actorSeries: ActorSeries[] = Array.from(
    d3.group(points, point => point.z),
    ([key, values]) => ({ key, values }),
  );

  const eventGroups: EventGroup[] = Array.from(
    d3.rollup(
      points.filter(point => point.isGrouped),
      values => {
        const first = values[0];
        return {
          points: values,
          minY: d3.min(values, point => point.y) ?? 0,
          maxY: d3.max(values, point => point.y) ?? 0,
          event: first.event,
          eventValue: first.eventValue,
          eventDescription: first.eventDescription,
          eventUrl: first.eventUrl,
        };
      },
      point => String(point.x),
    ),
    ([key, group]) => ({ key, x: group.points[0].x, ...group }),
  ).sort((a, b) => a.x - b.x);

  return {
    config,
    points,
    actorSeries,
    eventGroups,
    eventByX: new Map(eventGroups.map(group => [group.x, group])),
    hiddenActorPoints: points.filter(point => point.hiddenActors.length > 0),
    dimensions,
    xScale,
    yScale,
    color,
    selectedLineSize: config.lineSize,
    unselectedLineSize: config.lineSize - 3,
  };
}

export function actorPath(model: RenderModel, values: RenderedPoint[]): string {
  const line = d3.line<[number, number]>()
    .x(point => model.xScale(point[0]))
    .y(point => model.yScale(point[1]))
    .curve(d3.curveMonotoneX);

  const coordinates = values.reduce<Array<[number, number]>>((result, point) => {
    if (point.isGrouped) {
      result.push([point.x - X_PADDING, point.y]);
      result.push([point.x, point.y]);
      result.push([point.x + X_PADDING, point.y]);
    } else {
      result.push([point.x, point.y]);
    }
    return result;
  }, []);

  return line(coordinates) ?? '';
}

export function groupPath(model: RenderModel, group: EventGroup): string {
  const line = d3.line<[number, number]>()
    .x(point => model.xScale(point[0]))
    .y(point => model.yScale(point[1]))
    .curve(d3.curveMonotoneX);

  return line([[group.x, group.minY], [group.x, group.maxY]]) ?? '';
}

export function hasGroupedPointAt(series: ActorSeries, x: number | null): boolean {
  return x !== null && series.values.some(point => point.x === x && point.isGrouped);
}
