import React from 'react';
import { PluginIcon } from './PluginIcon';
import './DestinationBadge.css';

interface DestinationBadgeProps {
    /** Destination display name */
    name: string;
    /** Emoji fallback icon */
    icon: string;
    /** Icon type (svg, png, jpg) */
    iconType?: string;
    /** Path to icon asset */
    iconPath?: string;
    /** Optional click handler (e.g., to open external URL) */
    onClick?: () => void;
}

/**
 * DestinationBadge – a celebratory gradient card for successful destinations.
 * Uses real plugin images when available, falls back to emoji.
 * Bigger than a pill, smaller than a full GlowCard — celebrates the sync.
 */
export const DestinationBadge: React.FC<DestinationBadgeProps> = ({
    name,
    icon,
    iconType,
    iconPath,
    onClick,
}) => {
    const classes = [
        'destination-badge',
        onClick && 'destination-badge--clickable',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="destination-badge__icon">
                <PluginIcon icon={icon} iconType={iconType} iconPath={iconPath} size="medium" />
            </div>
            <div className="destination-badge__info">
                <span className="destination-badge__name">{name}</span>
                <span className="destination-badge__status">✓ Synced successfully</span>
            </div>
            {onClick && (
                <span className="destination-badge__arrow">↗</span>
            )}
        </div>
    );
};
