import React, { type ReactElement } from "react";
import type {
  DeleteTabFunction,
  AddTabFunction,
  TabId,
  TabType,
  TabConfiguration,
  TabBarElement,
} from "../../module/tabTypes";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { MdAdd, MdClose } from "react-icons/md";
import { useState } from "react";
import type { StoredTabs } from "../../hooks/useStoredTabs";

function TabBar({
  tabConfigs,
  tabs,
  setTabs,
}: {
  tabConfigs: { [key: TabType]: TabConfiguration };
  tabs: StoredTabs;
  setTabs: (newTabs: StoredTabs) => void;
}) {
  const { currentTabs, currentTabId } = tabs;

  const addTab: AddTabFunction = (targetType: TabType) => {
    const existingTabId = currentTabs.findIndex(
      ({ type }) => type === targetType
    );
    if (tabConfigs[targetType].isUnique && existingTabId >= 0) {
      setTabs({ ...tabs, currentTabId: existingTabId });
    } else {
      setTabs({
        currentTabs: [...currentTabs, { type: targetType, name: targetType }],
        currentTabId: currentTabs.length,
      });
    }
  };

  const deleteTab: DeleteTabFunction = (targetId: TabId) => {
    const tab = {
      currentTabs: [
        ...currentTabs.slice(0, targetId),
        ...currentTabs.slice(targetId + 1),
      ],
      currentTabId:
        currentTabs.length - 1 === currentTabId
          ? currentTabId - 1
          : currentTabId,
    };
    setTabs(tab);
  };

  const currentTab = currentTabId !== null ? currentTabs[currentTabId] : null;
  if (!currentTab && currentTabs.length > 0) {
    setTabs({
      ...tabs,
      currentTabId: currentTabs.length - 1,
    });
  }

  const addTabButtonTabs: { type: TabType; icon?: ReactElement }[] = [];
  const tabBarElements: { type: TabType; element: TabBarElement }[] = [];
  for (const tabType in tabConfigs) {
    const location = tabConfigs[tabType].accessiblity.location;
    switch (location) {
      case "add tab and tab bar":
      case "add tab":
        addTabButtonTabs.push({
          type: tabType,
          icon: tabConfigs[tabType].accessiblity.icon,
        });
        if (location === "add tab and tab bar") continue;
        break;
      case "tab bar":
        tabBarElements.push({
          type: tabType,
          element: tabConfigs[tabType].accessiblity.element,
        });
        break;
    }
  }

  const AddTabButton =
    addTabButtonTabs.length === 0
      ? null
      : addTabButtonTabs.length === 1
      ? () => (
          <IconButton onClick={() => addTab(addTabButtonTabs[0].type)}>
            <MdAdd />
          </IconButton>
        )
      : () => {
          const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
          const open = Boolean(anchorEl);

          const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
          };
          const handleClose = () => {
            setAnchorEl(null);
          };

          return (
            <React.Fragment>
              <IconButton onClick={handleClick}>
                <MdAdd />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {addTabButtonTabs.map(({ type, icon }) => (
                  <MenuItem key={type} onClick={() => addTab(type)}>
                    {icon}
                    <Typography fontSize="inherit" sx={{ textAlign: "center" }}>
                      {type}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </React.Fragment>
          );
        };

  return (
    <Box width="100vw" bgcolor="grey.800" display="flex">
      <Box sx={{ display: "flex" }}>
        {currentTabs.map(({ name, type }, id) => (
          <Box
            component={Button}
            variant="outlined"
            onClick={() => setTabs({ ...tabs, currentTabId: id })}
            color="text.primary"
            sx={{
              paddingRight: "0.5rem",
              borderRadius: 0,
              ...(id === currentTabId
                ? {
                    borderWidth: "1px",
                    borderBottomWidth: 0,
                    bgcolor: "background.paper",
                  }
                : {
                    borderWidth: 0,
                    borderBottomWidth: "1px",
                    borderRightWidth: "1px",
                    borderRightColor: "divider",
                  }),
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Typography variant="body2">{name ?? type}</Typography>
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
        {AddTabButton ? <AddTabButton /> : null}
        <Box display="flex">
          {tabBarElements.map(({ type, element: BarButton }) => (
            <BarButton
              addTargetTab={() => addTab(type)}
              addTab={addTab}
              deleteTab={deleteTab}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default TabBar;
