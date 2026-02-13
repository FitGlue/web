import React, { useState } from 'react';
import './index.css';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarVariant = 'gradient' | 'solid';

export interface AvatarProps {
  /** Single character initial to display */
  initial: string;
  /** Optional image URL — falls back to initial on error */
  src?: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Visual variant */
  variant?: AvatarVariant;
}

/**
 * Avatar displays a user's photo or initial in a circular badge.
 * Uses gradient styling by default for premium feel.
 */
export const Avatar: React.FC<AvatarProps> = ({
  initial,
  src,
  size = 'md',
  variant = 'gradient',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const classes = [
    'ui-avatar',
    `ui-avatar--${size}`,
    `ui-avatar--${variant}`,
  ].join(' ');

  // Take only first character and uppercase it
  const displayInitial = initial.charAt(0).toUpperCase();

  const showImage = src && !imgFailed;

  return (
    <div className={classes}>
      {showImage ? (
        <img
          className="ui-avatar__img"
          src={src}
          alt={displayInitial}
          onError={() => setImgFailed(true)}
        />
      ) : (
        displayInitial
      )}
    </div>
  );
};
