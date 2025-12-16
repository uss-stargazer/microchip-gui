import "./circuit.css";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { MicrochipState } from "microchip-dsl";
import { useTheme } from "@mui/material";
import {
  cloneD3NestedElement,
  getTranslateValuesFromSVGElement,
  makePanZoomable,
  positionsToPathData,
  type D3Selection,
  type D3ZoomFunction,
  type DisplaySettings,
  type Position,
} from "./modules/utils";
import useSettings from "../../../../hooks/useSettings";
import {
  componentIsChip,
  defineComponent,
  useComponentDefinition,
} from "./modules/components";
import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import { calculateWirePaths } from "./modules/layout";
import { getOpenPinYCoordinate } from "./modules/pins";

const ZOOM_EXTENT: [number, number] = [1, 5];

// This is a pretty hacky way to get the display settings to modules outside the
// React functional component. There's probably something better...
export let displaySettings: DisplaySettings | null = null;
export let openSubcomponentIds: {
  value: string[];
  set: (v: string[]) => void;
} | null = null;

// A special component that takes up the entire circuit SVG. This is actually just
// copying the root component definition and formatting the circuit like its another
// component but with 100% width and height.
function makeCircuitComponent(
  rootComponent: D3Selection<SVGGElement>,
  rootComponentId: ComponentId,
  circuitDimensions: [number, number]
) {
  const rootComponentIsChip = componentIsChip(rootComponentId) || undefined;

  rootComponent.attr("id", "root-component").call(
    useComponentDefinition,
    rootComponentId,
    rootComponentIsChip && {
      state: "open",
      subcomponentIdPrefix: "",
    }
  );

  const rootComponentComponent =
    rootComponent.selectChild<SVGGElement>(".component");

  // Center chip

  const rootComponentDataset = rootComponentComponent.node()!.dataset;
  const rootComponentDimensions: [number, number] = [
    Number(rootComponentDataset.width!),
    Number(rootComponentDataset.height!),
  ];
  rootComponentComponent.attr(
    "transform",
    `translate(${(circuitDimensions[0] - rootComponentDimensions[0]) / 2} ${
      (circuitDimensions[1] - rootComponentDimensions[1]) / 2
    })`
  );

  // A little styling

  rootComponent.select(".component > rect").style("fill", "rgba(0,0,0,0)");
}

function makeCircuitViewBox(
  viewBox: D3Selection<SVGGElement>,
  circuitDimensions: [number, number]
): D3ZoomFunction<SVGSVGElement> {
  const rootComponent = d3.select<SVGGElement, any>("#root-component");
  const rootComponentComponent =
    rootComponent.selectChild<SVGGElement>("g.component");

  // Clone pins and anchor to view box

  const originalInputPins = rootComponentComponent.selectChild(".input-pins");
  const originalOutputPins = rootComponentComponent.selectChild(".output-pins");

  const inputPins = viewBox
    .append(() => cloneD3NestedElement(originalInputPins.node()! as Element))
    .selectAll<SVGCircleElement, any>(".input-pins > .pin");
  const outputPins = viewBox
    .append(() => cloneD3NestedElement(originalOutputPins.node()! as Element))
    .selectAll<SVGCircleElement, any>(".output-pins > .pin");

  const nInputs = inputPins.size();
  const nOutputs = outputPins.size();

  // Calculate all the positions cause we need it later
  const inputPinPositions = Array.from(
    { length: nInputs },
    (_, idx): Position => {
      return [0, getOpenPinYCoordinate(idx, nInputs, 0, circuitDimensions[1])];
    }
  );
  const outputPinPositions = Array.from(
    { length: nOutputs },
    (_, idx): Position => {
      return [
        circuitDimensions[0],
        getOpenPinYCoordinate(idx, nOutputs, 0, circuitDimensions[1]),
      ];
    }
  );

  inputPins.attr("cy", (_, idx) => inputPinPositions[idx][1]);
  outputPins
    .attr("cx", circuitDimensions[0])
    .attr("cy", (_, idx) => outputPinPositions[idx][1]);

  // Create new set of wires from view screen pins to the rootComponentComponent pins
  // (and vice versa for outpus). Plus make it update on zoom.

  // THIS DOESN't HANDLE ZOOMING GAAAA

  const rootComponentNode = rootComponentComponent.node()!;
  const rootComponentDataset = rootComponentNode.dataset!;
  const rootComponentDimensions: [number, number] = [
    Number(rootComponentDataset.width!),
    Number(rootComponentDataset.height!),
  ];
  const rootComponentOriginalPosition =
    getTranslateValuesFromSVGElement(rootComponentNode);
  const rootInputPinPositions = Array.from(
    { length: nInputs },
    (_, idx): Position => {
      return [
        rootComponentOriginalPosition[0],
        getOpenPinYCoordinate(
          idx,
          nInputs,
          rootComponentOriginalPosition[1],
          rootComponentOriginalPosition[1] + rootComponentDimensions[1]
        ),
      ];
    }
  );
  const rootOutputPinPositions = Array.from(
    { length: nOutputs },
    (_, idx): Position => {
      return [
        rootComponentOriginalPosition[0] + rootComponentDimensions[0],
        getOpenPinYCoordinate(
          idx,
          nOutputs,
          rootComponentOriginalPosition[1],
          rootComponentOriginalPosition[1] + rootComponentDimensions[1]
        ),
      ];
    }
  );

  const inputWires = viewBox
    .append("g")
    .attr("id", "input-to-input-wires")
    .attr("class", "wires")
    .selectAll("path")
    .data(new Array(nInputs))
    .enter()
    .append("path");

  const outputWires = viewBox
    .append("g")
    .attr("id", "output-to-output-wires")
    .attr("class", "wires")
    .selectAll("path")
    .data(new Array(nOutputs))
    .enter()
    .append("path");

  const inputConnections: ChipComponent["state"]["connections"] = Array.from(
    { length: nInputs },
    (_, idx) => {
      return {
        source: { component: "input", pin: idx },
        destination: { component: "output", pin: idx },
      };
    }
  );
  const outputConnections: ChipComponent["state"]["connections"] = Array.from(
    { length: nOutputs },
    (_, idx) => {
      return {
        source: { component: "input", pin: idx },
        destination: { component: "output", pin: idx },
      };
    }
  );

  const updateWirePaths = (rootComponentTransform?: d3.ZoomTransform) => {
    let transform: [number, number] = [
      rootComponentTransform?.x ?? 0,
      rootComponentTransform?.y ?? 0,
    ];
    if (!rootComponentTransform) {
      transform = getTranslateValuesFromSVGElement(rootComponent.node()!);
    }
    const inputPaths = calculateWirePaths(
      [],
      inputPinPositions,
      rootInputPinPositions.map((position) => [
        position[0] + transform[0],
        position[1] + transform[1],
      ]),
      inputConnections
    );
    const outputPaths = calculateWirePaths(
      [],
      rootOutputPinPositions.map((position) => [
        position[0] + transform[0],
        position[1] + transform[1],
      ]),
      outputPinPositions,
      outputConnections
    );
    inputWires.attr("d", (_, idx) => positionsToPathData(inputPaths[idx]));
    outputWires.attr("d", (_, idx) => positionsToPathData(outputPaths[idx]));
  };

  updateWirePaths();

  return (e) => updateWirePaths(e.transform);
}

