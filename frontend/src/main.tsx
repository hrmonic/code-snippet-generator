import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Protection contre les erreurs d'extensions de navigateur
if (typeof window !== 'undefined') {
  // Supprimer les erreurs de console causées par les extensions
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('browser is not defined') ||
        args[0].includes('chrome-extension://') ||
        args[0].includes('moz-extension://'))
    ) {
      return; // Ignorer les erreurs d'extensions
    }
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
