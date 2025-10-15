import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import TabLayout from "../../components/TabLayout";

function Workspace() {
  return (
    <TabLayout flex="row">
      <Box sx={{ flexGrow: 1 }}></Box>
      <Sidebar />
    </TabLayout>
  );
}

export default Workspace;
