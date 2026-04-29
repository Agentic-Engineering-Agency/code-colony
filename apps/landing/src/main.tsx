import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./landing.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Code Colony landing: #root element missing in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
