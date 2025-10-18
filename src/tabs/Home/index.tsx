import { Box, Typography } from "@mui/material";
import TabLayout from "../../components/TabLayout";

function Home() {
  return (
    <TabLayout flex="column">
      <Box sx={{ margin: "auto" }}>
        <Typography variant="h2" fontSize="clamp(2.25rem,10vw,3.5rem)">
          Microchip GUI
        </Typography>
        <Typography>Create a tab to begin.</Typography>
      </Box>
    </TabLayout>
  );
}

export default Home;
