import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Tab from "../../components/Tab";

function Workspace() {
  return (
    <Tab flex="row">
      <Box sx={{ flexGrow: 1 }}></Box>
      <Sidebar />
    </Tab>
  );
}

export default Workspace;
