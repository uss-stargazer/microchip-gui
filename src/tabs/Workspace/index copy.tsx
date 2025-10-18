// import { Box } from "@mui/material";

// import useSettings from "../../hooks/useSettings";
// import TabLayout from "../../components/TabLayout";
// import parseMicrochipState from "./modules/parseMicrochipState";
// import LoadingAnimation from "../../components/LoadingAnimation";

// import Sidebar from "./components/Sidebar";
// import CircuitGraph from "./components/CircuitGraph";
// import InvalidJsonBanner from "./components/InvalidJsonBanner";
// import NullStateBanner from "./components/NullStateBanner";
// import type { ReactElement } from "react";

// function Workspace() {
//   const [settings] = useSettings()

//   let mainElement: ReactElement;
//   switch (status) {
//     case "loading":
//       mainElement = <LoadingAnimation />;
//       break;
//     case "invalid json":
//       mainElement = <InvalidJsonBanner />;
//       break;
//     case "done":
//       mainElement = microchipState ? (
//         <CircuitGraph config={parseMicrochipState(microchipState)} />
//       ) : (
//         <NullStateBanner />
//       );
//   }

//   return (
//     <TabLayout
//       sx={{
//         display: "flex",
//         flexDirection: { xs: "column", sm: "row" },
//       }}
//     >
//       <Box sx={{ flexGrow: 1, height: "100%" }}>{mainElement}</Box>
//       <Sidebar />
//     </TabLayout>
//   );
// }

// export default Workspace;
