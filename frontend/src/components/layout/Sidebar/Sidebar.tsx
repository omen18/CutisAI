// frontend/src/components/layout/Sidebar/Sidebar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/Sidebar/Sidebar.tsx
// Used ONLY in Doctor Panel layout. Not rendered in User Panel.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './Sidebar.css';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const IconAnalysis = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconHistory = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
    <polyline points="3 3 3 8 8 8"/>
  </svg>
);
const IconMetrics = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const navItems: NavItem[] = [
  { icon: <IconDashboard />, label: 'Dashboard',  href: '/doctor',          active: true },
  { icon: <IconAnalysis />,  label: 'New Analysis', href: '/doctor/analyse' },
  { icon: <IconHistory />,   label: 'History',    href: '/doctor/history' },
  { icon: <IconMetrics />,   label: 'Metrics',    href: '/doctor/metrics' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      {/* Section label */}
      <p className="sidebar__section-label uppercase mono">Navigation</p>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`sidebar__item transition-colors${item.active ? ' sidebar__item--active' : ''}`}
          >
            <span className="sidebar__item-icon">{item.icon}</span>
            <span className="sidebar__item-label">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Bottom — Settings */}
      <div className="sidebar__footer">
        <p className="sidebar__section-label uppercase mono">System</p>
        <a href="/doctor/settings" className="sidebar__item transition-colors">
          <span className="sidebar__item-icon"><IconSettings /></span>
          <span className="sidebar__item-label">Settings</span>
        </a>
        {/* Model info */}
        <div className="sidebar__model-info">
          <p className="sidebar__model-label mono">Active model</p>
          <p className="sidebar__model-value mono">ResUNet + EffB0</p>
          <p className="sidebar__model-version mono">v1.0 · INT8</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
