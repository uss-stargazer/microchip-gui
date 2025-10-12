import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./assets/fonts/FiraCode-VariableFont_wght.ttf";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
