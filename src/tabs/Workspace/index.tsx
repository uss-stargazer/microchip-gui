import { Box } from "@mui/material";

import TabLayout from "../../components/TabLayout";
import parseMicrochipState from "./modules/parseMicrochipState";

import Sidebar from "./components/Sidebar";
import CircuitGraph from "./components/CircuitGraph";
import NullStateBanner from "./components/NullStateBanner";
import useSettings from "../../hooks/useSettings";
import ErrorBanner from "./components/ErrorBanner";

function Workspace() {
  const [settings] = useSettings();
  const { state: microchipState, errorMessage } = settings;

  const banner =
    !microchipState && (errorMessage ? <ErrorBanner /> : <NullStateBanner />);

  return (
    <TabLayout
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        {banner && (
          <Box bgcolor="warning.dark" p="1rem">
            {banner}
          </Box>
        )}
        {microchipState && (
          <CircuitGraph config={parseMicrochipState(microchipState)} />
        )}
      </Box>
      <Sidebar />
    </TabLayout>
  );
}

export default Workspace;
