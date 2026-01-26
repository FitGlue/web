import React from 'react';
import { Link } from 'react-router-dom';
import './CardHeader.css';

interface CardHeaderProps {
  /** Emoji or icon character */
  icon: string;
  /** Card title text */
  title: string;
  /** Optional link destination */
  linkTo?: string;
  /** Optional link label (default: "View All →") */
  linkLabel?: string;
  /** Optional click handler instead of link */
  onAction?: () => void;
  /** Optional action label for button */
  actionLabel?: string;
  /** Conditionally show the link */
  showLink?: boolean;
}

/**
 * Reusable card header with icon, title, and optional action link/button.
 * Used in dashboard cards and other card-based layouts.
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  title,
  linkTo,
  linkLabel = 'View All →',
  onAction,
  actionLabel,
  showLink = true,
}) => {
  return (
    <div>
      <h3>{icon} {title}</h3>
      {showLink && linkTo && (
        <Link to={linkTo}>{linkLabel}</Link>
      )}
      {showLink && onAction && (
        <button onClick={onAction}>
          {actionLabel || linkLabel}
        </button>
      )}
    </div>
  );
};

export default CardHeader;
