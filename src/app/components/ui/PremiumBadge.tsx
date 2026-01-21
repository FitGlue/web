import React from 'react';
import './PremiumBadge.css';

interface PremiumBadgeProps {
  size?: 'small' | 'medium';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ size = 'small' }) => (
  <span
    className={`premium-badge premium-badge--${size}`}
    title="Athlete Plan Feature"
  >
    PRO
  </span>
);
