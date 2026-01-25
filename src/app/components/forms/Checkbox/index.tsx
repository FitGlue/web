import React, { forwardRef, InputHTMLAttributes } from 'react';
import './index.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Label text */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Visual size variant */
  size?: 'small' | 'default' | 'large';
  /** Error state */
  error?: boolean;
}

/**
 * Checkbox - Standardized checkbox with premium styling.
 * Features gradient checked state and smooth animations.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  size = 'default',
  error = false,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const classes = [
    'form-checkbox-wrapper',
    `form-checkbox-wrapper--${size}`,
    error && 'form-checkbox-wrapper--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className="form-checkbox__input"
        {...props}
      />
      <label htmlFor={checkboxId} className="form-checkbox__label">
        <span className="form-checkbox__box">
          <svg className="form-checkbox__check" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        {(label || description) && (
          <span className="form-checkbox__text">
            {label && <span className="form-checkbox__label-text">{label}</span>}
            {description && <span className="form-checkbox__description">{description}</span>}
          </span>
        )}
      </label>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
