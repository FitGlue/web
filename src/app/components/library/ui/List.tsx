import React, { ReactNode } from 'react';
import './List.css';

export type ListVariant = 'bullet' | 'ordered' | 'none';
export type ListSize = 'sm' | 'md';

export interface ListProps {
  /** List style */
  variant?: ListVariant;
  /** Text size */
  size?: ListSize;
  /** Spacing between items */
  spacing?: 'tight' | 'normal' | 'loose';
  /** List items */
  children: ReactNode;
}

export interface ListItemProps {
  /** Optional icon before content */
  icon?: ReactNode;
  /** Item content */
  children: ReactNode;
}

/**
 * List provides styled unordered/ordered lists.
 * Replaces bare <ul>, <ol>, <li> tags.
 */
export const List: React.FC<ListProps> = ({
  variant = 'bullet',
  size = 'md',
  spacing = 'normal',
  children,
}) => {
  const Tag = variant === 'ordered' ? 'ol' : 'ul';

  const classes = [
    'ui-list',
    `ui-list--${variant}`,
    `ui-list--${size}`,
    `ui-list--spacing-${spacing}`,
  ].filter(Boolean).join(' ');

  return <Tag className={classes}>{children}</Tag>;
};

/**
 * ListItem for use within List component.
 */
export const ListItem: React.FC<ListItemProps> = ({
  icon,
  children,
}) => {
  const classes = [
    'ui-list-item',
    icon && 'ui-list-item--with-icon',
  ].filter(Boolean).join(' ');

  return (
    <li className={classes}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </li>
  );
};
