// frontend/src/components/layout/KPI/KpiCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/KPI/KpiCard.tsx
// Used in Doctor Dashboard KPI row (4 cards)
// stripeColor: CSS color string for the left accent stripe
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './KpiCard.css';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  stripeColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sub,
  stripeColor = 'var(--burg)',
  trend,
  trendValue,
}) => (
  <div className="kpi-card" style={{ '--kpi-stripe': stripeColor } as React.CSSProperties}>
    <div className="kpi-card__stripe" aria-hidden="true" />
    <div className="kpi-card__body">
      <p className="kpi-card__label uppercase mono">{label}</p>
      <p className="kpi-card__value serif">{value}</p>
      <div className="kpi-card__footer">
        {sub && <p className="kpi-card__sub mono">{sub}</p>}
        {trend && trendValue && (
          <span className={`kpi-card__trend kpi-card__trend--${trend}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default KpiCard;
