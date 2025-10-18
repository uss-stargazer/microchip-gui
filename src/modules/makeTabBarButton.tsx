import { IconButton } from "@mui/material";
import type { TabBarElement } from "../components/Tabs/module/tabTypes";
import type { ReactElement } from "react";

function makeTabBarButton(icon: ReactElement): TabBarElement {
  return ({ addTargetTab }) => (
    <IconButton
      onClick={addTargetTab}
      size="small"
      sx={{
        width: "2.5rem",
        borderRadius: 0,
        p: 0,
      }}
    >
      {icon}
    </IconButton>
  );
}

export default makeTabBarButton;
