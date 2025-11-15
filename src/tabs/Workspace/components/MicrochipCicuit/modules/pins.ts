import * as d3 from "d3";
import { type D3Selection } from "./utils";

export type PinDirection = "input" | "output";

export const PIN_RADIUS = 5;
export const PIN_PADDING = 1;

export const getPinIdAttr = (idx: number, direction: PinDirection) =>
  `${direction}-${idx}`;

export const getPinYCoordinate = (
  pin: number,
  totalPins: number,
  y0: number,
  y1: number
): number => {
  y0 += PIN_PADDING + PIN_RADIUS;
  y1 -= PIN_PADDING + PIN_RADIUS;
  return y0 + (totalPins > 1 ? pin / (totalPins - 1) : 0.5) * (y1 - y0);
};

export function renderClosedComponentPins(
  group: D3Selection<SVGGElement>,
  pinNames: (string | undefined)[],
  x: number,
  yRange: [number, number],
  direction: PinDirection
) {
  group
    .selectAll("circle")
    .data(pinNames)
    .enter()
    .append("circle")
    .attr("class", "pin")
    .attr("r", PIN_RADIUS)
    .attr("cx", x)
    .each(function (_, idx, pins) {
      const pin = d3
        .select(this)
        .attr("id", getPinIdAttr(idx, direction)) // Important for electrical simulation
        .attr("cy", getPinYCoordinate(idx, pins.length, ...yRange));
      //   if (name) pin.call(Tooltip.registerTooltip, name);
    });
}
