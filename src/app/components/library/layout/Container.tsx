import React, { ReactNode } from 'react';
import './Container.css';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

export interface ContainerProps {
  /** Container max-width size */
  size?: ContainerSize;
  /** Internal padding */
  padding?: ContainerPadding;
  /** Center content horizontally */
  centered?: boolean;
  /** Child content */
  children: ReactNode;
}

/**
 * Container provides consistent max-width and padding for page sections.
 * Replaces bare <div> patterns.
 */
export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  padding = 'md',
  centered = true,
  children,
}) => {
  const classes = [
    'ui-container',
    `ui-container--${size}`,
    `ui-container--padding-${padding}`,
    centered && 'ui-container--centered',
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
};
