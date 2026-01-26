import React, { ReactNode } from 'react';
import './PendingInputItem.css';

type PendingInputItemVariant = 'awaiting' | 'needs-input';

interface PendingInputItemProps {
  /** Icon element */
  icon: ReactNode;
  /** Primary title */
  title: ReactNode;
  /** Subtitle/description */
  subtitle: ReactNode;
  /** Visual variant - determines left border color */
  variant?: PendingInputItemVariant;
  /** Click handler */
  onClick?: () => void;
}

/**
 * PendingInputItem - Compact clickable item for action required cards.
 * Colored left border indicates awaiting (orange) vs needs-input (pink).
 */
export const PendingInputItem: React.FC<PendingInputItemProps> = ({
  icon,
  title,
  subtitle,
  variant = 'needs-input',
  onClick,
}) => {
  return (
    <button
      className={`pending-input-item pending-input-item--${variant}`}
      onClick={onClick}
      type="button"
    >
      <span className="pending-input-item__icon">{icon}</span>
      <span className="pending-input-item__content">
        <span className="pending-input-item__title">{title}</span>
        <span className="pending-input-item__subtitle">{subtitle}</span>
      </span>
      <span className="pending-input-item__arrow">→</span>
    </button>
  );
};

export default PendingInputItem;
