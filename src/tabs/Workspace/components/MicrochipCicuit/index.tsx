import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { MicrochipState } from "microchip-dsl";
import { useTheme } from "@mui/material";
import {
  makePanZoomable,
  type D3Selection,
  type DisplaySettings,
} from "./modules/utils";
import useSettings from "../../../../hooks/useSettings";
import { getChipOpeness, openChips } from "./modules/saveOpened";
import defineComponent, {
  getComponentIdAttr,
  useComponentDefinition,
} from "./modules/components";
import type { ComponentId } from "microchip-dsl/component";

// This is a pretty hacky way to get the display settings to modules outside the
// React functional component. There's probably something better...
export let displaySettings: DisplaySettings | null = null;

// A special component that takes up the entire circuit SVG. This is actually just
// copying the root component definition and formatting the circuit like its another
// component but with 100% width and hieght.
function makeCircuitComponent(
  svg: D3Selection<SVGSVGElement>,
  circuitSelection: D3Selection<SVGGElement>,
  rootComponent: ComponentId
) {
  const { width: circuitWidth, height: circuitHeight } = svg
    .node()!
    .getBoundingClientRect();

  const rootComponentDefId = getComponentIdAttr(
    rootComponent,
    getChipOpeness(rootComponent),
    "definition"
  );
  const rootComponentDataset =
    document.getElementById(rootComponentDefId)!.dataset;
  const rootComponentPosition = {
    x: circuitWidth / 2 - Number(rootComponentDataset.width) / 2,
    y: circuitHeight / 2 - Number(rootComponentDataset.height) / 2,
  };

  const rootComponentSelection = circuitSelection
    .append("g")
    .attr("id", "root-component")
    .attr(
      "transform",
      `translate(${rootComponentPosition.x} ${rootComponentPosition.y})`
    )
    .call(useComponentDefinition, rootComponent, getChipOpeness(rootComponent));

  // Then we add pins on the edges

  // Then we calculate paths of wires

  // Final little things (pan zooming)
  svg.call(makePanZoomable, circuitSelection);
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

  const circuitRef = useRef<SVGSVGElement>(null);

  // useEffect(() => {
  //   // loadOpenHashes()
  //   return () => {
  //     // setSettings("openChipHashes")
  //   };
  // }, [state]);

  useEffect(() => {
    if (circuitRef.current) {
      const svg = d3.select(circuitRef.current);
      const componentDefinitionsSelection = svg.selectChild<SVGDefsElement>(
        "defs#component-definitions"
      );
      const circuitSelection = svg.selectChild<SVGGElement>(
        "g#circuit-component"
      );

      const componentEntries = [...state.componentRegistry.entries()].sort(
        (a, b) => a[0] - b[0] // Make sure its in the order it was created (this matters a lot...)
      );
      if (componentEntries.length === 0)
        throw new Error("Expected at least one component in microchip state");

      // Build all the component definitions
      componentEntries.forEach(([id, component]) =>
        defineComponent(id, component, componentDefinitionsSelection)
      );

      // Do the actual displaying
      svg.call(makeCircuitComponent, circuitSelection, state.rootComponent);

      return () => {
        circuitSelection.selectAll("*").remove();
        componentDefinitionsSelection.selectAll("*").remove();
      };
    }
  }, [state]); // To be clear, changes to `state` cause changes to `openHashes` (see previous useEffect)

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
        <g id="circuit-component" />
      </svg>
    </div>
  );
}

export default MicrochipCicuit;
