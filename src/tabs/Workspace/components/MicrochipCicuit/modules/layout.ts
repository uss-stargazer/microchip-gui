import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import { average, type Position } from "./utils";
import { component } from "microchip-dsl";

type ComponentIdOrIO = ComponentId | "input" | "output";

const COMPONENT_PADDING_X = 20;
const COMPONENT_PADDING_Y = 10;

export interface SubcomponentLayoutData {
  width: number;
  height: number;
  nInputs: number;
  nOutputs: number;

  // Positioning
  column: number | undefined;
  y: number | undefined;
}

// Calculate wire paths ---------------------------------------------------------------------------

export function calculateWirePaths(
  componentPositions: Position[],
  inputPinPositions: Position[],
  outputPinPositions: Position[],
  connections: ChipComponent["state"]["connections"]
): Position[][] {
  return connections.map(() => {
    return Array.from({ length: Math.random() * 5 }, () => {
      return [Math.random() * 300, Math.random() * 500];
    });
  });
}

// Get component layout ---------------------------------------------------------------------------

/**
 * Assigns column numbers to each component in `components`
 * @param components The components to organize and write results to
 * @param connections Connection object for wires between components
 * @returns Number of columns
 */
function groupComponentsByHopDistance(
  components: SubcomponentLayoutData[],
  connections: ChipComponent["state"]["connections"]
): number {
  const nComponents = components.length;

  /**
   * Calculates the distance of each component (components 0 to `nComponents` - 1)
   * from `startComponents`. If `startPins` is "output", generally traverse to the right,
   * else "input" means starting at the input pins of "startComponents" and moving to the
   * left. Returns componentHopDistances and max hop distance + 1.
   */
  const getComponentHopDistances = (
    nComponents: number,
    startComponents: ComponentIdOrIO[],
    startPins: "input" | "output"
  ): [(number | undefined)[], number] => {
    const componentHopDistances = new Array(nComponents).fill(undefined);
    const target = startPins === "output" ? "destination" : "source";
    const test = startPins === "output" ? "source" : "destination";

    let distance = 0; // If you really think about it, this should be 1 hop, but we're gonna start at 0
    let componentsAtPreviousDistance = startComponents; // TODO: could be more efficient if we just use the same array
    while (true) {
      const componentsAtCurrentDistance = new Array();
      connections.forEach((connection) => {
        if (
          connection[test].component && // Ignore null test components
          typeof connection[target].component === "number" &&
          componentsAtPreviousDistance.includes(connection[test].component) &&
          componentHopDistances[connection[target].component] === undefined
        ) {
          componentsAtCurrentDistance.push(connection[target].component);
          componentHopDistances[connection[target].component] = distance;
        }
      });
      if (componentsAtCurrentDistance.length === 0) {
        break;
      }
      componentsAtPreviousDistance = componentsAtCurrentDistance;
      distance++;
    }

    return [componentHopDistances, distance];
  };

  const [leftAlignedComponentColNums, nColumns] = //
    getComponentHopDistances(nComponents, ["input"], "output");
  const rightAlignedComponentColNums = //
    getComponentHopDistances(nComponents, ["output"], "input")[0]
      // Hop distnaces from chip "output" are inverted column numbers, so we invert them again
      .map((colNum) =>
        colNum === undefined ? undefined : nColumns - 1 - colNum
      );

  // Combine and center columns
  leftAlignedComponentColNums.forEach((lColumnNum, component) => {
    let rColumnNum = rightAlignedComponentColNums[component];
    if (lColumnNum === undefined || rColumnNum === undefined)
      components[component].column = undefined;
    else
      components[component].column = Math.round(
        nColumns * (lColumnNum / (lColumnNum + rColumnNum + 1))
      );
  });

  return nColumns;
}

// Padding is also handled by this function
export function getLayout(
  components: SubcomponentLayoutData[],
  connections: ChipComponent["state"]["connections"]
): {
  width: number;
  height: number;
  componentPositions: Position[];
} {
  const nColumns = groupComponentsByHopDistance(components, connections);

  // Calculate actual SVG coordinates from the `column`, `y` representation

  const componentPositions: Position[] = new Array(components.length);

  let maxHeight = 0;
  let xOffset = COMPONENT_PADDING_X;
  for (let colNum = 0; colNum < nColumns; colNum++) {
    let maxWidth = 0;
    let yOffset = COMPONENT_PADDING_Y;

    components.forEach((componentData, component) => {
      if (componentData.column === colNum) {
        componentPositions[component] = [xOffset, yOffset];
        yOffset += componentData.height + COMPONENT_PADDING_Y;
        if (componentData.width > maxWidth) maxWidth = componentData.width;
      }
    });
    if (yOffset > maxHeight) maxHeight = yOffset;

    xOffset += maxWidth + COMPONENT_PADDING_X;
  }

  return {
    componentPositions: componentPositions,
    height: maxHeight,
    width: xOffset,
  };
}
