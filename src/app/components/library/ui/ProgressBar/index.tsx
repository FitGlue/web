import React from 'react';
import './index.css';

export type ProgressBarSize = 'sm' | 'md';
export type ProgressBarVariant = 'default' | 'gradient' | 'success' | 'warning' | 'error';

export interface ProgressBarProps {
  /** Current value */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Visual variant */
  variant?: ProgressBarVariant;
  /** Size of the bar */
  size?: ProgressBarSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * ProgressBar displays progress toward a goal.
 * Automatically calculates percentage from value/max.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  ariaLabel,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const containerClasses = [
    'ui-progress',
    `ui-progress--${size}`,
  ].join(' ');

  const fillClasses = [
    'ui-progress__fill',
    `ui-progress__fill--${variant}`,
  ].join(' ');

  return (
    <div className={containerClasses}>
      <div
        className="ui-progress__track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel}
      >
        <div
          className={fillClasses}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="ui-progress__label">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};
