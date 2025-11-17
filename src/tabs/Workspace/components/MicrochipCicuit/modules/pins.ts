import * as d3 from "d3";
import { type D3Selection } from "./utils";

export const CLOSED_PIN_RADIUS = 5;
export const OPEN_PIN_RADIUS = 7;
export const PIN_PADDING = 2;

export const getPinIdAttr = (idx: number, direction: "input" | "output") =>
  `${direction}-${idx}`;

export const getClosedPinYCoordinate = (
  pin: number,
  totalPins: number,
  y0: number,
  y1: number
): number => {
  y0 += PIN_PADDING + CLOSED_PIN_RADIUS;
  y1 -= PIN_PADDING + CLOSED_PIN_RADIUS;
  return y0 + (totalPins > 1 ? pin / (totalPins - 1) : 0.5) * (y1 - y0);
};

export const getOpenPinYCoordinate = (
  pin: number,
  totalPins: number,
  y0: number,
  y1: number
): number => {
  return y0 + ((pin + 1) / (totalPins + 1)) * (y1 - y0);
};

export function renderComponentPins(
  group: D3Selection<SVGGElement>,
  direction: "input" | "output",
  type: "open" | "closed",
  pinNames: (string | undefined)[],
  x: number,
  yRange: [number, number]
) {
  group
    .selectAll("circle")
    .data(pinNames)
    .enter()
    .append("circle")
    .attr("class", "pin")
    .attr("r", type === "open" ? OPEN_PIN_RADIUS : CLOSED_PIN_RADIUS)
    .attr("cx", x)
    .each(function (_, idx, pins) {
      const pin = d3
        .select(this)
        .attr("id", getPinIdAttr(idx, direction)) // Important for electrical simulation
        .attr(
          "cy",
          type === "open"
            ? getOpenPinYCoordinate(idx, pins.length, ...yRange)
            : getClosedPinYCoordinate(idx, pins.length, ...yRange)
        );
      //   if (name) pin.call(Tooltip.registerTooltip, name);
    });
}
