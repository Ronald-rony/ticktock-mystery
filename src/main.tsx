import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register offline-first Service Worker when running in web/PWA context
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
