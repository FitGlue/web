import React from 'react';
import './TabButton.css';

interface TabButtonProps {
  /** Tab label text */
  label: string;
  /** Whether this tab is active */
  active: boolean;
  /** Click handler */
  onClick: () => void;
  /** Optional count badge */
  count?: number;
  /** Optional icon */
  icon?: string;
  /** Variant for different contexts */
  variant?: 'default' | 'warning';
}

/**
 * Reusable tab button component with consistent styling.
 * Used for tab navigation across the app.
 */
export const TabButton: React.FC<TabButtonProps> = ({
  label,
  active,
  onClick,
  count,
  icon,
  variant = 'default',
}) => {
  return (
    <button
      className={`tab-button ${active ? 'tab-button--active' : ''} tab-button--${variant}`}
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      {label}
      {count !== undefined && (
        <span>{count}</span>
      )}
    </button>
  );
};

export default TabButton;
