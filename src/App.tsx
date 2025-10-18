import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { MdEdit, MdInfo, MdSettings } from "react-icons/md";

import Home from "./tabs/Home";
import About from "./tabs/About";
import Settings from "./tabs/Settings";
import Workspace from "./tabs/Workspace";

import makeTabBarButton from "./modules/makeTabBarButton";
import StoredTabs from "./components/Tabs";
import Editor from "./tabs/Editor";
import { SettingsProvider } from "./hooks/useSettings";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#b388ff",
    },
    secondary: {
      main: "#1c6666ff",
    },
    background: { default: "#151515ff" },
  },
  typography: {
    fontFamily: "Cascadia Code",
    fontSize: 13,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SettingsProvider>
        <StoredTabs
          defaultElement={<Home />}
          tabs={{
            Workspace: {
              element: <Workspace />,
              isUnique: false,
              accessiblity: { location: "add tab" },
            },
            Editor: {
              element: <Editor />,
              isUnique: true,
              accessiblity: {
                location: "tab bar",
                element: makeTabBarButton(<MdEdit />),
              },
            },
            About: {
              element: <About />,
              isUnique: true,
              accessiblity: {
                location: "tab bar",
                element: makeTabBarButton(<MdInfo />),
              },
            },
            Settings: {
              element: <Settings />,
              isUnique: true,
              accessiblity: {
                location: "tab bar",
                element: makeTabBarButton(<MdSettings />),
              },
            },
          }}
        />
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
