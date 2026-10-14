import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register Service Worker for offline PWA support with reliable auto-update
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // First installation claiming this page is not an update and must not erase
  // a student's in-progress profile/company form with an unnecessary reload.
  let hadController = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
    hadController = true;
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);

        // Check for updates on load immediately
        registration.update().catch(() => {});

        // Periodically check for updates every 30 minutes
        setInterval(() => {
          registration.update().catch(() => {});
        }, 1000 * 60 * 30);

        // Check for updates when user switches back to the app on mobile
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });

  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
