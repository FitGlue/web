import React, { forwardRef, SelectHTMLAttributes } from 'react';
import './index.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Options to display */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Visual size variant */
  size?: 'small' | 'default' | 'large';
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Select - Standardized select dropdown with premium styling.
 * Features gradient focus border and consistent dark theme styling.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  placeholder,
  size = 'default',
  error = false,
  fullWidth = true,
  className = '',
  value,
  ...props
}, ref) => {
  const classes = [
    'form-select',
    `form-select--${size}`,
    error && 'form-select--error',
    fullWidth && 'form-select--full-width',
    !value && placeholder && 'form-select--placeholder',
    className,
  ].filter(Boolean).join(' ');

  return (
    <select
      ref={ref}
      className={classes}
      value={value}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;
