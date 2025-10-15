import { Box, type SxProps } from "@mui/material";
import type { PropsWithChildren } from "react";

function Tab({
  flex,
  sx,
  children,
}: PropsWithChildren<{ flex?: "row" | "column"; sx?: SxProps }>) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: flex ? "flex" : null,
        flexDirection: flex,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default Tab;
