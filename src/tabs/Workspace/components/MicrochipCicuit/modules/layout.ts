import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import type { Position } from "./utils";

export interface SubcomponentLayoutData {
  width: number;
  height: number;
  nInputs: number;
  nOutputs: number;
}

function caculateWirePaths(
  componentPositions: Position[],
  connections: ChipComponent["state"]["connections"]
): Position[][] {
  return connections.map(() => {
    return Array.from({ length: Math.random() * 5 }, () => {
      return { x: Math.random() * 300, y: Math.random() * 500 };
    });
  });
}

// Padding is also handled by this function
export function getLayout(
  components: SubcomponentLayoutData[],
  connections: ChipComponent["state"]["connections"]
): {
  width: number;
  height: number;
  componentPositions: Position[];
  wirePaths: Position[][];
} {
  const componentPositions = components.map((component) => {
    return { x: Math.random() * 300, y: Math.random() * 500 };
  });
  const wirePaths = caculateWirePaths(componentPositions, connections);
  return {
    width: 300,
    height: 500,
    componentPositions: componentPositions,
    wirePaths: wirePaths,
  };
}
