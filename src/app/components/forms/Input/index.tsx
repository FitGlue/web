import React, { forwardRef, InputHTMLAttributes } from 'react';
import './index.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual size variant */
  size?: 'small' | 'default' | 'large';
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Input - Standardized text input with premium styling.
 * Features gradient focus border and consistent dark theme styling.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'default',
  error = false,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const classes = [
    'form-input',
    `form-input--${size}`,
    error && 'form-input--error',
    fullWidth && 'form-input--full-width',
    className,
  ].filter(Boolean).join(' ');

  return (
    <input
      ref={ref}
      className={classes}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
