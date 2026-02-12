import React, { ReactNode } from 'react';
import './Stack.css';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface StackProps {
  /** Stack direction */
  direction?: StackDirection;
  /** Gap between items */
  gap?: StackGap;
  /** Align items (cross-axis) */
  align?: StackAlign;
  /** Justify content (main-axis) */
  justify?: StackJustify;
  /** Wrap items when they overflow */
  wrap?: boolean;
  /** Take full width */
  fullWidth?: boolean;
  /** Responsive: horizontal becomes vertical on mobile */
  responsive?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Title attribute */
  title?: string;
  /** ARIA role */
  role?: string;
  /** ARIA label */
  'aria-label'?: string;
  /** Touch move handler (for drag interactions) */
  onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
  /** Child content */
  children?: ReactNode;
}

/**
 * Stack provides flexbox-based layout for vertical or horizontal arrangements.
 * Replaces bare <div> flexbox wrappers.
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  fullWidth = false,
  responsive = false,
  className,
  style,
  title,
  role,
  'aria-label': ariaLabel,
  onTouchMove,
  children,
}) => {
  const classes = [
    'ui-stack',
    `ui-stack--${direction}`,
    `ui-stack--gap-${gap}`,
    `ui-stack--align-${align}`,
    `ui-stack--justify-${justify}`,
    wrap && 'ui-stack--wrap',
    fullWidth && 'ui-stack--full-width',
    responsive && 'ui-stack--responsive',
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} title={title} role={role} aria-label={ariaLabel} onTouchMove={onTouchMove}>{children}</div>;
};
