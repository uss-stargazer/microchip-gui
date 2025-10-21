import { type ReactElement } from "react";

import type { TabConfiguration, TabType } from "./module/tabTypes";
import TabBar from "./components/TabBar";
import { Box } from "@mui/material";
import useStoredTabs from "./hooks/useStoredTabs";

// TODO: multiple tabs of the same type need to be created (maybe have a `type` field in addition to the `id`)

function Tabs({
  tabs,
  defaultElement,
}: {
  tabs: { [key: TabType]: TabConfiguration };
  defaultElement: ReactElement;
}) {
  const [storedTabs, setStoredTabs] = useStoredTabs();
  const { currentTabs, currentTabId } = storedTabs;

  const currentTabElement =
    currentTabId !== null && currentTabId !== -1
      ? tabs[currentTabs[currentTabId].type].element
      : null;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TabBar tabConfigs={tabs} tabs={storedTabs} setTabs={setStoredTabs} />
      <Box flexGrow={1}>{currentTabElement || defaultElement}</Box>
    </Box>
  );
}

export default Tabs;
