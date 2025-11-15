// Hashes open elements and stores the hashes in the brower. A hash is deleted if
// the chip is closed or the state changed and it no longer exists. Changes should be
// pushed to localStorage immediately before circuit is destroyed before rerender
// (NOTE: this file doesn't handle that process, it just exports `openHashes`).

import type { ChipComponent, ComponentId } from "microchip-dsl/component";
import { displaySettings } from "..";
import type { SubcomponentIndex } from "./utils";
import { parseSubcomponentIdAttr } from "./components";

type SubcomponentStack = SubcomponentIndex[];

// Need to access settings and create a local glabal var for openess
export let openChips: SubcomponentIndex[][] = [];

export function loadOpenHashes(openHashes: string[]) {}

function hashChip(
  chip: ChipComponent,
  subcomponentIdxStack: SubcomponentStack
) {}

function getChipPosition(chip: SVGGElement): SubcomponentStack {
  if (chip.getAttribute("class") !== "component")
    throw new Error("Chip must be a component to save open state");

  const subcomponentStack: SubcomponentIndex[] = [];
  for (
    let subcomponent = chip.closest(".subcomponent");
    subcomponent !== null;
    subcomponent.closest(".subcomponent")
  )
    subcomponentStack.push(
      parseSubcomponentIdAttr(subcomponent.getAttribute("id")!)
    );
  return subcomponentStack;
}

export function addOpenChip(chip: SVGGElement) {}

export function removeOpenChip(id: ComponentId) {
  openHashes.delete(id);
}

// Returns undefined if not a chip
export function getChipOpeness(id: ComponentId): "open" | "closed" | undefined {
  // if (!openHashes) openHashes = loadOpenHashes();
  // return openHashes.has(id) ? "open" : "closed";
  return;
}
