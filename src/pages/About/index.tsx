import { Box, Typography } from "@mui/material";
import Logo from "../../components/Logo";
import FullPageBanner from "../../components/styled/text/FullPageBanner";
import TextPage from "../../components/styled/text/TextPage";

function About() {
  return (
    <TextPage>
      <FullPageBanner>
        <Typography variant="h4">This is the About page.</Typography>
        <br />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Logo fontSizeRem={4.8} />
        </Box>
        <Typography variant="h3">Welcome.</Typography>
      </FullPageBanner>
    </TextPage>
  );
}

export default About;
