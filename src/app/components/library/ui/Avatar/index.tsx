import React from 'react';
import './index.css';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarVariant = 'gradient' | 'solid';

export interface AvatarProps {
  /** Single character initial to display */
  initial: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Visual variant */
  variant?: AvatarVariant;
}

/**
 * Avatar displays a user's initial in a circular badge.
 * Uses gradient styling by default for premium feel.
 */
export const Avatar: React.FC<AvatarProps> = ({
  initial,
  size = 'md',
  variant = 'gradient',
}) => {
  const classes = [
    'ui-avatar',
    `ui-avatar--${size}`,
    `ui-avatar--${variant}`,
  ].join(' ');

  // Take only first character and uppercase it
  const displayInitial = initial.charAt(0).toUpperCase();

  return (
    <div className={classes}>
      {displayInitial}
    </div>
  );
};
