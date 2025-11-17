import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import type { Position } from "./utils";

export interface SubcomponentLayoutData {
  width: number;
  height: number;
  nInputs: number;
  nOutputs: number;
}

export function caculateWirePaths(
  componentPositions: Position[],
  connections: ChipComponent["state"]["connections"],
  widthLimit: number,
  heightLimit: number
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
  connections: ChipComponent["state"]["connections"],
  forceDimensions?: [number, number]
): {
  width: number;
  height: number;
  componentPositions: Position[];
} {
  const componentPositions = components.map((component) => {
    return { x: Math.random() * 300, y: Math.random() * 500 };
  });
  return {
    width: forceDimensions?.[0] || 300,
    height: forceDimensions?.[1] || 500,
    componentPositions: componentPositions,
  };
}
