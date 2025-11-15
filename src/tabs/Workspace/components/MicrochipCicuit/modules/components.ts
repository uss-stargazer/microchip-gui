import * as d3 from "d3";
import type {
  ChipComponent,
  Component,
  ComponentId,
  GateComponent,
} from "microchip-dsl/component";
import {
  getFontSize,
  positionsToPathData,
  type ConnectionIndex,
  type D3Selection,
  type SubcomponentIndex,
} from "./utils";
import { theme } from "../../../../../App";
import { PIN_PADDING, PIN_RADIUS, renderClosedComponentPins } from "./pins";
import { displaySettings } from "..";
import { getLayout, type SubcomponentLayoutData } from "./layout";
import { addOpenChip, getChipOpeness } from "./saveOpened";

const GATE_PADDING = 5;
const TEXT_LINE_PADDING = 10;

export const getSubcomponentIdAttr = (id: SubcomponentIndex): string =>
  `s-${id.toString()}`;
export const parseSubcomponentIdAttr = (idAttr: string): SubcomponentIndex =>
  Number(idAttr.slice(2));
export const getWireIdAttr = (id: ConnectionIndex): string =>
  `w-${id.toString()}`;
export const parseWireIdAttr = (idAttr: string): ConnectionIndex =>
  Number(idAttr.slice(2));
export const getComponentIdAttr = (
  id: ComponentId,
  chipState?: "open" | "closed",
  definition?: "definition"
): string =>
  ["c", id.toString(), chipState, definition].filter((part) => part).join("-");

function buildGate(
  id: ComponentId,
  gate: GateComponent,
  g: D3Selection<SVGGElement>
): string {
  if (!displaySettings)
    throw new Error("Display settings must be defined to build a gate");

  const gateDefId = getComponentIdAttr(id, undefined, "definition");
  g.attr("id", gateDefId).attr("class", "component");

  // Getting the dimensions of the view box. The gate dimensions are based on the number
  // of pins and the label, so we'll do that first

  const labelText = g.append("text");

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

      // Trying to get the max word length, which will be the length of the label
      const wordLength = tspan.node()!.getComputedTextLength();
      if (wordLength > labelTextLength) labelTextLength = wordLength;
    });

  const labelFontSize = getFontSize(
    labelText.node()!,
    theme.typography.body1.fontSize!
  )!;

  const boxWidth = labelTextLength + 2 * GATE_PADDING,
    boxHeight = Math.max(
      labelFontSize * labelWords.length + 2 * GATE_PADDING,
      gate.nInputs * (PIN_RADIUS * 2 + PIN_PADDING * 2),
      gate.nOutputs * (PIN_RADIUS * 2 + PIN_PADDING * 2)
    );

  // Add x and y data to group element so it can be accessed outside this function
  // (width and height attributes don't actually do anything)

  g.attr("data-width", boxWidth)
    .attr("data-height", boxHeight)
    .attr("data-n-inputs", gate.nInputs)
    .attr("data-n-outputs", gate.nOutputs);

  // Now all we have to do is create the box and set appropriate dimensions,
  // but before that we'll add all the graphics that go below the box.

  g.append("g")
    .attr("class", "input-pins")
    .call(
      renderClosedComponentPins,
      Array.from({ length: gate.nInputs }, (_, idx) =>
        gate.style.inputNames?.at(idx)
      ),
      0,
      [0, boxHeight],
      "input"
    );

  g.append("g")
    .attr("class", "output-pins")
    .call(
      renderClosedComponentPins,
      Array.from({ length: gate.nOutputs }, (_, idx) =>
        gate.style.outputNames?.at(idx)
      ),
      boxWidth,
      [0, boxHeight],
      "output"
    );

  g.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .style(
      "fill",
      gate.style.color ?? displaySettings?.preferences.defaultComponentColor
    );

  // Update text dimensions and put back on top after everything else was built
  labelText
    .attr("x", boxWidth / 2)
    .attr("y", boxHeight / 2)
    .raise();

  return gateDefId;
}

