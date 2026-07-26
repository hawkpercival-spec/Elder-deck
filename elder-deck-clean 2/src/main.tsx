import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence benign development-only Vite WebSocket / HMR connection errors in the browser sandbox
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;

  const isViteWebsocketMessage = (msg: any): boolean => {
    if (!msg) return false;
    const str = String(msg);
    return (
      str.includes('WebSocket') ||
      str.includes('websocket') ||
      str.includes('failed to connect to websocket') ||
      str.includes('[vite]') ||
      str.includes('HMR')
    );
  };

  console.error = (...args: any[]) => {
    if (args.some(isViteWebsocketMessage)) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (args.some(isViteWebsocketMessage)) {
      return;
    }
    originalWarn.apply(console, args);
  };

  const isViteWebsocketError = (err: any): boolean => {
    if (!err) return false;
    const str = String(err.message || err.description || err.stack || err);
    return isViteWebsocketMessage(str);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isViteWebsocketError(event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (isViteWebsocketError(event.error) || isViteWebsocketError(event.message)) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