function MicrochipCicuit({
  state,
}: {
  width: string;
  height: string;
  state: MicrochipState;
}) {
  const theme = useTheme();
  const [settings, setSettings] = useSettings();
  displaySettings = settings;

  // Have this be seperate so a change in openness doesn't cause a whole rerender
  const openess = useState(settings.openSubcomponentIds);
  openSubcomponentIds = { value: openess[0], set: openess[1] };

  const circuitRef = useRef<SVGSVGElement>(null);

  // I'm thinking when we start working on efficiency, we have a funciton to update a specific definition
  // (which we can figure out by doing a diff on state) and then another function to just rerender the
  // layout of all elements, that way we're not just deleting everything everytime state changes.

  // On state changed = rerender
  useEffect(() => {
    if (circuitRef.current) {
      const componentDefinitionsSelection = d3
        .select(circuitRef.current)
        .selectChild<SVGDefsElement>("defs#component-definitions");

      // Define all components
      [...state.componentRegistry.entries()]
        .sort((a, b) => a[0] - b[0]) // Make sure its in the order it was created (this matters a lot...)
        .forEach(([id, component], _, entries) => {
          if (entries.length === 0)
            throw new Error(
              "Expected at least one component in microchip state"
            );
          defineComponent(id, component, componentDefinitionsSelection);
        });

      return () => {
        componentDefinitionsSelection.selectAll("*").remove();
        setSettings("openSubcomponentIds", openSubcomponentIds!.value);
      };
    }
  }, []);

  useEffect(() => {
    if (openSubcomponentIds && circuitRef.current) {
      const svg = d3.select(circuitRef.current);

      const { width: circuitWidth, height: circuitHeight } = svg
        .node()!
        .getBoundingClientRect();
      const circuitDimensions: [number, number] = [circuitWidth, circuitHeight];

      const rootComponent = svg
        .selectChild<SVGGElement>("g#root-component")
        .call(makeCircuitComponent, state.rootComponent, circuitDimensions);

      let viewBoxOnZoom: D3ZoomFunction<SVGSVGElement> | null = null;
      const viewBox = svg.selectChild<SVGGElement>("g#view-box").call((g) => {
        viewBoxOnZoom = makeCircuitViewBox(g, circuitDimensions);
      });

      svg.call(makePanZoomable, rootComponent, viewBoxOnZoom!, ZOOM_EXTENT);

      return () => {
        rootComponent.selectChild(".component").remove();
        viewBox.selectAll("*").remove();
      };
    }
  }, [openSubcomponentIds.value]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <svg
        ref={circuitRef}
        id="circuit"
        style={{
          flexGrow: 1,
          backgroundColor: theme.palette.grey[700],
        }}
      >
        <defs id="component-definitions" />
        <g id="root-component" />
        <g id="view-box" />
      </svg>
    </div>
  );
}

export default MicrochipCicuit;
