import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useServiceWorker } from './hooks/useServiceWorker'
import ErrorBoundary from './components/ErrorBoundary'

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(() => {
    console.warn('Service Worker registration failed');
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
