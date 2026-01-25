import React from 'react';
import './Pill.css';

export interface PillProps {
  /** Content of the pill */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'gradient' | 'outlined' | 'muted';
  /** Size variant */
  size?: 'small' | 'default' | 'large';
  /** Optional icon */
  icon?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** Active/selected state (for tabs) */
  active?: boolean;
}

/**
 * Pill - Compact status indicator with optional icon.
 * Used for status badges, tags, labels, and tabs.
 *
 * Variants:
 * - default: Light background, dark text
 * - success/warning/error/info: Semantic colors
 * - primary: Brand purple
 * - gradient: Pink-to-purple gradient background, white text (for activity types)
 * - outlined: Transparent with border
 * - muted: Subtle, low-contrast
 */
export const Pill: React.FC<PillProps> = ({
  children,
  variant = 'default',
  size = 'default',
  icon,
  onClick,
  className = '',
  active = false,
}) => {
  const classes = [
    'pill',
    `pill--${variant}`,
    `pill--${size}`,
    active && 'pill--active',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <span className="pill__icon">{icon}</span>}
      {children}
    </span>
  );
};

export default Pill;
