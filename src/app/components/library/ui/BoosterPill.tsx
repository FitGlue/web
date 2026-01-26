import React from 'react';
import './BoosterPill.css';

interface BoosterPillProps {
  /** Order number (1-based) */
  order: number;
  /** Icon emoji/character */
  icon: string;
  /** Booster name */
  name: string;
  /** Whether booster has configuration */
  isConfigured?: boolean;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * BoosterPill - Compact pill showing an enricher/booster with its icon and name.
 * Used in pipeline cards and flow visualizations.
 */
export const BoosterPill: React.FC<BoosterPillProps> = ({
  order,
  icon,
  name,
  isConfigured = false,
  onClick,
}) => {
  return (
    <div
     
      title={name}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <span>{order}</span>
      <span>{icon}</span>
      <span>{name}</span>
      {isConfigured && <span>✓</span>}
    </div>
  );
};

export default BoosterPill;
