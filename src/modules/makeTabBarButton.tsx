import type { ReactElement } from "react";
import type { Tab, TabBarButton } from "../components/TabFrame";
import { Button, IconButton } from "@mui/material";

function makeTabBarButton(icon: ReactElement, tab: Tab): TabBarButton {
  return ({ switchTab }) => (
    <Button
      onClick={() => switchTab(tab)}
      color="secondary"
      sx={{
        p: 0,
        borderRadius: 0,
        border: "1px solid rgba(0,0,0,0)",
      }}
    >
      <IconButton size="small">{icon}</IconButton>
    </Button>
  );
}

export default makeTabBarButton;
