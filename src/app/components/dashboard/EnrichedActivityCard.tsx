import React from 'react';
import { SynchronizedActivity, ExecutionRecord } from '../../services/ActivitiesService';
import { EnricherBadge } from './EnricherBadge';
import { Pill } from '../library/ui/Pill';
import { Stack } from '../library/layout/Stack';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
import { Badge } from '../library/ui/Badge';
import { GlowCard } from '../library/ui/GlowCard';
import { FlowVisualization } from '../library/ui/FlowVisualization';
import { BoosterGrid } from '../library/ui/BoosterGrid';
import { formatActivityType, formatDestination, formatActivitySource, formatDestinationStatus } from '../../../types/pb/enum-formatters';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { useLazyActivityTrace } from '../../hooks/useActivityTrace';
import { usePipelineRunLookup } from '../../hooks/usePipelineRuns';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import { PluginManifest } from '../../types/plugin';
import { BoosterExecution } from '../../../types/pb/user';

interface EnrichedActivityCardProps {
    activity: SynchronizedActivity;
    onClick?: () => void;
}

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

const extractEnricherExecutions = (pipelineExecution?: ExecutionRecord[]): ProviderExecution[] => {
    if (!pipelineExecution) return [];
    const enricherRecord = pipelineExecution.find(record => record.service === 'enricher');
    if (!enricherRecord?.outputsJson) return [];
    try {
        const outputs = JSON.parse(enricherRecord.outputsJson);
        return Array.isArray(outputs.provider_executions) ? outputs.provider_executions : [];
    } catch {
        return [];
    }
};

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

const getEnrichedTitle = (pipelineExecution?: ExecutionRecord[]): string | null => {
    if (!pipelineExecution) return null;
    for (const service of ['router', 'strava-uploader']) {
        const record = pipelineExecution.find(r => r.service === service);
        if (record?.outputsJson) {
            try {
                const outputs = JSON.parse(record.outputsJson);
                if (outputs.activity_name) return outputs.activity_name;
                if (outputs.name) return outputs.name;
            } catch {
                continue;
            }
        }
    }
    return null;
};

const getDestinationActivityType = (pipelineExecution?: ExecutionRecord[]): string | null => {
    if (!pipelineExecution) return null;
    const services = ['strava-uploader', 'router'];
    for (const service of services) {
        const record = pipelineExecution.find(r => r.service === service);
        if (record?.outputsJson) {
            try {
                const outputs = JSON.parse(record.outputsJson);
                if (outputs.activity_type) return String(outputs.activity_type);
            } catch {
                continue;
            }
        }
    }
    return null;
};

const extractDestinationStatuses = (pipelineExecution?: ExecutionRecord[]): Record<string, string> => {
    if (!pipelineExecution) return {};
    const statuses: Record<string, string> = {};
    for (const record of pipelineExecution) {
        if (record.service?.endsWith('-uploader')) {
            const destinationId = record.service.replace('-uploader', '');
            statuses[destinationId] = record.status?.toUpperCase() || 'UNKNOWN';
        }
    }
    return statuses;
};

const getPlatformInfo = (
    platform: string,
    sources: PluginManifest[],
    destinations: PluginManifest[]
): { name: string; icon: string } => {
    const key = platform.toLowerCase();
    const allPlugins = [...sources, ...destinations];
    const plugin = allPlugins.find(p => p.id === key);
    const name = plugin?.name || formatActivitySource(platform) || formatDestination(platform);
    const icon = plugin?.icon || '📱';
    return { name, icon };
};

/**
 * EnrichedActivityCard - Premium card showing the boost flow
 * Uses GlowCard with gradient header and FlowVisualization for the pipeline display
 * Lazy loads execution traces when card enters viewport
 */
export const EnrichedActivityCard: React.FC<EnrichedActivityCardProps> = ({
    activity,
    onClick,
}) => {
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();
    const { ref, hasTrace, loading: traceLoading, pipelineExecution } = useLazyActivityTrace(activity.activityId);

    // Try to get booster data from PipelineRun first (new architecture)
    const pipelineRun = usePipelineRunLookup(activity.pipelineExecutionId);

    // Use trace from lazy loading hook (which updates global state and returns latest)
    // Falls back to activity.pipelineExecution if already present
    const trace = pipelineExecution || activity.pipelineExecution;

    // Use PipelineRun boosters if available, fallback to lazy-loaded trace
    const providerExecutions = pipelineRun?.boosters && pipelineRun.boosters.length > 0
        ? mapBoostersToExecutions(pipelineRun.boosters)
        : extractEnricherExecutions(trace);

    const enrichedTitle = getEnrichedTitle(trace);
    const destinationActivityType = getDestinationActivityType(trace);

    // Use PipelineRun destination statuses if available, fallback to trace
    const destinationStatuses: Record<string, string> = pipelineRun?.destinations
        ? pipelineRun.destinations.reduce((acc, d) => {
            const destName = formatDestination(d.destination) || 'unknown';
            acc[destName.toLowerCase()] = formatDestinationStatus(d.status) || 'UNKNOWN';
            return acc;
        }, {} as Record<string, string>)
        : extractDestinationStatuses(trace);

    const activityTitle = enrichedTitle || activity.title || 'Untitled Activity';
    const titleWasEnhanced = enrichedTitle && enrichedTitle !== activity.title;

    const activityType = destinationActivityType
        ? formatActivityType(destinationActivityType)
        : formatActivityType(activity.type);
    const syncDate = activity.syncedAt
        ? new Date(activity.syncedAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
        : null;

    const sourceInfo = getPlatformInfo(activity.source || 'unknown', sources, registryDestinations);
    const destinations = activity.destinations ? Object.keys(activity.destinations) : [];

    const pipelineName = activity.pipelineId
        ? pipelines.find((p: { id: string }) => p.id === activity.pipelineId)?.name
        : undefined;

    const isPartiallyLoaded = !hasTrace && (traceLoading || activity.pipelineExecutionId);

    // Determine card variant based on state
    const cardVariant = isPartiallyLoaded ? 'default' : 'success';


    // Header content - activity type, title, pipeline, date
    const headerContent = (
        <Stack direction="horizontal" align="center" justify="between">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
                <Pill variant="gradient" size="small">{activityType}</Pill>
                <Heading level={4}>
                    {activityTitle}
                    {titleWasEnhanced && <Paragraph inline> ✨</Paragraph>}
                </Heading>
                {pipelineName && (
                    <Paragraph muted size="sm">via {pipelineName}</Paragraph>
                )}
            </Stack>
            {syncDate && <Paragraph muted size="sm">{syncDate}</Paragraph>}
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
        <BoosterGrid loading={!!isPartiallyLoaded} emptyText="No boosters">
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
        <div ref={ref}>
            <GlowCard
                onClick={onClick}
                variant={cardVariant}
                loading={!!isPartiallyLoaded}
                header={headerContent}
            >
                {/* Flow Visualization: Source → Boosters → Destination */}
                <FlowVisualization
                    source={sourceNode}
                    center={boostersNode}
                    destination={destinationNode}
                />
            </GlowCard>
        </div>
    );
};