function buildClosedChip(
  id: ComponentId,
  chip: ChipComponent,
  g: D3Selection<SVGGElement>
): string {
  if (!displaySettings)
    throw new Error("Display settings must be defined to build a gate");

  const chipDefId = getComponentIdAttr(id, "closed", "definition");

  // Secretely calls `buildGate()` because it's the same mechanism
  const chipStateSave = chip.state;
  const unbeakedChip = chip as Component;
  unbeakedChip.state = `Chip${id}`;
  buildGate(id, unbeakedChip as GateComponent, g);
  chip.state = chipStateSave;

  g.attr("id", chipDefId)
    .attr("class", "component")
    .on("click", () => {
      addOpenChip();
    });
  return chipDefId;
}

function buildOpenChip(
  id: ComponentId,
  chip: ChipComponent,
  g: D3Selection<SVGGElement>
): string {
  if (!displaySettings)
    throw new Error("Display settings must be defined to build a chip");

  const chipDefId = getComponentIdAttr(id, "open", "definition");
  g.attr("id", chipDefId).attr("class", "component");

  // Get layout by first parsing subcomponent data from their elements, which should already exist
  const subcomponentData: SubcomponentLayoutData[] = chip.state.components.map(
    (subcomponentId: ComponentId) => {
      const subcomponentDataset = document.getElementById(
        getComponentIdAttr(
          subcomponentId,
          getChipOpeness(subcomponentId),
          "definition"
        )
      )!.dataset;
      return {
        width: Number(subcomponentDataset.width!),
        height: Number(subcomponentDataset.height!),
        nInputs: Number(subcomponentDataset.nInputs!),
        nOutputs: Number(subcomponentDataset.nOutputs!),
      };
    }
  );

  // TODO: I might seperate this out to have a seperate function for the wires paths
  // which would be great for dynamic changes to subcomponent positions
  const layout = getLayout(subcomponentData, chip.state.connections);

  // Then the bound box and open component pins

  // Finally, the internals

  g.append("g")
    .attr("class", "subcomponents")
    .selectAll("g")
    .data(layout.componentPositions)
    .enter()
    .append("g")
    .attr("class", "subcomponent")
    .attr("transform", (position) => `translate(${position.x} ${position.y})`)
    .each(function (_, idx) {
      const subcomponentId = chip.state.components[idx];
      d3.select(this)
        .attr("id", getSubcomponentIdAttr(idx))
        .call(
          useComponentDefinition,
          subcomponentId,
          getChipOpeness(subcomponentId)
        );
    });

  g.append("g")
    .attr("class", "wires")
    .selectAll("path")
    .data(layout.wirePaths)
    .enter()
    .append("path")
    .attr("class", "wire")
    .attr("fill", "transparent")
    .attr("stroke", "black")
    .attr("d", positionsToPathData)
    .each(function (_, idx) {
      d3.select(this).attr("id", getWireIdAttr(idx)); // IDs are important for electrical simulation
    });

  return chipDefId;
}

export function useComponentDefinition(
  g: D3Selection<SVGGElement>,
  id: ComponentId,
  chipState?: "open" | "closed"
) {
  g.append(() => {
    const componentInstance = document
      .getElementById(getComponentIdAttr(id, chipState, "definition"))!
      .cloneNode(true) as SVGGElement;
    componentInstance.setAttribute("id", getComponentIdAttr(id, chipState));
    return componentInstance;
  });
}
/**
 * Pop the `<g>` for a component for usage later. If the component is a chip, it defines
 * both the closed and open SVGs. You can use `getComponentSvgId()` to get the IDs of
 * the SVGs for later use.
 *
 * @param id ID of the component
 * @param component The actual component info object
 */
function defineComponent(
  id: ComponentId,
  component: Component,
  defs: D3Selection<SVGDefsElement>
) {
  if (typeof component.state === "string") {
    buildGate(id, component as GateComponent, defs.append("g"));
  } else {
    buildClosedChip(id, component as ChipComponent, defs.append("g"));
    buildOpenChip(id, component as ChipComponent, defs.append("g"));
  }
}

export default defineComponent;
