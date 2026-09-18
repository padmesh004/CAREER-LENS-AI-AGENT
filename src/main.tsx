import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Resilient development WebSocket error interceptor to prevent HMR connection alerts from disrupting user state
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = (event.message || '').toLowerCase();
    const isViteSocketError = 
      msg.includes('websocket') || 
      msg.includes('hmr') || 
      msg.includes('vite') ||
      msg.includes('connection failed') ||
      (event.error && (event.error.message || '').toLowerCase().includes('websocket'));

    if (isViteSocketError) {
      // Prevent the error from crashing the UI/application rendering
      event.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason && typeof reason.message === 'string' ? reason.message.toLowerCase() : '';
    if (msg.includes('websocket') || msg.includes('hmr') || msg.includes('vite')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

