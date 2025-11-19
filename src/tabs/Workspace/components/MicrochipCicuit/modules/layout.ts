import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import { average, type Position } from "./utils";

type ComponentIdOrIO = ComponentId | "input" | "output";

const CHIP_PADDING = 5;

export interface SubcomponentLayoutData {
  width: number;
  height: number;
  nInputs: number;
  nOutputs: number;
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

function groupComponentsByHopDistance(
  components: { nInputs: number; nOutputs: number }[],
  connections: ChipComponent["state"]["connections"]
): ComponentId[][] {
  const componentInputHopDistances: (number | null)[] = new Array(
    components.length
  ).fill(null);
  const componentOutputHopDistances: (number | null)[] = new Array(
    components.length
  ).fill(null);

  const getHopDistances = (
    component: ComponentIdOrIO | null,
    direction: "left" | "right"
  ): number => {
    if (
      component === null ||
      (direction === "left" && component === "input") ||
      (direction === "right" && component === "output")
    )
      return 0;

    const componentIsId = typeof component === "number";
    const targetHopDistanceArray =
      direction === "left"
        ? componentInputHopDistances
        : componentOutputHopDistances;

    if (componentIsId && targetHopDistanceArray[component] !== null)
      return targetHopDistanceArray[component];

    const hopDistancesForPins: number[] = [];
    connections.forEach((connection) => {
      const testComponent =
        direction === "left"
          ? connection.destination.component
          : connection.source.component;

      if (testComponent === component) {
        const targetComponent =
          direction === "left"
            ? connection.source.component
            : connection.destination.component;

        hopDistancesForPins.push(
          getHopDistances(targetComponent, direction) + 1
        );
      }
    });

    if (
      componentIsId &&
      hopDistancesForPins.length !==
        (direction === "left"
          ? components[component].nInputs
          : components[component].nOutputs)
    )
      throw new Error("Unexpected number of pins");

    const averageHopValue = average(...hopDistancesForPins);
    if (componentIsId) targetHopDistanceArray[component] = averageHopValue;
    return averageHopValue;
  };

  getHopDistances("output", "left");
  getHopDistances("input", "right");

  console.log("componentInputHopDistances", componentInputHopDistances);
  console.log("componentOutputHopDistances", componentOutputHopDistances);

  return [];
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
  const componentPositions: Position[] = components.map((component) => {
    return [Math.random() * 300, Math.random() * 500];
  });

  groupComponentsByHopDistance(components, connections);

  return {
    width: 300,
    height: 500,
    componentPositions: componentPositions,
  };
}
