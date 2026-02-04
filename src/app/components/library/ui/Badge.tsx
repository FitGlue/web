import React, { ReactNode } from 'react';
import './Badge.css';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium' | 'light' | 'booster' | 'booster-skipped' | 'booster-error' | 'source' | 'destination';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size */
  size?: BadgeSize;
  /** Optional icon before text */
  icon?: ReactNode;
  /** Badge content */
  children: ReactNode;
}

/**
 * Badge provides status/label indicators.
 * Replaces various ad-hoc badge/tag patterns.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
}) => {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};
