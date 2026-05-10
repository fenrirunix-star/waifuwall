import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Silence common development-only WebSocket and Vite HMR errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebSocket closed without opened')) {
      event.preventDefault();
    }
  });

  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('[vite] failed to connect to websocket') ||
      args[0].includes('WebSocket closed without opened')
    )) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
