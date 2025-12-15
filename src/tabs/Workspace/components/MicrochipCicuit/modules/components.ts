import * as d3 from "d3";
import type {
  ChipComponent,
  Component,
  ComponentId,
  GateComponent,
} from "microchip-dsl/component";
import {
  cloneD3NestedElement,
  getFontSize,
  positionsToPathData,
  type ConnectionIndex,
  type D3Selection,
  type Position,
  type SubcomponentIndex,
} from "./utils";
import { theme } from "../../../../../App";
import { displaySettings } from "..";
import {
  calculateWirePaths,
  getLayout,
  type SubcomponentLayoutData,
} from "./layout";
import { addOpenChip, getChipOpeness, removeOpenChip } from "./openness";
import {
  CLOSED_PIN_RADIUS,
  getOpenPinYCoordinate,
  PIN_PADDING,
  renderComponentPins,
} from "./pins";
import { opacify } from "colorizr";

const GATE_PADDING = 5;
const TEXT_LINE_PADDING = 10;

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
export const getSubcomponentIdAttr = (
  idx: SubcomponentIndex,
  parentSubcomponentId: string
): string => `${parentSubcomponentId}${idx.toString()}`;

export const componentIsChip = (id: ComponentId): boolean =>
  document.getElementById(getComponentIdAttr(id, "closed", "definition")) !==
  null;

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

  const labelText = g.append("text").attr("class", "label");

  const labelWords = (gate.style.name ?? gate.state).toUpperCase().split(/\s+/);
  let labelTextLength = 0;
  labelText
    .selectAll("tspan")
    .data(labelWords)
    .enter()
    .append("tspan")
    .text((word) => word)
    .attr("dy", function (_, idx, tspans) {
      // Trying to get the max word length, which will be the length of the label
      const wordLength = this.getComputedTextLength();
      if (wordLength > labelTextLength) labelTextLength = wordLength;

      return idx - (tspans.length / 2 - 0.5) * TEXT_LINE_PADDING;
    });

  const labelFontSize = getFontSize(
    labelText.node()!,
    theme.typography.body1.fontSize!
  )!;

  const boxWidth = labelTextLength + 2 * GATE_PADDING,
    boxHeight = Math.max(
      labelFontSize * labelWords.length + 2 * GATE_PADDING,
      gate.nInputs * (CLOSED_PIN_RADIUS * 2 + PIN_PADDING * 2),
      gate.nOutputs * (CLOSED_PIN_RADIUS * 2 + PIN_PADDING * 2)
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
      renderComponentPins,
      "input",
      "closed",
      Array.from({ length: gate.nInputs }, (_, idx) =>
        gate.style.inputNames?.at(idx)
      ),
      0,
      [0, boxHeight]
    );

  g.append("g")
    .attr("class", "output-pins")
    .call(
      renderComponentPins,
      "output",
      "closed",
      Array.from({ length: gate.nOutputs }, (_, idx) =>
        gate.style.outputNames?.at(idx)
      ),
      boxWidth,
      [0, boxHeight]
    );

  g.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .attr(
      "fill",
      gate.style.color ?? displaySettings.preferences.defaultComponentColor
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

  g.attr("id", chipDefId).attr("class", "component");
  return chipDefId;
}

function buildOpenChipSkeleton(
  id: ComponentId,
  chip: ChipComponent,
  g: D3Selection<SVGGElement>
): string {
  if (!displaySettings)
    throw new Error("Display settings must be defined to build a chip");

  const chipDefId = getComponentIdAttr(id, "open", "definition");
  g.attr("id", chipDefId).attr("class", "component");

  // Then the bound box (actual component pin positions will come during population)

  g.append("rect").attr(
    "fill",
    opacify(
      chip.style.color ?? displaySettings.preferences.defaultComponentColor,
      0.5
    )
  );

  g.append("g")
    .attr("class", "input-pins")
    .call(
      renderComponentPins,
      "input",
      "open",
      Array.from({ length: chip.nInputs }, (_, idx) =>
        chip.style.inputNames?.at(idx)
      ),
      0,
      [0, 0]
    );

  g.append("g")
    .attr("class", "output-pins")
    .call(
      renderComponentPins,
      "output",
      "open",
      Array.from({ length: chip.nOutputs }, (_, idx) =>
        chip.style.outputNames?.at(idx)
      ),
      0,
      [0, 0]
    );

  // Finally, the internals

  g.append("g")
    .attr("class", "subcomponents")
    .selectAll("g")
    .data(chip.state.components)
    .enter()
    .append("g")
    .attr("class", "subcomponent")
    .attr("subcomponent-idx", (_, idx) => idx);

  g.append("g")
    .attr("class", "wires")
    .selectAll("path")
    .data(chip.state.connections)
    .enter()
    .append("path")
    .attr("class", "wire")
    .attr("id", (_, idx) => getWireIdAttr(idx)); // IDs are important for electrical simulation

  // Data (whoops! forgot to add this, DELETE COMMENT WHEN SQUASHING!)
  g.attr("data-n-inputs", chip.nInputs).attr("data-n-outputs", chip.nOutputs);

  return chipDefId;
}

