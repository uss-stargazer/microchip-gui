import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import type { ReactElement } from "react";
import { MdInfo, MdSettings } from "react-icons/md";

import TabFrame, { type Tab } from "./components/TabFrame";

import Home from "./tabs/Home";
import About from "./tabs/About";
import Settings from "./tabs/Settings";
import Workspace from "./tabs/Workspace";
import makeTabBarButton from "./modules/makeTabBarButton";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00bcd4",
    },
    secondary: {
      main: "#b39ddb",
    },
    background: { default: "#151515ff" },
  },
  typography: {
    fontFamily: "Cascadia Code",
    fontSize: 13,
  },
});

const tabBarButtons: { icon: ReactElement; tab: Tab }[] = [
  { icon: <MdInfo />, tab: { id: "About", element: <About /> } },
  { icon: <MdSettings />, tab: { id: "Settings", element: <Settings /> } },
];

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TabFrame
        defaultTab={<Home />}
        barButtons={tabBarButtons.map(({ icon, tab }) =>
          makeTabBarButton(icon, tab)
        )}
      />
    </ThemeProvider>
  );
}

export default App;
