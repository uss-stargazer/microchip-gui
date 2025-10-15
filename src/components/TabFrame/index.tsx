import React, { useState, type ReactElement } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { MdClose } from "react-icons/md";

export type TabId = string;
export interface Tab {
  id: TabId;
  element: ReactElement;
}

export type AddTabFunction = (target: Tab) => void; // TODO: replace with SwitchTab because its more general and doesn't throw errors
export type DeleteTabFunction = (targetId: TabId) => void;

export type TabBarButton = React.FunctionComponent<{
  addTab: AddTabFunction;
  deleteTab: DeleteTabFunction;
}>;

function TabBar({
  tabs,
  currentTabId,
  setCurrentTabId,
  addTab,
  deleteTab,
  buttons,
}: {
  tabs: Tab[];
  currentTabId: TabId | undefined;
  setCurrentTabId: React.Dispatch<React.SetStateAction<string | undefined>>;
  addTab: AddTabFunction;
  deleteTab: DeleteTabFunction;
  buttons: TabBarButton[];
}) {
  return (
    <Box
      width="100vw"
      bgcolor="grey.800"
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <Box sx={{ display: "flex" }}>
        {tabs.map(({ id }) => (
          <Box
            component={Button}
            variant="outlined"
            onClick={() => setCurrentTabId(id)}
            color="text.primary"
            bgcolor={id === currentTabId ? "background.paper" : ""}
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
      </Box>
      <Box sx={{ display: "flex" }}>
        {buttons.map((BarButton: TabBarButton) => (
          <BarButton addTab={addTab} deleteTab={deleteTab}></BarButton>
        ))}
      </Box>
    </Box>
  );
}

function TabFrame({ barButtons }: {
  barButtons?: TabBarButton[];
}) {
  const [currentTabId, setCurrentTabId] = useState<TabId | undefined>();
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

  const currentTab: Tab | undefined = tabs.find(
    ({ id }) => id === currentTabId
  );
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
        tabs={tabs}
        currentTabId={currentTabId}
        setCurrentTabId={setCurrentTabId}
        buttons={barButtons ?? []}
        addTab={addTab}
        deleteTab={deleteTab}
      />
      <Box flexGrow={1}>
        {currentTab ? currentTab.element : null}
      </Box>
    </Box>
  );
}

export default TabFrame;
