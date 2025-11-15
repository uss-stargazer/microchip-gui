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

export interface Position {
  x: number;
  y: number;
}

export interface DisplaySettings {
  preferences: Settings["preferences"];
  graphics: Settings["graphics"];
}

export type D3Selection<
  Element extends d3.BaseType,
  Datum extends any = any
> = d3.Selection<Element, Datum, any, any>;

export function getFontSize(el: Element, fallback?: any): number | null {
  console.log("called getFontSize");
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
      (position, idx) => `${idx === 0 ? "M" : "L"} ${position.x} ${position.y}`
    )
    .join(" ");
}

/**
 * Make a selection able to be panned and zoomed in, to the extent of its width and
 * height. Used like `svg.call(makePanZoom)`.
 * @param svg Svg to be made pan-zoomable
 */
export function makePanZoomable(
  svg: D3Selection<SVGSVGElement>,
  targetChild: D3Selection<any>,
  translateExtent?: [[number, number], [number, number]],
  scaleExtent: [number, number] = [0.5, 10]
) {
  const handleZoom = (e: d3.D3ZoomEvent<SVGSVGElement, any>) => {
    targetChild.attr("transform", e.transform.toString());
  };
  const zoom = d3
    .zoom<SVGSVGElement, any>()
    .on("zoom", handleZoom)
    .scaleExtent(scaleExtent);

  if (translateExtent) zoom.translateExtent(translateExtent);

  svg.call(zoom);
}
