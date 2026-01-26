import React, { ReactNode, FormEvent } from 'react';
import './Form.css';

export interface FormProps {
  /** Submit handler */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /** Loading/submitting state */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Spacing between form fields */
  spacing?: 'sm' | 'md' | 'lg';
  /** Form content */
  children: ReactNode;
}

/**
 * Form provides a wrapper for form elements with consistent styling and error handling.
 * Replaces bare <form> tags.
 */
export const Form: React.FC<FormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  spacing = 'md',
  children,
}) => {
  const classes = [
    'ui-form',
    `ui-form--spacing-${spacing}`,
    loading && 'ui-form--loading',
  ].filter(Boolean).join(' ');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loading) {
      onSubmit(e);
    }
  };

  return (
    <form className={classes} onSubmit={handleSubmit}>
      {error && (
        <div>
          <span>⚠</span>
          {error}
        </div>
      )}
      <div>{children}</div>
    </form>
  );
};
