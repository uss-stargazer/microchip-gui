import { useEffect, useState } from "react";
import type { Tab, TabId } from "../module/tabTypes";

export interface StoredTabs {
  currentTabs: Tab[];
  currentTabId: TabId | null;
}

function getTabsFromLocalStorage(): StoredTabs | null {
  const rawTabs = localStorage.getItem("tabs");
  return rawTabs ? JSON.parse(rawTabs) : null;
}

function useStoredTabs(): [StoredTabs, (newTabs: StoredTabs) => void] {
  const [storedTabs, setStoredTabs] = useState<StoredTabs>(
    getTabsFromLocalStorage() || { currentTabs: [], currentTabId: null }
  );

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(storedTabs));
  }, [storedTabs]);

  return [storedTabs, setStoredTabs];
}

export default useStoredTabs;
