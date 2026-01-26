import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import './index.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual size variant */
  size?: 'small' | 'default' | 'large';
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Auto-resize based on content */
  autoResize?: boolean;
}

/**
 * Textarea - Standardized textarea with premium styling.
 * Features gradient focus border and consistent dark theme styling.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  size = 'default',
  error = false,
  fullWidth = true,
  autoResize = false,
  className = '',
  rows = 3,
  ...props
}, ref) => {
  const classes = [
    'form-textarea',
    `form-textarea--${size}`,
    error && 'form-textarea--error',
    fullWidth && 'form-textarea--full-width',
    autoResize && 'form-textarea--auto-resize',
    className,
  ].filter(Boolean).join(' ');

  return (
    <textarea
      ref={ref}
      className={classes}
      rows={rows}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
