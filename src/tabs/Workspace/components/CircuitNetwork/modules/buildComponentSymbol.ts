import * as d3 from "d3";
import type {
  ChipComponent,
  Component,
  ComponentId,
  GateComponent,
} from "microchip-dsl/component";
import {
  getMouseCoordinatesRelativelySvgElement,
  type D3Selection,
} from "./utils";
import { theme } from "../../../../../App";
import toPX from "to-px";
import { getStyle } from "../../../../../modules/utils";

// interface BoxSettings {
//   maxCharsPerLine: number;
//   defaultColor: string;
//   font: string;
//   fontSize: number;
//   padding: { width: number; height: number };
// }

// let boxSettings: BoxSettings | null = null;

// function defaultBoxSettings(): BoxSettings {
//   const boxSettings = {
//     maxCharsPerLine: 10,
//     defaultColor: theme.palette.secondary.main,
//     font: theme.typography.body1.font!,
//     fontSize:
//       typeof theme.typography.body1.fontSize === "number"
//         ? theme.typography.body1.fontSize
//         : toPX(theme.typography.body1.fontSize!)!,
//     padding: { width: 0, height: 0 },
//   };
//   boxSettings.padding = {
//     width: boxSettings.fontSize * 2,
//     height: boxSettings.fontSize,
//   };
//   return boxSettings;
// }

const GATE_PADDING = 5;
const GATE_DEFAULT_COLOR = "orange";
const TEXT_LINE_PADDING = 10;
const PIN_RADIUS = 4;
const PIN_PADDING = 1;

function addTooltip(
  selection: D3Selection<any>,
  container: D3Selection<any>,
  text: string,
  relativeViewBox?: {
    viewBox: SVGSVGElement["viewBox"];
    getBoundingClientRect: Element["getBoundingClientRect"];
  }
) {
  const tooltip = container
    .append("text")
    .attr("class", ".MuiTypography-body1")
    .attr("fill", "black")
    .style("pointer-events", "none");

  selection
    .on("mouseover", (evt, d) => {
      const [mx, my] = !relativeViewBox
        ? d3.pointer(evt)
        : getMouseCoordinatesRelativelySvgElement(
            relativeViewBox,
            evt,
            // Manually set scale factor because
            {
              x: 1,
              y: 1,
            }
          );

      tooltip.attr("x", mx).attr("y", my).text(text);
    })
    .on("mouseout", () => {
      tooltip.text("");
    });
}

function buildGate(
  id: ComponentId,
  gate: GateComponent,
  symbol: D3Selection<SVGSymbolElement>
): string {
  const symbolId = getComponentSymbolId(id);

  // The is all the styling that doesn't depend on hard set dimensions

  symbol
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .style("fill", gate.style.color ?? GATE_DEFAULT_COLOR);

  const pinTooltips = symbol.append("g").attr("id", "pin-tooltips");

  const renderPins = (
    g: D3Selection<SVGGElement>,
    pinNames: (string | undefined)[],
    x: number | string
  ) => {
    g.selectAll("circle")
      .data(pinNames)
      .enter()
      .append("circle")
      .attr("r", PIN_RADIUS)
      .attr("cx", x)
      .each(function (name, idx, pins) {
        d3.select(this)
          .attr("cy", `${(1 + idx) * (100 / (pins.length + 1))}%`)
          .call(addTooltip, pinTooltips, name ?? "and pin", symbol.node()!);
      });
  };

  symbol
    .append("g")
    .attr("id", "input-pins")
    .call(
      renderPins,
      Array.from({ length: gate.nInputs }, (_, idx) =>
        gate.style.inputNames?.at(idx)
      ),
      0
    );

  symbol
    .append("g")
    .attr("id", "output-pins")
    .call(
      renderPins,
      Array.from({ length: gate.nOutputs }, (_, idx) =>
        gate.style.outputNames?.at(idx)
      ),
      "100%"
    );

  // Getting the dimensions of the view box. The gate dimensions are based on the number
  // of pins and the label, so we'll do that first

  const labelText = symbol
    .append("text")
    .attr("x", "50%")
    .attr("y", "50%")
    .style("alignment-baseline", "middle")
    .style("text-anchor", "middle")
    .attr("class", ".MuiTypography-body1");

  const labelWords = (gate.style.name ?? gate.state).toUpperCase().split(/\s+/);
  let labelTextLength = 0;
  labelText
    .selectAll("tspan")
    .data(labelWords)
    .enter()
    .append("tspan")
    .text((word) => word)
    .style("alignment-baseline", "middle")
    .style("text-anchor", "middle")
    .each(function (_, idx, tspans) {
      // Line formatting
      const tspan = d3.select(this);
      tspan.attr("dy", idx - (tspans.length / 2 - 0.5) * TEXT_LINE_PADDING);
    })
    .call((tspan) => {
      // Trying to get the max word length, which will be the length of the label
      const wordLength = tspan.node()!.getComputedTextLength();
      if (wordLength > labelTextLength) labelTextLength = wordLength;
    });

  const labelFontSizeRaw =
    getStyle(labelText.node(), "font-size") ?? theme.typography.body1.fontSize!;
  const labelFontSize =
    typeof labelFontSizeRaw === "number"
      ? labelFontSizeRaw
      : toPX(labelFontSizeRaw)!;

  const boxWidth = labelTextLength + 2 * GATE_PADDING,
    boxHeight = Math.max(
      labelFontSize * labelWords.length + 2 * GATE_PADDING,
      gate.nInputs * (PIN_RADIUS * 2 + PIN_PADDING * 2),
      gate.nOutputs * (PIN_RADIUS * 2 + PIN_PADDING * 2)
    );
  // Now all we have to do is create the box and set appropriate dimensions

  symbol
    .attr("id", symbolId)
    .attr("viewBox", `0 0 ${boxWidth} ${boxHeight}`)
    .attr("preserveAspectRatio", "xMinYMin");

  return symbolId;
}

function buildChip(
  id: ComponentId,
  chip: ChipComponent,
  symbol: D3Selection<SVGSymbolElement>
): string {
  return "";
}

export function getComponentSymbolId(id: ComponentId): string {
  return `component-${id}`;
}

/**
 * Defines the `<symbol>` for a component for usage later.
 * @param id ID of the component
 * @param component The actual component info object
 * @returns The ID of the created symbol, which should be like \`component${componentId}\`
 */
function buildComponentSymbol(
  id: ComponentId,
  component: Component,
  symbol: D3Selection<SVGSymbolElement>
): string {
  if (typeof component.state === "string") {
    return buildGate(id, component as GateComponent, symbol);
  } else {
    return buildChip(id, component as ChipComponent, symbol);
  }
}

export default buildComponentSymbol;
