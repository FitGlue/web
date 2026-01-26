import React from 'react';
import './index.css';

export interface ListItemProps {
  /** Content of the list item */
  children: React.ReactNode;
  /** Show bottom divider */
  divider?: boolean;
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Optional click handler */
  onClick?: () => void;
  /** Active/selected state */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ListItem - Standardized list item with optional divider.
 * Ensures consistent spacing and divider styling across all lists.
 */
export const ListItem: React.FC<ListItemProps> = ({
  children,
  divider = true,
  padding = 'md',
  onClick,
  active = false,
  disabled = false,
}) => {
  const classes = [
    'list-item',
    `list-item--padding-${padding}`,
    divider && 'list-item--divider',
    active && 'list-item--active',
    disabled && 'list-item--disabled',
    onClick && 'list-item--clickable',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={!disabled ? onClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default ListItem;
