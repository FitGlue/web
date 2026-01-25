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
      className="booster-pill"
      title={name}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <span className="booster-pill__order">{order}</span>
      <span className="booster-pill__icon">{icon}</span>
      <span className="booster-pill__name">{name}</span>
      {isConfigured && <span className="booster-pill__configured">✓</span>}
    </div>
  );
};

export default BoosterPill;
