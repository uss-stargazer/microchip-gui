import { Box } from "@mui/material";

import TabLayout from "../../components/TabLayout";

import Sidebar from "./components/Sidebar";
import NullStateBanner from "./components/NullStateBanner";
import useSettings from "../../hooks/useSettings";
import ErrorBanner from "./components/ErrorBanner";
import MicrochipCicuit from "./components/CircuitNetwork";

function Workspace() {
  const [{ state: microchipState, errorMessage }] = useSettings();

  console.log("microchip state", microchipState);
  console.log("is map", microchipState.componentRegistry instanceof Map);

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
          <MicrochipCicuit width="100%" height="100%" state={microchipState} />
        )}
      </Box>
      <Sidebar />
    </TabLayout>
  );
}

export default Workspace;
