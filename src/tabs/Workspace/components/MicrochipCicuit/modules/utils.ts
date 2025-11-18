import * as d3 from "d3";
import type {
  ChipComponent,
  Component,
  ComponentId,
  GateComponent,
} from "microchip-dsl/component";
import { getStyle } from "../../../../../modules/utils";
import toPX from "to-px";
import type { Settings } from "../../../../../hooks/useSettings";

export type MicrochipComponentEntry = [ComponentId, Component];
export type MicrochipChipEntry = [ComponentId, ChipComponent];
export type MicrochipGateEntry = [ComponentId, GateComponent];

export type SubcomponentIndex = keyof ChipComponent["state"]["components"];
export type ConnectionIndex = keyof ChipComponent["state"]["connections"];

export type Position = [number, number];

export interface DisplaySettings {
  preferences: Settings["preferences"];
  graphics: Settings["graphics"];
}

export type D3Selection<
  Element extends d3.BaseType,
  Datum extends any = any
> = d3.Selection<Element, Datum, any, any>;

export function getFontSize(el: Element, fallback?: any): number | null {
  const labelFontSizeRaw = getStyle(el, "font-size");
  return typeof labelFontSizeRaw === "number"
    ? labelFontSizeRaw
    : labelFontSizeRaw
    ? toPX(labelFontSizeRaw)
    : typeof fallback === "number"
    ? fallback
    : toPX(fallback);
}

export function positionsToPathData(positions: Position[]): string {
  return positions
    .map(
      (position, idx) =>
        `${idx === 0 ? "M" : "L"} ${position[0]} ${position[1]}`
    )
    .join(" ");
}

function copyData(from: Element, to: Element) {
  // @ts-ignore
  const data = from.__data__;
  if (data !== null && data !== undefined)
    // @ts-ignore
    to.__data__ = data;

  for (let i = 0; i < from.children.length; i++)
    copyData(from.children[i], to.children[i]);
}
export function cloneD3NestedElement<E extends Element>(element: E): E {
  const clone = element.cloneNode(true) as E;
  copyData(element, clone);
  return clone;
}

export function getTranslateValuesFromSVGElement(el: {
  transform: SVGGElement["transform"];
}): Position {
  const transformList = el.transform.baseVal;
  for (let i = 0; i < transformList.numberOfItems; i++) {
    const transform = transformList.getItem(i);
    if (transform.type === SVGTransform.SVG_TRANSFORM_TRANSLATE) {
      const matrix = transform.matrix;
      return [matrix.e, matrix.f];
    }
  }
  return [0, 0];
}

export type D3ZoomFunction<E extends Element> = (
  e: d3.D3ZoomEvent<E, any>
) => void;

/**
 * Make a selection able to be panned and zoomed in. Used like `svg.call(makePanZoom, ...)`.
 */
export function makePanZoomable(
  svg: D3Selection<SVGSVGElement>,
  targetChild: D3Selection<any>,
  onZoom?: D3ZoomFunction<SVGSVGElement>,
  scaleExtent: [number, number] = [0.5, 10],
  translateExtent?: [[number, number], [number, number]]
) {
  const handleZoom = (e: d3.D3ZoomEvent<SVGSVGElement, any>) => {
    targetChild.attr("transform", e.transform.toString());
    if (onZoom) onZoom(e);
  };
  const zoom = d3
    .zoom<SVGSVGElement, any>()
    .on("zoom", handleZoom)
    .scaleExtent(scaleExtent);

  if (translateExtent) zoom.translateExtent(translateExtent);

  svg.call(zoom);
}
