import { Box, Typography } from "@mui/material";

import TabLayout from "../../components/TabLayout";

import Sidebar from "./components/Sidebar";
import useSettings from "../../hooks/useSettings";
import MicrochipCicuit from "./components/MicrochipCicuit";
import React from "react";

function ErrorBanner({ children }: { children: string }) {
  return (
    <React.Fragment>
      <Typography bgcolor="error.dark" p="1rem">
        Errors prevented state from being compiled (fix in editor tab)
        <br />
        <br />
        <Typography
          sx={{
            width: "80%",
            margin: "auto",
            padding: "2.5%",
            textAlign: "left",
            bgcolor: "black",
          }}
        >
          {children}
        </Typography>
      </Typography>
      <Typography bgcolor="warning.dark" p="1rem">
        Circuit shown below is the default sample.
      </Typography>
    </React.Fragment>
  );
}

function Workspace() {
  const [{ state: microchipState, errorMessage }] = useSettings();

  return (
    <TabLayout
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        {errorMessage && <ErrorBanner>{errorMessage}</ErrorBanner>}
        <MicrochipCicuit width="100%" height="100%" state={microchipState} />
      </Box>
      <Sidebar />
    </TabLayout>
  );
}

export default Workspace;
