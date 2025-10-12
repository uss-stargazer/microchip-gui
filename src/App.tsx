import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { MdInfo } from "react-icons/md";
import { GiBadBreath } from "react-icons/gi";

import type { NavbarEntry } from "./components/styled/Navbar";
import PageLayout from "./components/styled/PageLayout";
import Logo from "./components/Logo";
import RainbowText from "./components/styled/RainbowText";

import About from "./pages/About";
import Project1 from "./pages/Projects/Project1";
import Project2 from "./pages/Projects/Project2";

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

const navbarEntries: NavbarEntry[] = [
  { name: "About", href: "/", icon: <MdInfo /> },
  {
    name: "Project 1",
    href: "/projects/1",
    icon: <GiBadBreath />,
    placement: "projects",
  },
  {
    name: "Project 2",
    href: "/projects/2",
    icon: <GiBadBreath />,
    placement: "projects",
  },
  { name: "About", href: "/", icon: <MdInfo />, placement: "menu" },
  {
    name: "",
    icon: (
      <b>
        <RainbowText saturation={60}>Project 3</RainbowText>
      </b>
    ),
    href: "/projects/1",
    placement: "menu",
  },
  {
    name: "",
    icon: (
      <b>
        <RainbowText saturation={60}>Project 2</RainbowText>
      </b>
    ),
    href: "/projects/2",
    placement: "menu",
  },
];

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PageLayout logo={<Logo />} navbarEntries={navbarEntries}>
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/projects">
              <Route path="1" element={<Project1 />} />
              <Route path="2" element={<Project2 />} />
            </Route>
          </Routes>
        </PageLayout>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
