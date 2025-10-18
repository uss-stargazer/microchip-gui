import type { ReactElement } from "react";

export type TabType = string;
export type TabId = number; // Index in saved settings is used as tab id
export interface Tab {
  type: TabType;
  name?: string;
}

export type AddTabFunction = (type: TabType) => void;
export type DeleteTabFunction = (id: TabId) => void;

export type TabBarElement = React.FunctionComponent<{
  addTargetTab?: () => void;
  addTab?: AddTabFunction;
  deleteTab?: DeleteTabFunction;
}>;

export interface TabConfiguration {
  element: ReactElement;
  isUnique: boolean;
  accessiblity:
    | { location: "add tab"; icon?: ReactElement }
    | {
        location: "tab bar";
        element: TabBarElement;
      }
    | {
        location: "add tab and tab bar";
        icon?: ReactElement;
        element: TabBarElement;
      };
}
