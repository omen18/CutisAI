// frontend/src/components/common/Buttons/Button.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/common/Buttons/Button.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...rest
}) => (
  <button
    className={[
      'btn',
      `btn--${variant}`,
      size === 'sm' ? 'btn--sm' : '',
      fullWidth ? 'btn--full' : '',
      loading ? 'btn--loading' : '',
      className,
    ].filter(Boolean).join(' ')}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? (
      <span className="btn__spinner" aria-hidden="true" />
    ) : icon ? (
      <span className="btn__icon" aria-hidden="true">{icon}</span>
    ) : null}
    <span className="btn__label">{children}</span>
  </button>
);

export default Button;
