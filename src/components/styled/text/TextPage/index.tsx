import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";

// This wrapper exists for readablity and for future features

function TextPage({ children }: PropsWithChildren) {
  return <Box sx={{ width: "100vw" }}>{children}</Box>;
}

export default TextPage;
