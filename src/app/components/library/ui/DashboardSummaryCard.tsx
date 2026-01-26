import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './DashboardSummaryCard.css';

interface DashboardSummaryCardProps {
  /** Card title */
  title: string;
  /** Emoji icon for header */
  icon?: string;
  /** Link destination for action */
  linkTo?: string;
  /** Link label (default: "View All →") */
  linkLabel?: string;
  /** Whether to show the link */
  showLink?: boolean;
  /** Main content */
  children: ReactNode;
  /** Footer text (e.g., "4 of 6 connected") */
  footerText?: ReactNode;
}

/**
 * DashboardSummaryCard - Consistent card layout for dashboard summaries.
 * Header with action in top-right, content area, and sticky footer.
 */
export const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({
  title,
  icon,
  linkTo,
  linkLabel = 'View All →',
  showLink = true,
  children,
  footerText,
}) => {
  return (
    <div className="dashboard-summary-card">
      <div className="dashboard-summary-card__header">
        <h3 className="dashboard-summary-card__title">
          {icon && <span className="dashboard-summary-card__icon">{icon}</span>}
          {title}
        </h3>
        {showLink && linkTo && (
          <Link to={linkTo} className="dashboard-summary-card__link">
            {linkLabel}
          </Link>
        )}
      </div>
      <div className="dashboard-summary-card__content">
        {children}
      </div>
      {footerText && (
        <div className="dashboard-summary-card__footer">
          {footerText}
        </div>
      )}
    </div>
  );
};

export default DashboardSummaryCard;
