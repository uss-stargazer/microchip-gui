import { Typography } from "@mui/material";
import TabLayout from "../../components/TabLayout";

function About() {
  return (
    <TabLayout
      flex="column"
      sx={{ margin: "auto", maxWidth: "800px", p: "1rem", gap: "1rem" }}
    >
      <hr />
      <Typography variant="h6">
        <span style={{ fontWeight: "lighter" }}>Microchip GUI</span> is a
        interface for displaying, <br />
        testing, and exporting nested electronics circuits.
      </Typography>
      <hr />
      <Typography>
        Microchip uses a functional representation of circuits where a component
        is a single entity with its own internal state and that can be
        implemented in the state of any other component. This allows modularity
      </Typography>
    </TabLayout>
  );
}

export default About;