function populateOpenChipSkeleton(
  chip: D3Selection<SVGGElement>,
  subcomponentIdPrefix: string
) {
  const box = chip.selectChild<SVGRectElement>("rect");
  const inputPins = chip.selectAll<SVGCircleElement, any>(".input-pins > .pin");
  const outputPins = chip.selectAll<SVGCircleElement, any>(
    ".output-pins > .pin"
  );
  const subcomponents = chip.selectAll<SVGGElement, ComponentId>(
    ".subcomponents > .subcomponent"
  );
  const wires = chip.selectAll<
    SVGPathElement,
    ChipComponent["state"]["connections"][number]
  >(".wires > .wire");

  const connections = wires.data();
  const subcomponentComponentIds = subcomponents.data();
  const subcomponentIdAttrs = subcomponentComponentIds.map((_, idx) =>
    getSubcomponentIdAttr(idx, subcomponentIdPrefix)
  );

  // The internals; populate all subcomponents

  subcomponents.each(function (componentId, idx) {
    const subcomponentIdAttr = subcomponentIdAttrs[idx];
    const chipState =
      (componentIsChip(componentId) || undefined) &&
      getChipOpeness(subcomponentIdAttr);

    const subcomponent = d3
      .select(this)
      .attr("id", subcomponentIdAttr)
      .call(
        useComponentDefinition,
        componentId,
        chipState && {
          state: chipState,
          subcomponentIdPrefix: subcomponentIdAttr,
        }
      );

    if (chipState) {
      subcomponent.on("click", () =>
        chipState === "closed"
          ? addOpenChip(subcomponentIdAttr)
          : removeOpenChip(subcomponentIdAttr)
      );
    }
  });

  // Get layout by first parsing subcomponent data from their elements, which should already exist or was poulated above

  const subcomponentData: SubcomponentLayoutData[] =
    subcomponentComponentIds.map((componentId: ComponentId, idx) => {
      const chipOpeness =
        (componentIsChip(componentId) || undefined) &&
        getChipOpeness(subcomponentIdAttrs[idx]);
      const subcomponentDataset = document.getElementById(
        getComponentIdAttr(componentId, chipOpeness)
      )!.dataset;
      return {
        width: Number(subcomponentDataset.width!),
        height: Number(subcomponentDataset.height!),
        nInputs: Number(subcomponentDataset.nInputs!),
        nOutputs: Number(subcomponentDataset.nOutputs!),
        position: [undefined, undefined],
        isOpen: chipOpeness === "open",
      };
    });

  // TODO: I might seperate this out to have a seperate function for the wires paths
  // which would be great for dynamic changes to subcomponent positions
  const layout = getLayout(subcomponentData, connections);

  // Make sure all components have a position from getLayout
  if (
    subcomponentData.some((data) => data.position.some((i) => i === undefined))
  )
    throw new Error(
      "Layout calculation failed; at least one subcomponent position could not be calculated"
    );
  const populatedSubcomponentData = subcomponentData as (Omit<
    SubcomponentLayoutData,
    "position"
  > & {
    position: Position;
  })[];

  // From the layout above, calculate positions for remaining features of the open chip

  const inputPinPositions = Array.from(
    { length: inputPins.size() },
    (_, idx): Position => {
      return [
        0,
        getOpenPinYCoordinate(idx, inputPins.size(), 0, layout.height),
      ];
    }
  );
  const outputPinPositions = Array.from(
    { length: outputPins.size() },
    (_, idx): Position => {
      return [
        layout.width,
        getOpenPinYCoordinate(idx, outputPins.size(), 0, layout.height),
      ];
    }
  );

  const wirePaths = calculateWirePaths(
    populatedSubcomponentData,
    inputPinPositions,
    outputPinPositions,
    connections
  );

  // The subcomponents positions, wire paths, bound box, and pin positions from above calculations

  subcomponents.attr(
    "transform",
    (_, idx) =>
      `translate(${populatedSubcomponentData[idx].position.join(" ")})`
  );

  wires.attr("d", (_, idx) => positionsToPathData(wirePaths[idx]));

  box
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", layout.width)
    .attr("height", layout.height);

  inputPins.attr("cx", 0).attr("cy", (_, idx) => inputPinPositions[idx][1]);
  outputPins
    .attr("cx", layout.width)
    .attr("cy", (_, idx) => inputPinPositions[idx][1]);

  // Data (whoops! forgot to add this, DELETE COMMENT WHEN SQUASHING!)
  console.log("setting chip dimensions of", chip.attr("id"), ":", layout);
  chip.attr("data-width", layout.width).attr("data-height", layout.height);
}

/**
 * Pop the `<g>` for a component for usage later. If the component is a chip, it defines
 * both the closed and open SVGs. You can use `getComponentSvgId()` to get the IDs of
 * the SVGs for later use.
 *
 * @param id ID of the component
 * @param component The actual component info object
 */
export function defineComponent(
  id: ComponentId,
  component: Component,
  defs: D3Selection<SVGDefsElement>
) {
  if (typeof component.state === "string") {
    buildGate(id, component as GateComponent, defs.append("g"));
  } else {
    buildClosedChip(id, component as ChipComponent, defs.append("g"));
    buildOpenChipSkeleton(id, component as ChipComponent, defs.append("g"));
  }
}

export function useComponentDefinition(
  g: D3Selection<SVGGElement>,
  id: ComponentId,
  chipInfo?: {
    state: "open" | "closed";
    subcomponentIdPrefix: string;
  }
) {
  const component = g.append(() => {
    const instanceId = getComponentIdAttr(id, chipInfo?.state);
    const componentDefinition = document.getElementById(
      getComponentIdAttr(id, chipInfo?.state, "definition")
    )! as HTMLOrSVGElement as SVGGElement;
    const componentInstance = cloneD3NestedElement(componentDefinition);
    componentInstance.setAttribute("id", instanceId);
    return componentInstance;
  });

  if (chipInfo?.state === "open")
    component.call(populateOpenChipSkeleton, chipInfo.subcomponentIdPrefix);
}
