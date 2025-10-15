import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import TabFrame from "./components/TabFrame";

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TabFrame barButtons={[]} />
    </ThemeProvider>
  );
}

export default App;
