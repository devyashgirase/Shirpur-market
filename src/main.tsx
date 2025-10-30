// Fix for production headers error
if (typeof globalThis !== 'undefined') {
  globalThis.global = globalThis.global || {};
  if (!globalThis.global.headers) {
    globalThis.global.headers = {};
  }
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
