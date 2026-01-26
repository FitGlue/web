import React, { ReactNode } from 'react';
import './Heading.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface HeadingProps {
  /** Semantic heading level (h1-h6) */
  level?: HeadingLevel;
  /** Visual size (can differ from semantic level) */
  size?: HeadingSize;
  /** Muted/secondary color */
  muted?: boolean;
  /** Centered text */
  centered?: boolean;
  /** Gradient text (pink/purple brand) */
  gradient?: boolean;
  /** Child content */
  children: ReactNode;
}

/**
 * Heading provides semantic headings with consistent styling.
 * Replaces bare <h1> through <h6> tags.
 */
export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  size,
  muted = false,
  centered = false,
  gradient = false,
  children,
}) => {
  const effectiveSize = size || (
    level === 1 ? '2xl' :
    level === 2 ? 'xl' :
    level === 3 ? 'lg' :
    level === 4 ? 'md' :
    level === 5 ? 'sm' : 'xs'
  );

  const classes = [
    'ui-heading',
    `ui-heading--${effectiveSize}`,
    muted && 'ui-heading--muted',
    centered && 'ui-heading--centered',
    gradient && 'ui-heading--gradient',
  ].filter(Boolean).join(' ');

  // Use explicit element rendering to avoid JSX type issues
  switch (level) {
    case 1: return <h1 className={classes}>{children}</h1>;
    case 2: return <h2 className={classes}>{children}</h2>;
    case 3: return <h3 className={classes}>{children}</h3>;
    case 4: return <h4 className={classes}>{children}</h4>;
    case 5: return <h5 className={classes}>{children}</h5>;
    case 6: return <h6 className={classes}>{children}</h6>;
    default: return <h2 className={classes}>{children}</h2>;
  }
};
