import React from 'react';
import './index.css';

export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Required indicator */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Help text */
  hint?: string;
  /** Field content (input, select, textarea, etc.) */
  children: React.ReactNode;
  /** HTML for attribute for label */
  htmlFor?: string;
}

/**
 * FormField - Wrapper component for form inputs with label, hint, and error support.
 * Provides consistent spacing and styling for all form elements.
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  htmlFor,
}) => {
  const classes = [
    'form-field',
    error && 'form-field--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className="form-field__label" htmlFor={htmlFor}>
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      <div className="form-field__control">
        {children}
      </div>
      {hint && !error && (
        <span className="form-field__hint">{hint}</span>
      )}
      {error && (
        <span className="form-field__error">{error}</span>
      )}
    </div>
  );
};

export default FormField;
