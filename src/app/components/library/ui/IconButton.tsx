import React from 'react';
import './IconButton.css';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'default' | 'ghost' | 'danger';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon content (emoji or icon component) */
  icon: React.ReactNode;
  /** Button size */
  size?: IconButtonSize;
  /** Visual variant */
  variant?: IconButtonVariant;
  /** Loading state */
  loading?: boolean;
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string;
}

/**
 * IconButton provides a compact button for icon-only actions.
 * Replaces bare <button>×</button> and similar patterns.
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'default',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    'ui-icon-button',
    `ui-icon-button--${size}`,
    `ui-icon-button--${variant}`,
    loading && 'ui-icon-button--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span />
      ) : (
        icon
      )}
    </button>
  );
};
