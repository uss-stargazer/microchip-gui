import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";

const defaultMaxWidth = 1300;

function TypographySection({
  children,
  childrenAlignment,
  maxWidthPx,
}: PropsWithChildren<{
  childrenAlignment?: "left" | "right" | "center";
  maxWidthPx?: number;
}>) {
  return (
    <Box
      sx={{
        maxWidth: maxWidthPx ?? defaultMaxWidth + "px",
        margin: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems:
            childrenAlignment === "right"
              ? "flex-end"
              : childrenAlignment === "center"
              ? "center"
              : "flex-start",
          padding: "1.8rem",
          gap: "1.5rem",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default TypographySection;
