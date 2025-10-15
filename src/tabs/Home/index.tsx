import { Box, Typography } from "@mui/material";
import Tab from "../../components/Tab";

function Home() {
  return (
    <Tab flex="column">
      <Box sx={{ margin: "auto" }}>
        <Typography variant="h2">Microchip GUI</Typography>
        <Typography>Create a tab to begin.</Typography>
      </Box>
    </Tab>
  );
}

export default Home;
