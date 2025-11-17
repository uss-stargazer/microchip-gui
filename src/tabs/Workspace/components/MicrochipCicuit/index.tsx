import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { MicrochipState } from "microchip-dsl";
import { useTheme } from "@mui/material";
import {
  makePanZoomable,
  type D3Selection,
  type DisplaySettings,
} from "./modules/utils";
import useSettings from "../../../../hooks/useSettings";
import {
  componentIsChip,
  defineComponent,
  getComponentIdAttr,
  useComponentDefinition,
} from "./modules/components";
import type { ComponentId } from "microchip-dsl/component";

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
  svg: D3Selection<SVGSVGElement>,
  rootComponentId: ComponentId
) {
  const { width: circuitWidth, height: circuitHeight } = svg
    .node()!
    .getBoundingClientRect();

  const rootComponentIsChip = componentIsChip(rootComponentId) || undefined;
  const rootComponentDefId = getComponentIdAttr(
    rootComponentId,
    rootComponentIsChip && "open",
    "definition"
  );

  const rootComponentDataset =
    document.getElementById(rootComponentDefId)!.dataset;

  rootComponent.attr("id", "root-component").call(
    useComponentDefinition,
    rootComponentId,
    rootComponentIsChip && {
      state: "open",
      subcomponentIdPrefix: "",
      forceDimensions: [circuitWidth, circuitHeight],
    }
  );

  if (!rootComponentIsChip) {
    const rootComponentPosition = {
      x: circuitWidth / 2 - Number(rootComponentDataset.width) / 2,
      y: circuitHeight / 2 - Number(rootComponentDataset.height) / 2,
    };
    rootComponent
      .selectChild(".component")
      .attr(
        "transform",
        `translate(${rootComponentPosition.x} ${rootComponentPosition.y})`
      );
  }

  return rootComponent;
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
      const rootComponent = svg
        .selectChild<SVGGElement>("g#root-component")
        .call(makeCircuitComponent, svg, state.rootComponent);

      // Panzooming;
      const { width: circuitWidth, height: circuitHeight } = svg
        .node()!
        .getBoundingClientRect();
      svg.call(
        makePanZoomable,
        rootComponent,
        [
          [0, 0],
          [circuitWidth, circuitHeight],
        ],
        [1, 5]
      );

      return () => {
        rootComponent.selectChild(".component").remove();
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
      </svg>
    </div>
  );
}

export default MicrochipCicuit;
