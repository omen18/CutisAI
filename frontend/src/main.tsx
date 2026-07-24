// frontend/src/main.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/main.tsx
// Entry point — wire router + global styles
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import AppRouter from './routing/routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
