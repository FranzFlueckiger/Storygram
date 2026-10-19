import type { BaseType, ScaleLinear, ScaleOrdinal, Selection } from 'd3';
import type { Event as StoryEvent, FullConfig, RenderedPoint } from '../Types';

export type ChartSelection<E extends BaseType, D = unknown> = Selection<E, D, any, any>;

export interface ActorSeries {
  key: string;
  values: RenderedPoint[];
}

export interface EventGroup {
  key: string;
  x: number;
  points: RenderedPoint[];
  minY: number;
  maxY: number;
  event: StoryEvent;
  eventValue: number | string;
  eventDescription: string;
  eventUrl: string;
}

export interface RenderDimensions {
  plotWidth: number;
  plotHeight: number;
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface RenderModel {
  config: FullConfig;
  points: RenderedPoint[];
  actorSeries: ActorSeries[];
  eventGroups: EventGroup[];
  eventByX: Map<number, EventGroup>;
  hiddenActorPoints: RenderedPoint[];
  dimensions: RenderDimensions;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  color: ScaleOrdinal<string, string>;
  selectedLineSize: number;
  unselectedLineSize: number;
}

export interface RenderState {
  selectedX: number | null;
  highlighted: Set<string>;
  tooltipEventX: number;
}

export interface RenderChart {
  root: ChartSelection<HTMLElement>;
  svg: ChartSelection<SVGSVGElement>;
  tooltip: ChartSelection<HTMLDivElement>;
  layer1: ChartSelection<SVGGElement>;
  layer2: ChartSelection<SVGGElement>;
  pointerRect: ChartSelection<SVGRectElement>;
}

export const TRANSITION_MS = 100;
export const FONT_SIZE = 15;
export const SELECTED_OPACITY = 1;
export const UNSELECTED_OPACITY = 0.25;
export const OPACITY = 0.9;
export const BADGE_OFFSET_Y = 14;
export const X_PADDING = 0.01;
