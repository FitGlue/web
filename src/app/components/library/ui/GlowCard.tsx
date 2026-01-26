import React, { ReactNode } from 'react';
import './GlowCard.css';

type GlowCardVariant = 'default' | 'success' | 'premium' | 'awaiting' | 'needs-input';

interface GlowCardProps {
  /** Glow variant - determines the glow/header color */
  variant?: GlowCardVariant;
  /** Whether the card is in a loading/pending state */
  loading?: boolean;
  /** Header content - rendered with gradient background */
  header?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Card content */
  children: ReactNode;
}

/**
 * GlowCard - A card with a gradient header background.
 * The header has an animated gradient (shimmer when loading, solid color when complete).
 * Used for premium content that should stand out.
 */
export const GlowCard: React.FC<GlowCardProps> = ({
  variant = 'default',
  loading = false,
  header,
  onClick,
  children,
}) => {
  const classes = [
    'glow-card',
    `glow-card--${variant}`,
    loading && 'glow-card--loading',
    onClick && 'glow-card--clickable',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {header && (
        <div className="glow-card__header">
          {header}
        </div>
      )}
      <div className="glow-card__content">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
