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
 * Determine effective status by checking metadata for status override.
 */
const getEffectiveStatus = (executionStatus: string, metadata?: Record<string, unknown>): string => {
    let status = executionStatus?.toUpperCase() || 'UNKNOWN';
    if (!metadata) return status;

    let metadataStatus: string | null = null;
    for (const [key, val] of Object.entries(metadata)) {
        if ((key === 'status' || key.endsWith('_status')) && typeof val === 'string') {
            metadataStatus = val.toLowerCase();
            break;
        }
    }

    if (status === 'SUCCESS' && metadataStatus) {
        if (metadataStatus === 'error') status = 'ERROR';
        else if (metadataStatus === 'skipped') status = 'SKIPPED';
    }

    return status;
};

/**
 * Map status → fg-booster-chip modifier class
 */
const getChipClass = (status: string): string => {
    switch (status) {
        case 'SUCCESS': return 'fg-booster-chip--run';
        case 'SKIPPED': return 'fg-booster-chip--queued';
        case 'ERROR':
        case 'FAILED': return '';  // base chip with rose override
        default: return '';
    }
};

/**
 * EnricherBadge — Brutal × Aurora reskin
 * Uses fg-booster-chip classes for pill-style display
 */
export const EnricherBadge: React.FC<EnricherBadgeProps> = ({
    providerName,
    status,
    metadata,
}) => {
    const { enrichers } = usePluginRegistry();
    const enricherPlugin = enrichers.find(
        e => e.id === providerName || e.id === providerName.replace(/_/g, '-')
    );
    const icon = enricherPlugin?.icon || '✨';
    const displayName = enricherPlugin?.name || humanizeProviderName(providerName);

    const effectiveStatus = getEffectiveStatus(status, metadata);
    const chipMod = getChipClass(effectiveStatus);

    // Extract key metric from metadata if available
    const metricDisplay = React.useMemo(() => {
        if (!metadata) return null;
        if (metadata.muscles_tracked) return `${metadata.muscles_tracked}m`;
        if (metadata.hr_points_merged) return `${metadata.hr_points_merged}hr`;
        if (metadata.segments_matched) return `${metadata.segments_matched}s`;
        return null;
    }, [metadata]);

    const isError = effectiveStatus === 'ERROR' || effectiveStatus === 'FAILED';

    return (
        <span
            className={`fg-booster-chip fg-booster-chip--sm${chipMod ? ` ${chipMod}` : ''}`}
            style={isError ? { background: 'var(--fg-rose)', color: 'var(--fg-paper)' } : undefined}
        >
            <span className="fg-booster-chip__emoji">{icon}</span>
            {displayName}
            {metricDisplay && effectiveStatus === 'SUCCESS' && (
                <span style={{ opacity: 0.65, marginLeft: '0.125rem' }}>{metricDisplay}</span>
            )}
        </span>
    );
};
