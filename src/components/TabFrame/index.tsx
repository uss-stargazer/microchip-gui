import React, { useState, type ReactElement } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { MdAdd, MdClose } from "react-icons/md";

export type TabId = string;
export interface Tab {
  id: TabId;
  element: ReactElement;
}

export type SwitchTabFunction = (target: Tab) => void;
export type DeleteTabFunction = (targetId: TabId) => void;

export type TabBarButton = React.FunctionComponent<{
  switchTab: SwitchTabFunction;
  deleteTab: DeleteTabFunction;
}>;

function TabBar({
  tabInformation,
  switchTab,
  deleteTab,
  defaultTab,
  buttons,
}: {
  tabInformation: {
    tabs: Tab[];
    currentTabId: TabId | undefined;
    setCurrentTabId: React.Dispatch<React.SetStateAction<string | undefined>>;
  };
  switchTab: SwitchTabFunction;
  deleteTab: DeleteTabFunction;
  defaultTab: Tab;
  buttons: TabBarButton[];
}) {
  return (
    <Box
      width="100vw"
      bgcolor="grey.800"
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <Box sx={{ display: "flex" }}>
        {tabInformation.tabs.map(({ id }) => (
          <Box
            component={Button}
            variant="outlined"
            onClick={() => tabInformation.setCurrentTabId(id)}
            color="text.primary"
            bgcolor={
              id === tabInformation.currentTabId ? "background.paper" : ""
            }
            sx={{
              p: 0,
              paddingLeft: "10px",
              borderRadius: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Typography variant="body2">{id}</Typography>
            <IconButton onClick={() => deleteTab(id)} size="small">
              <MdClose />
            </IconButton>
          </Box>
        ))}
        <IconButton onClick={() => switchTab(defaultTab)}>
          <MdAdd />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex" }}>
        {buttons.map((BarButton: TabBarButton) => (
          <BarButton switchTab={switchTab} deleteTab={deleteTab}></BarButton>
        ))}
      </Box>
    </Box>
  );
}

function TabFrame({
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

export default TabFrame;
