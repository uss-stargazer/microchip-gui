import { Toolbar } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import Navbar, { type NavbarEntry } from "../Navbar";
import React from "react";

function PageLayout({
  logo,
  navbarEntries,
  children,
}: PropsWithChildren<{
  logo: ReactNode;
  navbarEntries: NavbarEntry[];
}>) {
  return (
    <React.Fragment>
      <Navbar logo={logo} navbarEntries={navbarEntries} />
      <Toolbar id="navbar" />
      {children}
    </React.Fragment>
  );
}

export default PageLayout;
