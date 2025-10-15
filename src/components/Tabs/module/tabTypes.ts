import type { ReactElement } from "react";

export type TabId = string;
export interface Tab {
  id: TabId;
  element: ReactElement;
}

export type SwitchTabFunction = (target: Tab) => void;
export type DeleteTabFunction = (targetId: TabId) => void;
