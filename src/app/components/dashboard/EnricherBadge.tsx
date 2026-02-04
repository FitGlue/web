import React from 'react';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import { Badge } from '../library/ui/Badge';
import { Stack } from '../library/layout/Stack';
import { Paragraph } from '../library/ui/Paragraph';

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
 * Enrichers may complete successfully at the execution level but report
 * their own internal status (error, skipped) in metadata.
 */
const getEffectiveStatus = (executionStatus: string, metadata?: Record<string, unknown>): string => {
    let status = executionStatus?.toUpperCase() || 'UNKNOWN';
    
    if (!metadata) return status;
    
    // Find status from metadata - check for any key that is exactly "status" or ends with "_status"
    let metadataStatus: string | null = null;
    for (const [key, val] of Object.entries(metadata)) {
        if ((key === 'status' || key.endsWith('_status')) && typeof val === 'string') {
            metadataStatus = val.toLowerCase();
            break;
        }
    }
    
    // Override execution status with metadata status if more specific
    if (status === 'SUCCESS' && metadataStatus) {
        if (metadataStatus === 'error') {
            status = 'ERROR';
        } else if (metadataStatus === 'skipped') {
            status = 'SKIPPED';
        }
    }
    
    return status;
};

/**
 * Map status to badge variant following GlowCard color scheme:
 * - Success: pink/purple (booster)
 * - Skipped: orange/yellow (booster-skipped)
 * - Error/Failed: red (booster-error)
 */
const getStatusVariant = (status: string): 'booster' | 'booster-skipped' | 'booster-error' | 'default' => {
    switch (status) {
        case 'SUCCESS':
            return 'booster';
        case 'SKIPPED':
            return 'booster-skipped';
        case 'ERROR':
        case 'FAILED':
            return 'booster-error';
        default:
            return 'default';
    }
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
    
    // Get effective status (honors metadata status override)
    const effectiveStatus = getEffectiveStatus(status, metadata);
    const statusVariant = getStatusVariant(effectiveStatus);

    // Extract key metric from metadata if available
    const metricDisplay = React.useMemo(() => {
        if (!metadata) return null;
        if (metadata.muscles_tracked) return `${metadata.muscles_tracked} muscles`;
        if (metadata.hr_points_merged) return `${metadata.hr_points_merged} HR pts`;
        if (metadata.segments_matched) return `${metadata.segments_matched} segments`;
        return null;
    }, [metadata]);

    return (
        <Badge variant={statusVariant}>
            <Stack direction="horizontal" gap="xs" align="center">
                <Paragraph inline>{icon}</Paragraph>
                <Paragraph inline size="sm">{displayName}</Paragraph>
                {metricDisplay && effectiveStatus === 'SUCCESS' && (
                    <Paragraph inline size="sm" muted>{metricDisplay}</Paragraph>
                )}
            </Stack>
        </Badge>
    );
};
