import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import { average, type Position } from "./utils";

type ComponentIdOrIO = ComponentId | "input" | "output";

const COMPONENT_PADDING_X = 20;
const COMPONENT_PADDING_Y = 10;

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

// TODO: I really have no idea of the performance of this function...
function groupComponentsByHopDistance(
  // components: { height: number }[],
  connections: ChipComponent["state"]["connections"]
): ComponentId[][] {
  const populateTiers = (
    tiers: ComponentId[][],
    target: "source" | "destination",
    initialTier: ComponentIdOrIO[]
  ) => {
    const test = target === "destination" ? "source" : "destination";

    let currentTier = initialTier;
    while (true) {
      const nextTier = new Array();
      connections.forEach((connection) => {
        if (
          connection[test].component && // Ignore null test components
          typeof connection[target].component === "number" &&
          currentTier.includes(connection[test].component) &&
          !nextTier.includes(connection[target].component) &&
          tiers.every(
            (tier) => !tier.includes(connection[target].component as number)
          )
        ) {
          nextTier.push(connection[target].component);
        }
      });
      if (nextTier.length === 0) {
        break;
      }
      tiers.push(nextTier);
      currentTier = nextTier;
    }
  };

  const leftAlignedTiers: ComponentId[][] = [];
  const rightAlignedTiers: ComponentId[][] = [];
  populateTiers(leftAlignedTiers, "destination", ["input"]);
  populateTiers(rightAlignedTiers, "source", ["output"]);

  console.log("left", leftAlignedTiers);
  console.log("right", rightAlignedTiers);

  // Aggregate tiers and normalize height

  const tiers: ComponentId[][] = [];
  leftAlignedTiers.forEach((leftAlignedTier, leftAlignedTierN) => {
    leftAlignedTier.forEach((component) => {
      let rightAlignedTierN;
      for (
        rightAlignedTierN = 0;
        rightAlignedTierN < rightAlignedTiers.length;
        rightAlignedTierN++
      ) {
        if (rightAlignedTiers[rightAlignedTierN].includes(component)) break;
      }
      // Ceil makes sure that decimal points create new tiers... but this is prob bad for larger things (TODO: BETTER WAY!)
      const targetTier = Math.round(
        rightAlignedTierN / (leftAlignedTierN + rightAlignedTierN)
      );
      console.log("component ", component, " tier: ", targetTier);
      if (tiers.length < targetTier + 1) {
        for (let i = tiers.length; i < targetTier + 1; i++) {
          tiers.push(new Array());
        }
      }
      tiers[targetTier].push(component);
    });
  });

  // handle null inputs and outputs

  console.log("center", tiers);

  return tiers;
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
  // Group elements into 'tiers' or levels in the horizontal axis
  const tiers = groupComponentsByHopDistance(connections);

  // Calculate coordinates from tiers

  const componentPositions: Position[] = new Array(components.length);

  let maxHeight = 0;
  let xOffset = COMPONENT_PADDING_X;
  tiers.forEach((tier) => {
    const maxComponentWidth = tier.reduce(
      (previousMax, component) =>
        components[component].width > previousMax
          ? components[component].width
          : previousMax,
      0
    );

    let yOffset = COMPONENT_PADDING_Y;
    tier.forEach((component) => {
      componentPositions[component] = [xOffset, yOffset];
      yOffset += components[component].height + COMPONENT_PADDING_Y;
    });
    if (yOffset > maxHeight) maxHeight = yOffset;

    xOffset += maxComponentWidth + COMPONENT_PADDING_X;
  });

  console.log("positions", componentPositions);

  return {
    componentPositions: componentPositions,
    height: maxHeight,
    width: xOffset,
  };

  // // Temporary
  // const componentPositions: Position[] = components.map((component) => {
  //   return [Math.random() * 300, Math.random() * 500];
  // });
  // return {
  //   width: 300,
  //   height: 500,
  //   componentPositions: componentPositions,
  // };
}
