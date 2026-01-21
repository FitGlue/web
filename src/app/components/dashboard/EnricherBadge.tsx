import React from 'react';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';

interface EnricherBadgeProps {
    /** Enricher provider name (e.g., 'muscle-heatmap', 'fitbit-heart-rate') */
    providerName: string;
    /** Execution status */
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | string;
    /** Optional metadata to display */
    metadata?: Record<string, unknown>;
}

const humanizeProviderName = (name: string): string => {
    return name
        .replace(/[_-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * EnricherBadge displays a pill-style badge for an enricher that was applied to an activity.
 */
export const EnricherBadge: React.FC<EnricherBadgeProps> = ({
    providerName,
    status,
    metadata,
}) => {
    // Get icon from registry (centralized in registry.ts)
    const { enrichers } = usePluginRegistry();
    const enricherPlugin = enrichers.find(e => e.id === providerName || e.id === providerName.replace(/_/g, '-'));
    const icon = enricherPlugin?.icon || '✨';
    const displayName = enricherPlugin?.name || humanizeProviderName(providerName);
    const statusClass = status.toLowerCase();

    // Extract key metric from metadata if available
    const metricDisplay = React.useMemo(() => {
        if (!metadata) return null;
        if (metadata.muscles_tracked) return `${metadata.muscles_tracked} muscles`;
        if (metadata.hr_points_merged) return `${metadata.hr_points_merged} HR pts`;
        if (metadata.segments_matched) return `${metadata.segments_matched} segments`;
        return null;
    }, [metadata]);

    return (
        <span className={`enricher-badge enricher-badge--${statusClass}`} title={displayName}>
            <span className="enricher-badge__icon">{icon}</span>
            <span className="enricher-badge__name">{displayName}</span>
            {metricDisplay && status === 'SUCCESS' && (
                <span className="enricher-badge__metric">{metricDisplay}</span>
            )}
        </span>
    );
};
