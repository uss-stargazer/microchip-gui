import * as d3 from "d3";
import type {
  ChipComponent,
  Component,
  ComponentId,
  GateComponent,
} from "microchip-dsl/component";

export type MicrochipComponentEntry = [ComponentId, Component];
export type MicrochipChipEntry = [ComponentId, ChipComponent];
export type MicrochipGateEntry = [ComponentId, GateComponent];

export type D3Selection<
  Element extends d3.BaseType,
  Datum extends any = any
> = d3.Selection<Element, Datum, any, any>;

/**
 * Credit: https://gist.github.com/Nonagod/586d0070d3370988d3a0aded474c37d8
 * @param SVGElement - DOMElement of svg block
 * @param MoveMouseEvent - object of mouse move event
 * @returns {{x: number, y: number}}
 */
export function getMouseCoordinatesRelativelySvgElement(
  SVGElement: {
    viewBox: SVGSVGElement["viewBox"];
    getBoundingClientRect: Element["getBoundingClientRect"];
  },
  MoveMouseEvent: MouseEvent,
  overrideScaleFactor?: { x: number; y: number }
): [number, number] {
  // get a sizes and position of svg element, relative browser viewport (page piece, showed on a screen, which we can see)
  let svg_element_position = SVGElement.getBoundingClientRect(),
    // difference coefficients between HTML element and svg viewbox sizes.
    svg_sizes_factor = !overrideScaleFactor
      ? {
          x: SVGElement.viewBox.baseVal.width / svg_element_position.width,
          y: SVGElement.viewBox.baseVal.height / svg_element_position.height,
        }
      : overrideScaleFactor;

  console.log(svg_sizes_factor);

  // calculates the position of the cursor relative to the svg viewbox.
  return [
    Math.round(
      (MoveMouseEvent.clientX - svg_element_position.x) * svg_sizes_factor.x +
        SVGElement.viewBox.baseVal.x
    ),
    Math.round(
      (MoveMouseEvent.clientY - svg_element_position.y) * svg_sizes_factor.y +
        SVGElement.viewBox.baseVal.y
    ),
  ];
}

/**
 * Make a selection able to be panned and zoomed in, to the extent of its width and
 * height. Used like `svg.call(makePanZoom)`.
 * @param svg Svg to be made pan-zoomable
 */
export function makePanZoomable(svg: D3Selection<SVGSVGElement>) {}
