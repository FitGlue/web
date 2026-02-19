import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EnricherBadge } from './EnricherBadge';
import { Pill } from '../library/ui/Pill';
import { Stack } from '../library/layout/Stack';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
import { Badge } from '../library/ui/Badge';
import { GlowCard } from '../library/ui/GlowCard';
import { FlowVisualization } from '../library/ui/FlowVisualization';
import { BoosterGrid } from '../library/ui/BoosterGrid';
import { formatActivityType, formatActivitySource, formatDestination, formatDestinationStatus } from '../../../types/pb/enum-formatters';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import { PluginManifest } from '../../types/plugin';
import { BoosterExecution, PipelineRun, PipelineRunStatus } from '../../../types/pb/user';
import { Button } from '../library/ui/Button';

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

const getSourceInfo = (
    source: string,
    sources: PluginManifest[]
): { name: string; icon: string } => {
    // Try to match plugin by source enum (e.g., SOURCE_HEVY -> hevy)
    const key = source.replace(/^SOURCE_/, '').toLowerCase();
    const plugin = sources.find(p => p.id === key);
    const name = plugin?.name || formatActivitySource(source) || source;
    const icon = plugin?.icon || '📱';
    return { name, icon };
};

const getDestinationInfo = (
    destinationKey: string,
    destinations: PluginManifest[],
    formattedName?: string
): { name: string; icon: string } => {
    const key = destinationKey.toLowerCase();
    const plugin = destinations.find(p => p.id === key);
    // Use plugin name, or the pre-formatted name if provided, or try to format, or fallback
    const name = plugin?.name || formattedName || formatDestination(destinationKey) || destinationKey;
    const icon = plugin?.icon || '🚀';
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
    isTierBlocked?: boolean;
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
            return { cardVariant: 'premium', badgeVariant: 'default', statusLabel: 'Skipped', statusIcon: '⏭️' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_TIER_BLOCKED:
            return { cardVariant: 'needs-input', badgeVariant: 'warning', statusLabel: 'Upgrade Required', statusIcon: '🔒', isTierBlocked: true };
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
    const navigate = useNavigate();
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();

    // Get booster executions from pipeline run
    const providerExecutions = mapBoostersToExecutions(pipelineRun.boosters);

    // Get destination statuses from pipeline run (keyed by formatted name)
    const destinationStatuses: Record<string, string> = pipelineRun.destinations
        ? pipelineRun.destinations.reduce((acc, d) => {
            const destName = formatDestination(d.destination) || 'Unknown';
            acc[destName] = formatDestinationStatus(d.status) || 'Unknown';
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

    const sourceInfo = getSourceInfo(pipelineRun.source || 'unknown', sources);
    // Keep proper-cased destination names for display and lookup
    const destinations = pipelineRun.destinations?.map(d => formatDestination(d.destination) || 'Unknown') || [];

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

    // Destination node for flow - group by status for visual distinction
    // Note: formatDestinationStatus returns Title case ('Success', 'Pending', 'Failed')
    const successDestinations = destinations.filter(dest => destinationStatuses[dest] === 'Success');
    const pendingDestinations = destinations.filter(dest =>
        destinationStatuses[dest] === 'Pending' || !destinationStatuses[dest]
    );
    const failedDestinations = destinations.filter(dest => destinationStatuses[dest] === 'Failed');
    const skippedDestinations = destinations.filter(dest => destinationStatuses[dest] === 'Skipped');

    const destinationNode = destinations.length > 0 ? (
        <Stack direction="horizontal" gap="xs" wrap>
            {/* SUCCESS destinations - normal destination styling */}
            {successDestinations.map(dest => {
                const destInfo = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                return (
                    <Badge key={dest} variant="destination" size="sm">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline>{destInfo.icon}</Paragraph>
                            <Paragraph inline size="sm">{destInfo.name}</Paragraph>
                        </Stack>
                    </Badge>
                );
            })}
            {/* PENDING destinations - muted/greyed styling */}
            {pendingDestinations.map(dest => {
                const destInfo = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                return (
                    <Paragraph key={dest} inline style={{ opacity: 0.5 }}>
                        <Badge variant="default" size="sm">
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph inline>⏳</Paragraph>
                                <Paragraph inline size="sm">{destInfo.name}</Paragraph>
                            </Stack>
                        </Badge>
                    </Paragraph>
                );
            })}
            {/* FAILED destinations - error styling */}
            {failedDestinations.map(dest => {
                const destInfo = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                return (
                    <Badge key={dest} variant="error" size="sm">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline>❌</Paragraph>
                            <Paragraph inline size="sm">{destInfo.name}</Paragraph>
                        </Stack>
                    </Badge>
                );
            })}
            {/* SKIPPED destinations - warning styling */}
            {skippedDestinations.map(dest => {
                const destInfo = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                return (
                    <Badge key={dest} variant="warning" size="sm">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline>⏭️</Paragraph>
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
            {/* Tier blocked upgrade CTA */}
            {statusInfo.isTierBlocked && (
                <Stack gap="sm" align="center">
                    <Paragraph muted size="sm">
                        🔒 {pipelineRun.statusMessage || 'Monthly sync limit reached.'}
                    </Paragraph>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate('/settings/subscription'); }}
                    >
                        Upgrade for Unlimited Syncs →
                    </Button>
                </Stack>
            )}
            {/* Status message - only show for non-terminal states or failures */}
            {!statusInfo.isTierBlocked && pipelineRun?.statusMessage &&
                pipelineRun.status !== PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED && (
                    <Stack gap="xs">
                        <Paragraph muted size="sm">
                            ℹ️ {pipelineRun.statusMessage}
                        </Paragraph>
                    </Stack>
                )}
        </GlowCard>
    );
};
