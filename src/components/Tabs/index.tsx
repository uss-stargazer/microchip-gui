import { useState, type ReactElement } from "react";
import { Box } from "@mui/material";

import type {
  DeleteTabFunction,
  SwitchTabFunction,
  Tab,
  TabId,
} from "./module/tabTypes";
import type { TabBarButton } from "./components/TabBar";
import TabBar from "./components/TabBar";

// TODO: multiple tabs of the same type need to be created (maybe have a `type` field in addition to the `id`)

function Tabs({
  noneSelectedTab,
  defaultTab,
  barButtons,
}: {
  noneSelectedTab: ReactElement;
  defaultTab: Tab;
  barButtons?: TabBarButton[];
}) {
  const [currentTabId, setCurrentTabId] = useState<TabId | undefined>();
  const [tabs, setTabs] = useState<Tab[]>([]);

  const switchTab: SwitchTabFunction = (target: Tab) => {
    if (tabs.find(({ id }) => id === target.id)) {
      setCurrentTabId(target.id);
    } else {
      setCurrentTabId(target.id);
      setTabs([...tabs, target]);
    }
  };

  const deleteTab: DeleteTabFunction = (targetId: TabId) => {
    setTabs(tabs.filter(({ id }) => id !== targetId));
  };

  const currentTab = tabs.find(({ id }) => id === currentTabId);
  if (!currentTab && tabs.length > 0) {
    setCurrentTabId(tabs[tabs.length - 1].id);
  }

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TabBar
        tabInformation={{
          tabs: tabs,
          currentTabId: currentTabId,
          setCurrentTabId: setCurrentTabId,
        }}
        buttons={barButtons ?? []}
        defaultTab={defaultTab}
        switchTab={switchTab}
        deleteTab={deleteTab}
      />
      <Box flexGrow={1}>
        {currentTab ? currentTab.element : noneSelectedTab}
      </Box>
    </Box>
  );
}

export default Tabs;
