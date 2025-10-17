import type React from "react";
import type {
  DeleteTabFunction,
  SwitchTabFunction,
  Tab,
  TabId,
} from "../../module/tabTypes";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { MdAdd, MdClose } from "react-icons/md";

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
    <Box width="100vw" bgcolor="grey.800" display="flex">
      <Box sx={{ display: "flex" }}>
        {tabInformation.tabs.map(({ id }) => (
          <Box
            component={Button}
            variant="outlined"
            onClick={() => tabInformation.setCurrentTabId(id)}
            color="text.primary"
            sx={{
              paddingRight: "0.5rem",
              borderRadius: 0,
              borderWidth: id === tabInformation.currentTabId ? null : 0,
              borderBottomWidth: id === tabInformation.currentTabId ? 0 : "1px",
              bgcolor:
                id === tabInformation.currentTabId ? "background.paper" : null,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Typography variant="body2">{id}</Typography>
            <IconButton
              onClick={(event) => {
                event.stopPropagation(); // Prevent also triggering switch tab
                deleteTab(id);
              }}
              size="small"
              sx={{ zIndex: 10 }}
            >
              <MdClose />
            </IconButton>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          width: "100%",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "primary.dark",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={() => switchTab(defaultTab)}>
          <MdAdd />
        </IconButton>
        <Box display="flex">
          {buttons.map((BarButton: TabBarButton) => (
            <BarButton switchTab={switchTab} deleteTab={deleteTab}></BarButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default TabBar;
