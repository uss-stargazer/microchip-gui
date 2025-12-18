import type { ChipComponent } from "microchip-dsl/component";
import {
  type ComponentIdOrIO,
  type PartialPosition,
  type Position,
} from "./utils";
import { getClosedPinYCoordinate, getOpenPinYCoordinate } from "./pins";

const COMPONENT_PADDING_X = 40;
const COMPONENT_PADDING_Y = 20;
export const WIRE_START_OFFSET = 20;

export interface SubcomponentLayoutData {
  width: number;
  height: number;
  nInputs: number;
  nOutputs: number;
  position: PartialPosition;
  isOpen: boolean;
}

// Calculate wire paths ---------------------------------------------------------------------------

export function calculateWirePaths(
  components: (Omit<SubcomponentLayoutData, "position"> & {
    position: Position;
  })[],
  inputPinPositions: Position[],
  outputPinPositions: Position[],
  connections: ChipComponent["state"]["connections"]
): Position[][] {
  const lookupIOPinPosition = (
    io: "input" | "output",
    pin: number
  ): Position | undefined =>
    io === "input" ? inputPinPositions[pin] : outputPinPositions[pin];

  return connections.map((connection) => {
    const [source, destination] = (
      ["source", "destination"] satisfies ("source" | "destination")[]
    ).map((target): Position | null => {
      switch (connection[target].component) {
        case "input":
        case "output":
          return lookupIOPinPosition(
            connection[target].component,
            connection[target].pin!
          )!;
        case null:
          return null;
        default:
          const component = components[connection[target].component];
          const getPinYCoordinate = component.isOpen
            ? getOpenPinYCoordinate
            : getClosedPinYCoordinate;
          const xOffset = target === "destination" ? 0 : component.width;
          console.log(
            "y range",
            component.position[1],
            component.position[1] + component.height
          );
          return [
            component.position[0] + xOffset,
            getPinYCoordinate(
              connection[target].pin!,
              component[target === "destination" ? "nInputs" : "nOutputs"],
              component.position[1],
              component.position[1] + component.height
            ),
          ];
      }
    });

    const path: Position[] = [];

    if (source && destination && source[1] !== destination[1]) {
      const start: Position = [source[0] + WIRE_START_OFFSET, source[1]];
      const end: Position = [
        destination[0] - WIRE_START_OFFSET,
        destination[1],
      ];
      path.push(start);

      if (end[0] - start[0] < 0) {
        // In the case of negative x, we need to create a backward s
        const splitYCoordinate = (start[1] + end[1]) / 2;
        path.push([start[0], splitYCoordinate], [end[0], splitYCoordinate]);
      } else {
        // In all cases except a horizontal line and negative x, we need to create a step like _|-
        const splitXCoordinate = (start[0] + end[0]) / 2;
        path.push([splitXCoordinate, start[1]], [splitXCoordinate, end[1]]);
      }

      path.push(end);
    }

    return [source, ...path, destination].filter((p) => p !== null);
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
          connection[test].component !== null && // Ignore null test components
          typeof connection[target].component === "number" &&
          componentsAtPreviousDistance.includes(connection[test].component) &&
          (componentHopDistances[connection[target].component] ?? -1) < distance // We want the maximum distance
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

  console.log("left hops", leftAlignedComponentColNums);
  console.log("right hops", rightAlignedComponentColNums);

  // Combine and center columns
  leftAlignedComponentColNums.forEach((lColumnNum, component) => {
    let rColumnNum = rightAlignedComponentColNums[component];
    if (lColumnNum === undefined && rColumnNum === undefined)
      components[component].position[0] = undefined;
    else if (lColumnNum === undefined || rColumnNum === undefined)
      components[component].position[0] =
        lColumnNum === undefined ? rColumnNum : lColumnNum;
    else
      components[component].position[0] = Math.round(
        nColumns * (lColumnNum / (lColumnNum + rColumnNum + 1))
      );
  });

  return nColumns;
}

/**
 * Caclulates layout of compoennts. Populates the `position` property of
 * each component in `components
 * @param components All the data for each component. Also uses to return resulting positions.
 * @param connections Connection object for wires between components
 * @returns Dimensions of the calculated layout
 */
export function getLayout(
  components: SubcomponentLayoutData[],
  connections: ChipComponent["state"]["connections"]
): {
  width: number;
  height: number;
} {
  // First, we use the `position` property of components to store a represententation
  // of positions, these are the column/y relative representation. `position[0]` is the
  // column, `position[1]` is the y.

  // Primary functions to organize components and get layout in the column/y representation

  console.log("components before", components);
  console.log("connections before", connections);
  const nColumns = groupComponentsByHopDistance(components, connections);
  console.log("components", components);
  console.log("nColumns", nColumns);

  // Calculate actual SVG coordinates from the column/y representation

  const componentPositions: Position[] = new Array(components.length);
  const columnHeights = new Array(nColumns);

  let xOffset = COMPONENT_PADDING_X;
  for (let colNum = 0; colNum < nColumns; colNum++) {
    console.log("col: ", colNum);
    const columnComponents: number[] = [];
    components.forEach((componentData, component) => {
      if (componentData.position[0] === colNum)
        columnComponents.push(component);
    });
    columnComponents.sort((a, b) =>
      components[a].position[1] === undefined
        ? -Infinity
        : components[b].position[1] === undefined
        ? Infinity
        : components[a].position[1] - components[b].position[1]
    );

    console.log("\tcomponents", columnComponents);
    let maxWidth = columnComponents.reduce(
      (prevWidth, component) =>
        components[component].width > prevWidth
          ? components[component].width
          : prevWidth,
      0
    );
    console.log("\tmaxwidth", maxWidth);

    let yOffset = COMPONENT_PADDING_Y;
    columnComponents.forEach((component) => {
      const xOffsetForCenter = (maxWidth - components[component].width) / 2; // Center each component horizontally in the column
      componentPositions[component] = [xOffset + xOffsetForCenter, yOffset];
      console.log(
        "\tsetting component",
        component,
        " which is now ",
        componentPositions[component]
      );
      yOffset += components[component].height + COMPONENT_PADDING_Y;
    });
    columnHeights[colNum] = yOffset;

    xOffset += maxWidth + COMPONENT_PADDING_X;
  }

  console.log("positions", componentPositions);

  // One more pass to center columns veritcially
  const maxHeight = columnHeights.reduce(
    (prevHeight, height) => (height > prevHeight ? height : prevHeight),
    0
  );
  const columnOffsetsForCenter = columnHeights.map(
    (columnHeight) => (maxHeight - columnHeight) / 2
  );

  // Finally push to components
  components.forEach((componentData, component) => {
    if (componentData.position[0] === undefined) return;
    componentData.position = [
      componentPositions[component][0],
      componentPositions[component][1] +
        columnOffsetsForCenter[componentData.position[0]],
    ];
  });

  return {
    height: maxHeight,
    width: xOffset,
  };
}

// TODO
// Handle null signals ----------------------------------------------------------------------------
