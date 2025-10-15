import { Box, Typography } from "@mui/material";
import TabLayout from "../../components/TabLayout";

function Home() {
  return (
    <TabLayout flex="column">
      <Box sx={{ margin: "auto" }}>
        <Typography variant="h2">Microchip GUI</Typography>
        <Typography>Create a tab to begin.</Typography>
      </Box>
    </TabLayout>
  );
}

export default Home;
