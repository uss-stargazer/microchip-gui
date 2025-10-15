import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import type { ReactElement } from "react";
import { MdInfo, MdSettings } from "react-icons/md";

import Home from "./tabs/Home";
import About from "./tabs/About";
import Settings from "./tabs/Settings";
import Workspace from "./tabs/Workspace";

import makeTabBarButton from "./modules/makeTabBarButton";
import type { Tab } from "./components/Tabs/module/tabTypes";
import Tabs from "./components/Tabs";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#b388ff",
    },
    secondary: {
      main: "#c62828",
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
      <Tabs
        noneSelectedTab={<Home />}
        defaultTab={{ id: "Workspace", element: <Workspace /> }}
        barButtons={tabBarButtons.map(({ icon, tab }) =>
          makeTabBarButton(icon, tab)
        )}
      />
    </ThemeProvider>
  );
}

export default App;
