import React, { ReactNode } from 'react';
import { Card } from './Card';
import './ActionCard.css';

type ActionCardVariant = 'awaiting' | 'needs-input' | 'default';

interface ActionCardProps {
  /** Visual variant - determines border/background tint */
  variant?: ActionCardVariant;
  /** Header content - rendered prominently at top */
  header?: ReactNode;
  /** Card content */
  children: ReactNode;
}

/**
 * ActionCard - Extends Card with variant-based tinting for action required items.
 * Used on the PendingInputsPage for larger, more detailed cards.
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  variant = 'default',
  header,
  children,
}) => {
  return (
    <div className={`action-card-wrapper action-card-wrapper--${variant}`}>
      <Card>
        {header && (
          <div className="action-card__header">
            {header}
          </div>
        )}
        <div className="action-card__content">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default ActionCard;
