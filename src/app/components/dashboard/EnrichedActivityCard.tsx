import React from 'react';
import { EnricherBadge } from './EnricherBadge';
import { Pill } from '../library/ui/Pill';
import { Stack } from '../library/layout/Stack';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
import { Badge } from '../library/ui/Badge';
import { GlowCard } from '../library/ui/GlowCard';
import { FlowVisualization } from '../library/ui/FlowVisualization';
import { BoosterGrid } from '../library/ui/BoosterGrid';
import { formatActivityType, formatDestination, formatDestinationStatus } from '../../../types/pb/enum-formatters';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import { PluginManifest } from '../../types/plugin';
import { BoosterExecution, PipelineRun, PipelineRunStatus } from '../../../types/pb/user';

interface EnrichedActivityCardProps {
    /** PipelineRun from pipeline_runs collection */
    pipelineRun: PipelineRun;
    onClick?: () => void;
}

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

/**
 * Convert PipelineRun.boosters to ProviderExecution format for display
 */
const mapBoostersToExecutions = (boosters?: BoosterExecution[]): ProviderExecution[] => {
    if (!boosters || boosters.length === 0) return [];
    return boosters.map(b => ({
        ProviderName: b.providerName,
        Status: b.status,
        Metadata: b.metadata as Record<string, unknown>,
    }));
};

const getPlatformInfo = (
    platform: string,
    sources: PluginManifest[],
    destinations: PluginManifest[]
): { name: string; icon: string } => {
    const key = platform.toLowerCase();
    const allPlugins = [...sources, ...destinations];
    const plugin = allPlugins.find(p => p.id === key);
    const name = plugin?.name || formatDestination(platform) || platform;
    const icon = plugin?.icon || '📱';
    return { name, icon };
};

/**
 * Get card variant and status info based on pipeline run status
 * GlowCard variants: 'default' | 'success' | 'premium' | 'awaiting' | 'needs-input'
 * Badge variants: 'default' | 'success' | 'warning' | 'error' | etc.
 */
