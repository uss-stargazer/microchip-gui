import { Box } from "@mui/material";

import TabLayout from "../../components/TabLayout";
import parseMicrochipState from "./modules/parseMicrochipState";

import Sidebar from "./components/Sidebar";
import CircuitGraph from "./components/CircuitGraph";
import NullStateBanner from "./components/NullStateBanner";
import useSettings from "../../hooks/useSettings";

function Workspace() {
  const [settings] = useSettings();
  const microchipState = settings.state;

  return (
    <TabLayout
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        {microchipState ? (
          <CircuitGraph config={parseMicrochipState(microchipState)} />
        ) : (
          <NullStateBanner />
        )}
      </Box>
      <Sidebar />
    </TabLayout>
  );
}

export default Workspace;
