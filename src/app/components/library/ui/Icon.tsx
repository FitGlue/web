import React from 'react';
import './Icon.css';

export type IconName =
  | 'check' | 'close' | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down'
  | 'refresh' | 'settings' | 'edit' | 'delete' | 'copy' | 'link'
  | 'info' | 'warning' | 'error' | 'success'
  | 'plus' | 'minus' | 'search' | 'filter'
  | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chevron-down';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps {
  /** Icon name */
  name: IconName;
  /** Size */
  size?: IconSize;
  /** Accessible label */
  'aria-label'?: string;
}

// Simple emoji/unicode icon mapping - can be extended with SVG icons later
const ICON_MAP: Record<IconName, string> = {
  'check': '✓',
  'close': '×',
  'arrow-left': '←',
  'arrow-right': '→',
  'arrow-up': '↑',
  'arrow-down': '↓',
  'refresh': '↻',
  'settings': '⚙',
  'edit': '✎',
  'delete': '🗑',
  'copy': '📋',
  'link': '🔗',
  'info': 'ℹ',
  'warning': '⚠',
  'error': '✕',
  'success': '✓',
  'plus': '+',
  'minus': '−',
  'search': '🔍',
  'filter': '⚡',
  'chevron-left': '‹',
  'chevron-right': '›',
  'chevron-up': '‹',
  'chevron-down': '›',
};

/**
 * Icon provides consistent iconography.
 * Uses unicode/emoji for now, can be upgraded to SVG.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  'aria-label': ariaLabel,
}) => {
  const classes = [
    'ui-icon',
    `ui-icon--${size}`,
  ].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      {ICON_MAP[name] || '?'}
    </span>
  );
};
