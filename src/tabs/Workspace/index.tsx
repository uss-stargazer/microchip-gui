import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import TabLayout from "../../components/TabLayout";
import parseMicrochipState from "./modules/parseMicrochipState";
import type { MicrochipState } from "microchip-dsl";
import useVisNetwork from "../../modules/useVisNetwork";

function Workspace({ microchipState }: { microchipState: MicrochipState }) {
  const { networkRef, network } = useVisNetwork(
    parseMicrochipState(microchipState)
  );

  return (
    <TabLayout flex="row">
      <Box sx={{ flexGrow: 1, height: "100%", bgcolor: "blue" }}>
        <div ref={networkRef} />
      </Box>
      <Sidebar />
    </TabLayout>
  );
}

export default Workspace;