const getStatusInfo = (status?: PipelineRunStatus): {
    cardVariant: 'default' | 'success' | 'premium' | 'awaiting' | 'needs-input';
    badgeVariant: 'default' | 'success' | 'warning' | 'error';
    statusLabel?: string;
    statusIcon?: string;
} => {
    switch (status) {
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED:
            return { cardVariant: 'success', badgeVariant: 'success', statusLabel: 'Synced', statusIcon: '✅' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL:
            return { cardVariant: 'awaiting', badgeVariant: 'warning', statusLabel: 'Partial', statusIcon: '⚠️' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED:
            return { cardVariant: 'default', badgeVariant: 'error', statusLabel: 'Failed', statusIcon: '❌' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING:
            return { cardVariant: 'awaiting', badgeVariant: 'default', statusLabel: 'Running', statusIcon: '🔄' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING:
            return { cardVariant: 'needs-input', badgeVariant: 'warning', statusLabel: 'Awaiting Input', statusIcon: '⏳' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED:
            return { cardVariant: 'default', badgeVariant: 'default', statusLabel: 'Skipped', statusIcon: '⏭️' };
        default:
            return { cardVariant: 'default', badgeVariant: 'default' };
    }
};

/**
 * EnrichedActivityCard - Premium card showing the boost flow
 * Uses GlowCard with gradient header and FlowVisualization for the pipeline display
 *
 * Displays PipelineRun data from the pipeline_runs collection.
 */
export const EnrichedActivityCard: React.FC<EnrichedActivityCardProps> = ({
    pipelineRun,
    onClick,
}) => {
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();

    // Get booster executions from pipeline run
    const providerExecutions = mapBoostersToExecutions(pipelineRun.boosters);

    // Get destination statuses from pipeline run
    const destinationStatuses: Record<string, string> = pipelineRun.destinations
        ? pipelineRun.destinations.reduce((acc, d) => {
            const destName = formatDestination(d.destination) || 'unknown';
            acc[destName.toLowerCase()] = formatDestinationStatus(d.status) || 'UNKNOWN';
            return acc;
        }, {} as Record<string, string>)
        : {};

    // Get display values from pipelineRun
    const activityTitle = pipelineRun.title || 'Untitled Activity';
    const activityType = formatActivityType(pipelineRun.type);

    const syncDate = pipelineRun.createdAt
        ? new Date(pipelineRun.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
        : null;

    const sourceInfo = getPlatformInfo(pipelineRun.source || 'unknown', sources, registryDestinations);
    const destinations = pipelineRun.destinations?.map(d => formatDestination(d.destination)?.toLowerCase() || 'unknown') || [];

    const pipelineName = pipelineRun.pipelineId
        ? pipelines.find((p: { id: string }) => p.id === pipelineRun.pipelineId)?.name
        : undefined;

    // Determine card variant and status display based on pipeline run status
    const statusInfo = getStatusInfo(pipelineRun.status);

    // Header content - activity type, title, pipeline, date, status
    const headerContent = (
        <Stack direction="horizontal" align="center" justify="between">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
                <Pill variant="gradient" size="small">{activityType}</Pill>
                <Heading level={4}>{activityTitle}</Heading>
                {pipelineName && (
                    <Paragraph muted size="sm">via {pipelineName}</Paragraph>
                )}
            </Stack>
            <Stack direction="horizontal" gap="sm" align="center">
                {statusInfo.statusLabel && (
                    <Badge variant={statusInfo.badgeVariant} size="sm">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline size="sm">{statusInfo.statusIcon}</Paragraph>
                            <Paragraph inline size="sm">{statusInfo.statusLabel}</Paragraph>
                        </Stack>
                    </Badge>
                )}
                {syncDate && <Paragraph muted size="sm">{syncDate}</Paragraph>}
            </Stack>
        </Stack>
    );

    // Source node for flow
    const sourceNode = (
        <Badge variant="source" size="sm">
            <Stack direction="horizontal" gap="xs" align="center">
                <Paragraph inline>{sourceInfo.icon}</Paragraph>
                <Paragraph inline size="sm">{sourceInfo.name}</Paragraph>
            </Stack>
        </Badge>
    );

    // Destination node for flow
    const destinationNode = destinations.length > 0 ? (
        <Stack direction="horizontal" gap="xs">
            {destinations.map(dest => {
                const status = destinationStatuses[dest];
                const isFailed = status === 'FAILED';
                const destInfo = getPlatformInfo(dest, sources, registryDestinations);
                return (
                    <Badge
                        key={dest}
                        variant={isFailed ? 'error' : 'destination'}
                        size="sm"
                    >
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline>{destInfo.icon}</Paragraph>
                            <Paragraph inline size="sm">{destInfo.name}</Paragraph>
                        </Stack>
                    </Badge>
                );
            })}
        </Stack>
    ) : (
        <Badge variant="default" size="sm">
            <Stack direction="horizontal" gap="xs" align="center">
                <Paragraph inline>🚀</Paragraph>
                <Paragraph inline size="sm">Pending</Paragraph>
            </Stack>
        </Badge>
    );

    // Center boosters
    const boostersNode = (
        <BoosterGrid emptyText="No boosters">
            {providerExecutions.map((exec, idx) => (
                <EnricherBadge
                    key={idx}
                    providerName={exec.ProviderName}
                    status={exec.Status}
                    metadata={exec.Metadata}
                />
            ))}
        </BoosterGrid>
    );

    return (
        <GlowCard
            onClick={onClick}
            variant={statusInfo.cardVariant}
            header={headerContent}
        >
                {/* Flow Visualization: Source → Boosters → Destination */}
                <FlowVisualization
                    source={sourceNode}
                    center={boostersNode}
                    destination={destinationNode}
                />
                {/* Status message for success/failure context */}
                {pipelineRun?.statusMessage && (
                    <Stack gap="xs">
                        <Paragraph muted size="sm">
                            ℹ️ {pipelineRun.statusMessage}
                        </Paragraph>
                    </Stack>
                )}
        </GlowCard>
    );
};
