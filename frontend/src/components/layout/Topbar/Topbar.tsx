// frontend/src/components/layout/Topbar/Topbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/Topbar/Topbar.tsx
// IMPORT AS: import Topbar from '@/components/layout/Topbar/Topbar'
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './Topbar.css';

interface TopbarProps {
  panel?: 'doctor' | 'user';
}

const Topbar: React.FC<TopbarProps> = ({ panel = 'user' }) => {
  return (
    <header className="topbar">
      {/* Left — Brand */}
      <div className="topbar__brand">
        <span className="topbar__logo-mark" aria-hidden="true">◈</span>
        <span className="topbar__product-name">CutisAI</span>
        {panel === 'doctor' && (
          <span className="topbar__panel-tag">Clinical</span>
        )}
      </div>

      {/* Centre — Status (Doctor Panel only) */}
      {panel === 'doctor' && (
        <div className="topbar__status">
          <span className="topbar__pulse-dot" aria-hidden="true" />
          <span className="topbar__status-text mono">System operational</span>
        </div>
      )}

      {/* Right — Nav */}
      <nav className="topbar__nav" aria-label="Top navigation">
        {panel === 'user' ? (
          <>
            <a href="/" className="topbar__nav-link">Home</a>
            <a href="/about" className="topbar__nav-link">About</a>
            <a href="/history" className="topbar__nav-link">History</a>
          </>
        ) : (
          <>
            <button className="topbar__icon-btn" aria-label="Notifications">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <div className="topbar__avatar" aria-label="User menu">
              <span>Dr</span>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};

export default Topbar;
