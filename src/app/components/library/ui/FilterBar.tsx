import React, { ReactNode } from 'react';
import { Button } from './Button';
import './FilterBar.css';

// ============================================================================
// FilterBar
// ============================================================================
export interface FilterBarProps {
  /** Filter field children */
  children: ReactNode;
  /** Apply filters handler */
  onApply?: () => void;
  /** Reset filters handler */
  onReset?: () => void;
  /** Show apply button */
  showApply?: boolean;
  /** Show reset button */
  showReset?: boolean;
  /** Apply button text */
  applyText?: string;
  /** Reset button text */
  resetText?: string;
  /** Inline variant (more compact) */
  inline?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * FilterBar provides a container for filter controls.
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  onApply,
  onReset,
  showApply = true,
  showReset = true,
  applyText = 'Apply',
  resetText = 'Reset',
  inline = false,
  loading = false,
  className = '',
}) => {
  const classes = [
    'ui-filter-bar',
    inline && 'ui-filter-bar--inline',
    className,
  ].filter(Boolean).join(' ');

  const hasActions = (showApply && onApply) || (showReset && onReset);

  return (
    <div className={classes}>
      <div className="ui-filter-bar__fields">
        {children}
      </div>
      {hasActions && (
        <div className="ui-filter-bar__actions">
          {showApply && onApply && (
            <Button
              variant="secondary"
              size="small"
              onClick={onApply}
              disabled={loading}
            >
              {applyText}
            </Button>
          )}
          {showReset && onReset && (
            <Button
              variant="text"
              size="small"
              onClick={onReset}
              disabled={loading}
            >
              {resetText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FilterField
// ============================================================================
export interface FilterFieldProps {
  /** Field label */
  label: string;
  /** Field content (input, select, etc.) */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * FilterField provides a labeled container for individual filter inputs.
 */
export const FilterField: React.FC<FilterFieldProps> = ({
  label,
  children,
  className = '',
}) => {
  const classes = [
    'ui-filter-field',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className="ui-filter-field__label">{label}</span>
      {children}
    </div>
  );
};
