import React from 'react';
import { PluginIcon } from './PluginIcon';
import './ConnectionStatusItem.css';

interface ConnectionStatusItemProps {
  /** Integration name */
  name: string;
  /** Whether the integration is connected */
  connected: boolean;
  /** Emoji icon fallback */
  icon?: string;
  /** Icon type (svg, png, etc) */
  iconType?: string;
  /** Path to icon image */
  iconPath?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * ConnectionStatusItem - Shows a single integration/connection status.
 * Used in dashboard connection lists and integration pages.
 */
export const ConnectionStatusItem: React.FC<ConnectionStatusItemProps> = ({
  name,
  connected,
  icon,
  iconType,
  iconPath,
  onClick,
}) => {
  return (
    <div
      className={`connection-status-item ${connected ? 'connection-status-item--connected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <PluginIcon
        icon={icon}
        iconType={iconType}
        iconPath={iconPath}
        size="small"
        className="connection-status-item__icon"
      />
      <span className="connection-status-item__name">{name}</span>
      <span className={`connection-status-item__status ${connected ? 'active' : 'inactive'}`}>
        {connected ? '✓' : '○'}
      </span>
    </div>
  );
};

export default ConnectionStatusItem;
