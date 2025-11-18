import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import type { Position } from "./utils";

export interface SubcomponentLayoutData {
  width: number;
  height: number;
  nInputs: number;
  nOutputs: number;
}

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

// Padding is also handled by this function
export function getLayout(
  components: SubcomponentLayoutData[],
  connections: ChipComponent["state"]["connections"]
): {
  width: number;
  height: number;
  componentPositions: Position[];
} {
  const componentPositions = components.map((component): Position => {
    return [Math.random() * 300, Math.random() * 500];
  });
  return {
    width: 300,
    height: 500,
    componentPositions: componentPositions,
  };
}
