import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "./index.css";
import { restoreDesktopBackupIfEmpty, startDesktopAutoBackup } from "./lib/desktop";

Sentry.init({
  dsn: import.meta.env['VITE_SENTRY_DSN'] as string | undefined,
  environment: import.meta.env.MODE,
});

// Restore saved data from the desktop backup (if this install has none) before
// the calculator reads its settings, then keep that backup up to date.
void restoreDesktopBackupIfEmpty().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please restart Dockalc.</p>}>
      <AppWrapper>
        <App />
      </AppWrapper>
    </Sentry.ErrorBoundary>
  );
  startDesktopAutoBackup();
});

// Register offline Service Worker
if ('serviceWorker' in navigator && !import.meta.env.DEV && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// Request persistent storage so the browser never clears offline stats or milestones
if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

