import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Fix for "Unable to preload CSS/JS" errors during navigation (Module Load Errors)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected, reloading page...', event);
  window.location.reload();
});

// Catch standard module fetch errors that don't trigger vite:preloadError
window.addEventListener('error', (e) => {
  if (e.message?.includes('dynamically imported module') || e.message?.includes('module script')) {
    console.warn('Module fetch error detected, force reloading...');
    window.location.reload();
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
