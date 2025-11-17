// Hashes open elements and stores the hashes in the brower. A hash is deleted if
// the chip is closed or the state changed and it no longer exists. Changes should be
// pushed to localStorage immediately before circuit is destroyed before rerender
// (NOTE: this file doesn't handle that process, it just exports `openHashes`).

import { openSubcomponentIds } from "..";

export function addOpenChip(subcomponentId: string) {
  if (!openSubcomponentIds)
    throw new Error("Open state must be defined to use openess mechanism");

  openSubcomponentIds.set([...openSubcomponentIds.value, subcomponentId]);
}

export function removeOpenChip(subcomponentId: string) {
  if (!openSubcomponentIds)
    throw new Error("Open state must be defined to use openess mechanism");

  openSubcomponentIds.set(
    openSubcomponentIds.value.filter((id) => id !== subcomponentId)
  );
}

export function getChipOpeness(subcomponentId: string): "open" | "closed" {
  if (!openSubcomponentIds)
    throw new Error("Open state must be defined to use openess mechanism");

  return openSubcomponentIds.value.includes(subcomponentId) ? "open" : "closed";
}
