import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";

function Tab({
  flex,
  children,
}: PropsWithChildren<{ flex?: "row" | "column" }>) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: flex ? "flex" : null,
        flexDirection: flex,
      }}
    >
      {children}
    </Box>
  );
}

export default Tab;
