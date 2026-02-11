import React, { ReactNode } from 'react';
import './SummaryListItem.css';

interface SummaryListItemProps {
  /** Icon element (emoji, component, or image) */
  icon?: ReactNode;
  /** Primary text/title (used with standard layout) */
  title?: ReactNode;
  /** Optional secondary text/subtitle (used with standard layout) */
  subtitle?: ReactNode;
  /** Custom content replacing title/subtitle for richer layouts */
  children?: ReactNode;
  /** Status indicator (connected, disconnected, etc.) */
  status?: ReactNode;
  /** Status color variant */
  statusVariant?: 'active' | 'inactive';
  /** Click handler */
  onClick?: () => void;
}

/**
 * SummaryListItem - Consistent row item for dashboard summary cards.
 * Used for connections, pipelines, and other list items.
 *
 * Use title/subtitle for simple rows, or children for custom content layouts.
 */
export const SummaryListItem: React.FC<SummaryListItemProps> = ({
  icon,
  title,
  subtitle,
  children,
  status,
  statusVariant,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';
  const statusClasses = [
    'summary-list-item__status',
    statusVariant && `summary-list-item__status--${statusVariant}`,
  ].filter(Boolean).join(' ');

  return (
    <Component
      className={`summary-list-item ${onClick ? 'summary-list-item--clickable' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {icon && <span className="summary-list-item__icon">{icon}</span>}
      <span className="summary-list-item__content">
        {children ?? (
          <>
            {title && <span className="summary-list-item__title">{title}</span>}
            {subtitle && <span className="summary-list-item__subtitle">{subtitle}</span>}
          </>
        )}
      </span>
      {status && <span className={statusClasses}>{status}</span>}
    </Component>
  );
};

export default SummaryListItem;
