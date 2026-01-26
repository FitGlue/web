import React from 'react';
import './StatInline.css';

interface StatInlineProps {
  /** The value to display */
  value: React.ReactNode;
  /** Label describing the stat */
  label: string;
  /** Optional sub-label (e.g., "This Month") */
  subLabel?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * StatInline - Compact inline statistic display.
 * Used for dashboard stats and summary numbers.
 */
export const StatInline: React.FC<StatInlineProps> = ({
  value,
  label,
  subLabel,
  loading = false,
}) => {
  return (
    <div className="stat-inline">
      <span className={`stat-inline__value ${loading ? 'stat-inline__skeleton' : ''}`}>
        {loading ? '--' : value}
      </span>
      <div className="stat-inline__labels">
        <span className="stat-inline__label">{label}</span>
        {subLabel && <span className="stat-inline__sublabel">{subLabel}</span>}
      </div>
    </div>
  );
};

export default StatInline;
