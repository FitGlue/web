import React, { ReactNode } from 'react';
import './SummaryListItem.css';

interface SummaryListItemProps {
  /** Icon element (emoji, component, or image) */
  icon?: ReactNode;
  /** Primary text/title */
  title: ReactNode;
  /** Optional secondary text/subtitle */
  subtitle?: ReactNode;
  /** Status indicator (connected, disconnected, etc.) */
  status?: ReactNode;
  /** Click handler */
  onClick?: () => void;
}

/**
 * SummaryListItem - Consistent row item for dashboard summary cards.
 * Used for connections, pipelines, and other list items.
 */
export const SummaryListItem: React.FC<SummaryListItemProps> = ({
  icon,
  title,
  subtitle,
  status,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`summary-list-item ${onClick ? 'summary-list-item--clickable' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {icon && <span className="summary-list-item__icon">{icon}</span>}
      <span className="summary-list-item__content">
        <span className="summary-list-item__title">{title}</span>
        {subtitle && <span className="summary-list-item__subtitle">{subtitle}</span>}
      </span>
      {status && <span className="summary-list-item__status">{status}</span>}
    </Component>
  );
};

export default SummaryListItem;
