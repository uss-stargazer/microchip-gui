import React, { useState, type ReactElement, type ReactNode } from "react";
import { Box } from "@mui/material";

type TabId = string;
interface Tab {
  id: TabId;
  element: ReactElement;
}

type AddTabFunction = (target: Tab) => void;
type DeleteTabFunction = (targetId: TabId) => void;

export type TabBarButton = React.FunctionComponent<{
  addTab: AddTabFunction;
  deleteTab: DeleteTabFunction;
}>;

function TabBar({
  addTab,
  deleteTab,
  buttons,
}: {
  addTab: AddTabFunction;
  deleteTab: DeleteTabFunction;
  buttons: TabBarButton[];
}) {
  return (
    <Box width="100vw" sx={{ display: "flex" }}>
      {buttons.map((BarButton: TabBarButton) => (
        <BarButton addTab={addTab} deleteTab={deleteTab}></BarButton>
      ))}
    </Box>
  );
}

function TabFrame({ barButtons }: { barButtons: TabBarButton[] }) {
  const [currentTabId, setCurrentTabId] = useState<TabId | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);

  const addTab: AddTabFunction = (target: Tab) => {
    tabs.forEach(({ id }) => {
      if (id === target.id) throw new Error("Tab with id already exists");
    });
    setTabs([...tabs, { id: target.id, element: target.element }]);
  };

  const deleteTab: DeleteTabFunction = (targetId: TabId) => {
    setTabs(tabs.filter(({ id }) => id !== targetId));
  };

  const currentTab: Tab | null | undefined =
    currentTabId === null ? null : tabs.find(({ id }) => id === currentTabId);
  if (currentTab === undefined) setCurrentTabId(null);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TabBar buttons={barButtons} addTab={addTab} deleteTab={deleteTab} />
      <Box flexGrow={1}>{currentTab?.element}</Box>
    </Box>
  );
}

export default TabFrame;
