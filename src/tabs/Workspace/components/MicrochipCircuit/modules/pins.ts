import * as d3 from "d3";
import { positionsToPathData, type D3Selection } from "./utils";

export const CLOSED_PIN_RADIUS = 5;
export const OPEN_PIN_RADIUS = 6;
export const VIEWBOX_PIN_RADIUS = 9;

export const PIN_PADDING = 1;
export const VIEWBOX_PIN_RECT_PADDING = 3;
export const LOOPBACK_PADDING =
  VIEWBOX_PIN_RADIUS + VIEWBOX_PIN_RECT_PADDING + 10;

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

export function makeViewBoxPin(
  pin: D3Selection<SVGGElement>,
  type: "output" | "input"
) {
  const rectRadius = VIEWBOX_PIN_RADIUS + VIEWBOX_PIN_RECT_PADDING;
  pin
    .append("rect")
    .attr("class", "viewbox-pin-rect")
    .attr("width", rectRadius * 2)
    .attr("height", rectRadius * 2)
    .attr("x", -rectRadius)
    .attr("y", -rectRadius);

  pin.append("circle").attr("class", "pin").attr("r", VIEWBOX_PIN_RADIUS);

  const directionModifier = type === "input" ? 1 : -1;
  pin
    .append("path")
    .attr("class", "wire")
    .attr(
      "d",
      positionsToPathData([
        [directionModifier * rectRadius, 0],
        [directionModifier * (rectRadius + LOOPBACK_PADDING), 0],
        [directionModifier * (rectRadius + LOOPBACK_PADDING), LOOPBACK_PADDING],
        [0, LOOPBACK_PADDING],
      ])
    );
}
