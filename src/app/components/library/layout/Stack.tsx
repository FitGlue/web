import React, { ReactNode } from 'react';
import './Stack.css';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
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
  /** Child content */
  children: ReactNode;
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
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
};
