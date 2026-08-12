import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./app/App.tsx";
import "./styles/index.css";

// Defensive window/document selection protection
if (typeof window !== "undefined") {
  const origGetSelection = window.getSelection ? window.getSelection.bind(window) : null;
  window.getSelection = function () {
    try {
      if (origGetSelection) {
        const sel = origGetSelection();
        if (sel) return sel;
      }
    } catch (err) {
      // Fallthrough safely to default dummy selection
      void err;
    }
    return {
      anchorNode: null,
      anchorOffset: 0,
      focusNode: null,
      focusOffset: 0,
      isCollapsed: true,
      rangeCount: 0,
      type: "None",
      addRange: () => {},
      collapse: () => {},
      collapseToEnd: () => {},
      collapseToStart: () => {},
      containsNode: () => false,
      deleteFromDocument: () => {},
      empty: () => {},
      extend: () => {},
      getRangeAt: () => null,
      removeAllRanges: () => {},
      removeRange: () => {},
      selectAllChildren: () => {},
      setPosition: () => {},
      toString: () => "",
    } as unknown as Selection;
  };
}

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
