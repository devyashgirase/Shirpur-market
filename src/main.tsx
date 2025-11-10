// Fix for production headers error
if (typeof globalThis !== 'undefined') {
  globalThis.global = globalThis.global || globalThis;
  if (!globalThis.global.Headers) {
    globalThis.global.Headers = globalThis.Headers || class Headers {
      constructor() {}
      append() {}
      delete() {}
      get() { return null; }
      has() { return false; }
      set() {}
    };
  }
  if (!globalThis.global.fetch) {
    globalThis.global.fetch = globalThis.fetch;
  }
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <App />
);
