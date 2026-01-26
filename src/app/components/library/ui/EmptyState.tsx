import React from 'react';
import { Button } from './Button';
import './EmptyState.css';

interface EmptyStateProps {
  /** Icon or emoji */
  icon?: string;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button text */
  actionLabel?: string;
  /** Primary action callback */
  onAction?: () => void;
  /** Secondary action button text */
  secondaryActionLabel?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Compact variant for inline use */
  variant?: 'default' | 'mini';
}

/**
 * EmptyState - Consistent empty state display with optional CTA.
 * Used when lists or cards have no content to display.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
}) => {
  const isMini = variant === 'mini';

  return (
    <div className={`empty-state ${isMini ? 'empty-state--mini' : ''}`}>
      {icon && <span>{icon}</span>}
      <p>{title}</p>
      {description && <p>{description}</p>}
      {(actionLabel || secondaryActionLabel) && (
        <div>
          {actionLabel && onAction && (
            <Button variant="primary" size={isMini ? 'small' : 'default'} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size={isMini ? 'small' : 'default'} onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
