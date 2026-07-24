// frontend/src/components/layout/Card/Card.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/Card/Card.tsx
// The core container. Used everywhere in both panels.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, badge }) => (
  <div className="card__header">
    <div className="card__header-left">
      <div className="card__header-title-row">
        <h3 className="card__title">{title}</h3>
        {badge && <span className="card__header-badge">{badge}</span>}
      </div>
      {subtitle && <p className="card__subtitle mono">{subtitle}</p>}
    </div>
    {action && <div className="card__header-action">{action}</div>}
  </div>
);

const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => (
  <div className={`card${noPadding ? ' card--no-padding' : ''}${className ? ' ' + className : ''}`}>
    {children}
  </div>
);

export default Card;
