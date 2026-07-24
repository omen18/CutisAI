// frontend/src/components/common/Badges/Badge.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/common/Badges/Badge.tsx
// Variants: malignant | benign | pending | info | muted
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './Badge.css';

type BadgeVariant = 'malignant' | 'benign' | 'pending' | 'info' | 'muted';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  uppercase?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  size = 'md',
  uppercase = false,
}) => (
  <span
    className={[
      'badge',
      `badge--${variant}`,
      size === 'sm' ? 'badge--sm' : '',
      uppercase ? 'badge--uppercase' : '',
    ].filter(Boolean).join(' ')}
  >
    {children}
  </span>
);

export default Badge;
