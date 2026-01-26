import React, { ReactNode } from 'react';
import './Grid.css';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 'auto';
export type GridGap = 'none' | 'sm' | 'md' | 'lg';

export interface GridProps {
  /** Number of columns (or 'auto' for auto-fit) */
  cols?: GridCols;
  /** Minimum column width for auto-fit mode */
  minColWidth?: string;
  /** Gap between items */
  gap?: GridGap;
  /** Responsive: collapse to single column on mobile */
  responsive?: boolean;
  /** Child content */
  children: ReactNode;
}

/**
 * Grid provides CSS grid-based layout for card grids and multi-column layouts.
 * Replaces bare <div> with grid-template-columns patterns.
 */
export const Grid: React.FC<GridProps> = ({
  cols = 'auto',
  minColWidth = '280px',
  gap = 'md',
  responsive = true,
  children,
}) => {
  const classes = [
    'ui-grid',
    cols !== 'auto' && `ui-grid--cols-${cols}`,
    `ui-grid--gap-${gap}`,
    responsive && 'ui-grid--responsive',
  ].filter(Boolean).join(' ');

  const style = cols === 'auto' ? {
    '--grid-min-col-width': minColWidth,
  } as React.CSSProperties : undefined;

  return <div className={classes} style={style}>{children}</div>;
};
