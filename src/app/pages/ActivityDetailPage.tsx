import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, CardSkeleton, Pill, Heading, Paragraph, Code, Badge, GlowCard, Button, SvgAsset, useToast, IdBadge, ProgressBar, ExpandableCard, DestinationBadge } from '../components/library/ui';
import { FlowVisualization } from '../components/library/ui/FlowVisualization';
import { BoosterGrid } from '../components/library/ui/BoosterGrid';
import '../components/library/ui/CardSkeleton.css';
import { EnricherBadge } from '../components/dashboard/EnricherBadge';
import { RepostActionsMenu } from '../components/RepostActionsMenu';
import { useApi } from '../hooks/useApi';
import { useNerdMode } from '../state/NerdModeContext';
import { formatActivityType, formatDestination, formatDestinationStatus } from '../../types/pb/enum-formatters';
import { buildDestinationUrl } from '../utils/destinationUrls';
import { PluginManifest } from '../types/plugin';
import { Link } from '../components/library/navigation';
import { BoosterExecution, PipelineRun, PipelineRunStatus } from '../../types/pb/user';
import { SynchronizedActivity } from '../services/ActivitiesService';

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

const deriveOriginalSource = (pipelineRun: PipelineRun): string => {
    // Use the source field directly from PipelineRun
    if (pipelineRun.source) {
        return pipelineRun.source
            .replace(/^SOURCE_/, '')
            .replace(/_/g, ' ')
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    return 'Unknown';
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

/**
 * Determine effective status by checking metadata for status override.
 * Enrichers may complete successfully at the execution level but report
 * their own internal status (error, skipped) in metadata.
 */
const getEffectiveStatus = (execution: ProviderExecution): string => {
    let status = execution.Status?.toUpperCase() || 'UNKNOWN';

    if (!execution.Metadata) return status;

    // Find status from metadata - check for any key that is exactly "status" or ends with "_status"
    let metadataStatus: string | null = null;
    for (const [key, val] of Object.entries(execution.Metadata)) {
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
 * Map effective status to GlowCard variant following the color scheme:
 * - Success: pink/purple ('success')
 * - Skipped: orange/yellow ('premium')
 * - Error/Failed: red/orange ('default')
 */
const getBoosterCardVariant = (status: string): 'default' | 'success' | 'premium' | 'awaiting' => {
    switch (status) {
        case 'SUCCESS':
            return 'success';
        case 'SKIPPED':
            return 'premium';
        case 'ERROR':
        case 'FAILED':
            return 'default';
        default:
            return 'awaiting';
    }
};

interface GeneratedAsset {
    type: string;
    url: string;
    providerName: string;
}

const extractGeneratedAssets = (providerExecutions: ProviderExecution[]): GeneratedAsset[] => {
    const assets: GeneratedAsset[] = [];

    for (const execution of providerExecutions) {
        // Use effective status to honor metadata status override
        if (getEffectiveStatus(execution) !== 'SUCCESS' || !execution.Metadata) {
            continue;
        }

        for (const [key, value] of Object.entries(execution.Metadata)) {
            if (key.startsWith('asset_') && typeof value === 'string' && value.startsWith('http')) {
                const assetType = key.replace('asset_', '');
                assets.push({
                    type: assetType,
                    url: value,
                    providerName: execution.ProviderName || 'Unknown',
                });
            }
        }
    }

    return assets;
};

const formatAssetType = (type: string): string => {
    const typeMap: Record<string, string> = {
        'ai_banner': 'AI Banner',
        'muscle_heatmap': 'Muscle Heatmap',
        'route_thumbnail': 'Route Map',
    };
    return typeMap[type] || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// SvgAsset is now imported from '../components/library/ui'

// Remove unused getDestinationActivityType - we now get type directly from PipelineRun

const formatPlatformName = (
    platform: string,
    sources: PluginManifest[],
    destinations: PluginManifest[]
): { name: string; icon: string; iconType?: string; iconPath?: string } => {
    const key = platform.toLowerCase();

    const allPlugins = [...sources, ...destinations];
    const plugin = allPlugins.find(p => p.id === key);

    const name = plugin?.name || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
    const icon = plugin?.icon || '📱';

    return { name, icon, iconType: plugin?.iconType, iconPath: plugin?.iconPath };
};

const formatDateTime = (dateStr?: string | Date): string => {
    if (!dateStr) return 'Unknown';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const formatMetadataKey = (key: string): string => {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
};

const formatMetadataValue = (value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
};

/**
 * Get card variant and status info based on pipeline run status
 * Mirrors the logic from EnrichedActivityCard for consistency
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
            return { cardVariant: 'premium', badgeVariant: 'default', statusLabel: 'Skipped', statusIcon: '⏭️' };
        default:
            return { cardVariant: 'default', badgeVariant: 'default' };
    }
};

const ActivityDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations, enrichers } = usePluginRegistry();
    const { isNerdMode } = useNerdMode();
    const api = useApi();
    const toast = useToast();

    // Per-run export state
    const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

    // Get pipeline runs - this is now the PRIMARY data source
    const { pipelineRuns, loading } = useRealtimePipelineRuns(true, 50);

    // Find the pipeline run for this activity by activityId
    const pipelineRun = useMemo((): PipelineRun | undefined => {
        return pipelineRuns.find(run => run.activityId === id);
    }, [pipelineRuns, id]);

    // Memoized data extraction from PipelineRun
    const {
        sourceInfo,
        destinations,
        providerExecutions,
        activityType,
        generatedAssets,
        pipelineName,
    } = useMemo(() => {
        if (!pipelineRun) {
            return {
                sourceInfo: { name: '', icon: '' },
                destinations: [],
                providerExecutions: [],
                activityType: '',
                generatedAssets: [],
                pipelineName: undefined,
            };
        }

        const originalSource = deriveOriginalSource(pipelineRun);
        const sourceInfo = formatPlatformName(originalSource, sources, registryDestinations);

        // Build destinations from pipeline run destination outcomes (show all, with status)
        const destinations: { name: string; externalId: string; status: string }[] = (pipelineRun.destinations || [])
            .map(d => ({
                name: formatDestination(d.destination) || 'Unknown',
                externalId: d.externalId || '',
                status: formatDestinationStatus(d.status) || 'Unknown'
            }));

        // Use pipeline run boosters for enrichment data
        const providerExecutions = mapBoostersToExecutions(pipelineRun.boosters);

        const activityType = formatActivityType(pipelineRun.type);
        const generatedAssets = extractGeneratedAssets(providerExecutions);
        const pipelineName = pipelineRun.pipelineId
            ? pipelines.find(p => p.id === pipelineRun.pipelineId)?.name
            : undefined;

        return {
            sourceInfo,
            destinations,
            providerExecutions,
            activityType,
            generatedAssets,
            pipelineName,
        };
    }, [pipelineRun, sources, registryDestinations, pipelines]);

    if (loading && !pipelineRun) {
        return (
            <PageLayout title="Loading..." backTo="/activities" backLabel="Activities">
                <CardSkeleton variant="activity-detail" />
            </PageLayout>
        );
    }

    if (!pipelineRun) {
        return (
            <PageLayout title="Not Found" backTo="/activities" backLabel="Activities">
                <Stack align="center" gap="md">
                    <Paragraph inline>🔍</Paragraph>
                    <Heading level={3}>Activity not found</Heading>
                    <Paragraph muted>This activity may have been deleted or doesn&apos;t exist.</Paragraph>
                </Stack>
            </PageLayout>
        );
    }

    // Build flow visualization nodes
    const sourceNode = (
        <Badge variant="source" size="sm">
            <Stack direction="horizontal" gap="xs" align="center">
                <Paragraph inline>{sourceInfo.icon}</Paragraph>
                <Paragraph inline size="sm">{sourceInfo.name}</Paragraph>
            </Stack>
        </Badge>
    );

    const boostersNode = (
        <BoosterGrid emptyText="No boosters applied">
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

    // Separate destinations by status for visual distinction
    const successDestinations = destinations.filter(d => d.status === 'Success');
    const pendingDestinations = destinations.filter(d => d.status === 'Pending' || d.status === 'Unknown');
    const failedDestinations = destinations.filter(d => d.status === 'Failed');
    const skippedDestinations = destinations.filter(d => d.status === 'Skipped');

    // Calculate sync credits used (1 credit per successful destination)
    const creditsUsed = successDestinations.length;

    const destinationNode = destinations.length > 0 ? (
        <Stack direction="horizontal" gap="xs">
            {/* SUCCESS destinations */}
            {successDestinations.map(dest => {
                const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                return (
                    <Badge key={dest.name} variant="destination" size="sm">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline>{destInfo.icon}</Paragraph>
                            <Paragraph inline size="sm">{destInfo.name}</Paragraph>
                        </Stack>
                    </Badge>
                );
            })}
            {/* PENDING destinations - muted styling */}
            {pendingDestinations.map(dest => {
                const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                return (
                    <Paragraph key={dest.name} inline style={{ opacity: 0.5 }}>
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
                const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                return (
                    <Badge key={dest.name} variant="error" size="sm">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline>❌</Paragraph>
                            <Paragraph inline size="sm">{destInfo.name}</Paragraph>
                        </Stack>
                    </Badge>
                );
            })}
            {/* SKIPPED destinations - warning styling */}
            {skippedDestinations.map(dest => {
                const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                return (
                    <Badge key={dest.name} variant="warning" size="sm">
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
                <Paragraph inline>⏳</Paragraph>
                <Paragraph inline size="sm">Pending</Paragraph>
            </Stack>
        </Badge>
    );

    // Get status info for card variant and badge display
    const statusInfo = getStatusInfo(pipelineRun.status);

    // Header content for GlowCard
    const heroHeader = (
        <Stack direction="horizontal" align="center" justify="between">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
                <Pill variant="gradient" size="small">{activityType}</Pill>
                <Heading level={3}>{pipelineRun.title || 'Untitled Activity'}</Heading>
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
                {creditsUsed > 0 && (
                    <Badge variant="default" size="sm">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline size="sm">🎫</Paragraph>
                            <Paragraph inline size="sm">{creditsUsed} credit{creditsUsed !== 1 ? 's' : ''}</Paragraph>
                        </Stack>
                    </Badge>
                )}
                {pipelineName && (
                    <Paragraph muted size="sm">via {pipelineName}</Paragraph>
                )}
                <Paragraph muted size="sm">{formatDateTime(pipelineRun.startTime)}</Paragraph>
            </Stack>
        </Stack>
    );

    return (
        <PageLayout
            backTo="/activities"
            backLabel="Activities"
        >
            <Stack gap="lg">
                {/* Hero Card with Flow Visualization */}
                <GlowCard variant={statusInfo.cardVariant} header={heroHeader}>
                    <Stack gap="md">
                        {/* Description */}
                        {pipelineRun.description && (
                            <Paragraph style={{ whiteSpace: 'pre-line' }}>{pipelineRun.description}</Paragraph>
                        )}

                        {/* Flow Visualization */}
                        <FlowVisualization
                            source={sourceNode}
                            center={boostersNode}
                            destination={destinationNode}
                        />
                    </Stack>
                </GlowCard>

                {/* Nerd Mode: Status Message */}
                {isNerdMode && pipelineRun.statusMessage && (
                    <Card>
                        <Stack gap="xs">
                            <Heading level={4}>
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline>💬</Paragraph>
                                    Status Message
                                </Stack>
                            </Heading>
                            <Code>{pipelineRun.statusMessage}</Code>
                        </Stack>
                    </Card>
                )}

                {/* Nerd Mode: Raw IDs & URIs */}
                {isNerdMode && (
                    <Card>
                        <Stack gap="md">
                            <Heading level={4}>
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline>🔑</Paragraph>
                                    Identifiers & References
                                </Stack>
                            </Heading>
                            <Stack gap="sm">
                                <Stack direction="horizontal" gap="sm" align="center" wrap>
                                    <Paragraph size="sm" muted>Activity ID</Paragraph>
                                    <IdBadge id={pipelineRun.activityId} showChars={12} copyable />
                                </Stack>
                                <Stack direction="horizontal" gap="sm" align="center" wrap>
                                    <Paragraph size="sm" muted>Execution ID</Paragraph>
                                    <IdBadge id={pipelineRun.id} showChars={12} copyable />
                                </Stack>
                                <Stack direction="horizontal" gap="sm" align="center" wrap>
                                    <Paragraph size="sm" muted>Pipeline ID</Paragraph>
                                    <IdBadge id={pipelineRun.pipelineId} stripPrefix="pipe_" showChars={8} copyable />
                                </Stack>
                                {pipelineRun.sourceActivityId && (
                                    <Stack direction="horizontal" gap="sm" align="center" wrap>
                                        <Paragraph size="sm" muted>Source Activity ID</Paragraph>
                                        <IdBadge id={pipelineRun.sourceActivityId} showChars={12} copyable />
                                    </Stack>
                                )}
                                {pipelineRun.originalPayloadUri && (
                                    <Stack direction="horizontal" gap="sm" align="center" wrap>
                                        <Paragraph size="sm" muted>Payload URI</Paragraph>
                                        <Code>{pipelineRun.originalPayloadUri}</Code>
                                    </Stack>
                                )}
                                {pipelineRun.enrichedEventUri && (
                                    <Stack direction="horizontal" gap="sm" align="center" wrap>
                                        <Paragraph size="sm" muted>Enriched URI</Paragraph>
                                        <Code>{pipelineRun.enrichedEventUri}</Code>
                                    </Stack>
                                )}
                            </Stack>
                        </Stack>
                    </Card>
                )}

                {/* Destinations - First-class section */}
                {destinations.length > 0 && (
                    <Stack gap="md">
                        {/* Synced Destinations - Compact badges */}
                        {successDestinations.length > 0 && (
                            <Stack gap="sm">
                                <Stack direction="horizontal" gap="md" style={{ flexWrap: 'wrap' }}>
                                    {successDestinations.map(dest => {
                                        const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                                        const pipeline = pipelineRun.pipelineId ? pipelines.find(p => p.id === pipelineRun.pipelineId) : undefined;
                                        const destConfig = pipeline?.destinationConfigs?.[dest.name.toLowerCase()]?.config;
                                        const externalUrl = buildDestinationUrl(registryDestinations, dest.name.toLowerCase(), dest.externalId, destConfig);

                                        return (
                                            <DestinationBadge
                                                key={dest.name}
                                                name={destInfo.name}
                                                icon={destInfo.icon}
                                                iconType={destInfo.iconType}
                                                iconPath={destInfo.iconPath}
                                                onClick={externalUrl ? () => window.open(externalUrl, '_blank') : undefined}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Stack>
                        )}

                        {/* Not Synced Destinations */}
                        {pendingDestinations.length > 0 && (
                            <Stack gap="sm">
                                <Heading level={5}>
                                    <Stack direction="horizontal" gap="xs" align="center">
                                        <Paragraph inline>⏳</Paragraph>
                                        Not Synced
                                    </Stack>
                                </Heading>
                                <Paragraph size="sm" muted>
                                    These destinations were configured but the pipeline did not complete successfully.
                                </Paragraph>
                                <Grid cols={2} gap="md">
                                    {pendingDestinations.map(dest => {
                                        const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);

                                        const cardHeader = (
                                            <Stack direction="horizontal" align="center" gap="sm">
                                                <Paragraph inline style={{ fontSize: '1.5rem', opacity: 0.6 }}>{destInfo.icon}</Paragraph>
                                                <Heading level={4}>{destInfo.name}</Heading>
                                            </Stack>
                                        );

                                        return (
                                            <GlowCard key={dest.name} variant="awaiting" header={cardHeader}>
                                                <Paragraph size="sm" muted>
                                                    ⏳ Pending - not synced
                                                </Paragraph>
                                            </GlowCard>
                                        );
                                    })}
                                </Grid>
                            </Stack>
                        )}

                        {/* Failed Destinations */}
                        {failedDestinations.length > 0 && (
                            <Stack gap="sm">
                                <Heading level={5}>
                                    <Stack direction="horizontal" gap="xs" align="center">
                                        <Paragraph inline>❌</Paragraph>
                                        Failed
                                    </Stack>
                                </Heading>
                                <Grid cols={2} gap="md">
                                    {failedDestinations.map(dest => {
                                        const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                                        const destOutcome = pipelineRun.destinations?.find(
                                            d => formatDestination(d.destination) === dest.name
                                        );

                                        const cardHeader = (
                                            <Stack direction="horizontal" align="center" gap="sm">
                                                <Paragraph inline style={{ fontSize: '1.5rem' }}>{destInfo.icon}</Paragraph>
                                                <Heading level={4}>{destInfo.name}</Heading>
                                            </Stack>
                                        );

                                        return (
                                            <GlowCard key={dest.name} variant="default" header={cardHeader}>
                                                <Stack gap="xs">
                                                    <Paragraph size="sm" muted>
                                                        ❌ Sync failed
                                                    </Paragraph>
                                                    {destOutcome?.error && (
                                                        <Code>{destOutcome.error}</Code>
                                                    )}
                                                </Stack>
                                            </GlowCard>
                                        );
                                    })}
                                </Grid>
                            </Stack>
                        )}

                        {/* Skipped Destinations */}
                        {skippedDestinations.length > 0 && (
                            <Stack gap="sm">
                                <Heading level={5}>
                                    <Stack direction="horizontal" gap="xs" align="center">
                                        <Paragraph inline>⏭️</Paragraph>
                                        Skipped
                                    </Stack>
                                </Heading>
                                <Grid cols={2} gap="md">
                                    {skippedDestinations.map(dest => {
                                        const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                                        const destOutcome = pipelineRun.destinations?.find(
                                            d => formatDestination(d.destination) === dest.name
                                        );

                                        const cardHeader = (
                                            <Stack direction="horizontal" align="center" gap="sm">
                                                <Paragraph inline style={{ fontSize: '1.5rem' }}>{destInfo.icon}</Paragraph>
                                                <Heading level={4}>{destInfo.name}</Heading>
                                            </Stack>
                                        );

                                        return (
                                            <GlowCard key={dest.name} variant="premium" header={cardHeader}>
                                                <Stack gap="xs">
                                                    <Paragraph size="sm" muted>
                                                        ⏭️ Skipped
                                                    </Paragraph>
                                                    {destOutcome?.error && (
                                                        <Code>{destOutcome.error}</Code>
                                                    )}
                                                </Stack>
                                            </GlowCard>
                                        );
                                    })}
                                </Grid>
                            </Stack>
                        )}
                    </Stack>
                )}

                {/* Booster Details - Accordion */}
                {providerExecutions.length > 0 && (
                    <ExpandableCard
                        header={
                            <Stack direction="horizontal" gap="sm" align="center">
                                <Paragraph inline>✨</Paragraph>
                                <Heading level={4}>Boosters Applied</Heading>
                                <Badge variant="default" size="sm">{providerExecutions.length}</Badge>
                            </Stack>
                        }
                    >
                        <Grid cols={2} gap="md">
                            {providerExecutions.map((enricher, idx) => {
                                const effectiveStatus = getEffectiveStatus(enricher);
                                const cardVariant = getBoosterCardVariant(effectiveStatus);
                                const enricherPlugin = enrichers.find(
                                    e => e.id === enricher.ProviderName || e.id === enricher.ProviderName?.replace(/_/g, '-')
                                );
                                const icon = enricherPlugin?.icon || '✨';
                                const displayName = enricherPlugin?.name || enricher.ProviderName
                                    ?.replace(/[_-]/g, ' ')
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ') || 'Unknown';

                                return (
                                    <GlowCard
                                        key={idx}
                                        variant={cardVariant}
                                        header={
                                            <Stack direction="horizontal" gap="xs" align="center">
                                                <Paragraph inline>{icon}</Paragraph>
                                                <Paragraph inline>{displayName}</Paragraph>
                                            </Stack>
                                        }
                                    >
                                        {enricher.Metadata && Object.keys(enricher.Metadata).length > 0 ? (
                                            <Stack gap="xs">
                                                {Object.entries(enricher.Metadata)
                                                    .filter(([key]) => !key.startsWith('asset_'))
                                                    .slice(0, isNerdMode ? undefined : 6)
                                                    .map(([key, value]) => (
                                                        <Stack key={key} direction="horizontal" justify="between">
                                                            <Paragraph size="sm" muted>{formatMetadataKey(key)}</Paragraph>
                                                            <Paragraph size="sm">{formatMetadataValue(value)}</Paragraph>
                                                        </Stack>
                                                    ))}
                                            </Stack>
                                        ) : (
                                            <Paragraph size="sm" muted>No metadata</Paragraph>
                                        )}
                                    </GlowCard>
                                );
                            })}
                        </Grid>
                    </ExpandableCard>
                )}

                {/* Generated Assets */}
                {generatedAssets.length > 0 && (
                    <Stack gap="md">
                        <Heading level={4}>
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph inline>🎨</Paragraph>
                                Generated Assets
                            </Stack>
                        </Heading>
                        <Grid cols={generatedAssets.length > 1 ? 2 : 1} gap="md">
                            {generatedAssets.map((asset, idx) => (
                                <Link key={idx} to={asset.url} external style={{ display: 'block' }}>
                                    <Stack gap="xs">
                                        <Card style={{
                                            width: '100%',
                                            aspectRatio: '4 / 3',
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                            backgroundColor: 'var(--color-surface-elevated)',
                                            padding: 0,
                                        }}>
                                            <SvgAsset
                                                url={asset.url}
                                                alt={formatAssetType(asset.type)}
                                                className="asset-thumbnail"
                                            />
                                        </Card>
                                        <Paragraph size="sm" centered muted>
                                            {formatAssetType(asset.type)}
                                        </Paragraph>
                                    </Stack>
                                </Link>
                            ))}
                        </Grid>
                    </Stack>
                )}

                {/* Nerd mode booster execution details with timing breakdown */}
                {isNerdMode && pipelineRun.boosters && pipelineRun.boosters.length > 0 && (() => {
                    const totalBoosterMs = pipelineRun.boosters.reduce((sum, b) => sum + (b.durationMs || 0), 0);
                    const maxBoosterMs = Math.max(...pipelineRun.boosters.map(b => b.durationMs || 0));
                    const pipelineDurationMs = pipelineRun.createdAt && pipelineRun.updatedAt
                        ? new Date(pipelineRun.updatedAt as unknown as string).getTime() - new Date(pipelineRun.createdAt as unknown as string).getTime()
                        : null;
                    return (
                        <Card>
                            <Stack gap="md">
                                <Heading level={4}>
                                    <Stack direction="horizontal" gap="xs" align="center">
                                        <Paragraph inline>⏱️</Paragraph>
                                        Booster Timing Breakdown
                                        <Badge variant="default" size="sm">
                                            {pipelineRun.boosters.length} boosters
                                        </Badge>
                                        {totalBoosterMs > 0 && (
                                            <Badge variant="default" size="sm">
                                                {totalBoosterMs}ms total
                                            </Badge>
                                        )}
                                        {pipelineDurationMs !== null && pipelineDurationMs > 0 && (
                                            <Badge variant="default" size="sm">
                                                {pipelineDurationMs < 1000
                                                    ? `${pipelineDurationMs}ms pipeline`
                                                    : `${(pipelineDurationMs / 1000).toFixed(1)}s pipeline`
                                                }
                                            </Badge>
                                        )}
                                    </Stack>
                                </Heading>
                                <Stack gap="sm">
                                    {pipelineRun.boosters
                                        .slice()
                                        .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
                                        .map((booster, idx) => {
                                            const pct = maxBoosterMs > 0 ? Math.max(5, Math.round(((booster.durationMs || 0) / maxBoosterMs) * 100)) : 0;
                                            return (
                                                <Card key={idx}>
                                                    <Stack gap="xs">
                                                        <Stack direction="horizontal" justify="between" align="center">
                                                            <Paragraph size="sm"><strong>{booster.providerName}</strong></Paragraph>
                                                            <Stack direction="horizontal" gap="sm" align="center">
                                                                <Badge variant={booster.status === 'SUCCESS' ? 'success' : booster.status === 'FAILED' ? 'error' : 'default'} size="sm">
                                                                    {booster.status}
                                                                </Badge>
                                                                <Paragraph size="sm" muted>
                                                                    {booster.durationMs > 0 ? `${booster.durationMs}ms` : '—'}
                                                                </Paragraph>
                                                            </Stack>
                                                        </Stack>
                                                        {booster.durationMs > 0 && (
                                                            <ProgressBar
                                                                value={pct}
                                                                max={100}
                                                                size="sm"
                                                                variant={booster.status === 'SUCCESS' ? 'success' : booster.status === 'FAILED' ? 'error' : booster.status === 'SKIPPED' ? 'default' : 'warning'}
                                                            />
                                                        )}
                                                        {booster.error && (
                                                            <Code>{booster.error}</Code>
                                                        )}
                                                        {booster.metadata && Object.keys(booster.metadata).length > 0 && (
                                                            <details>
                                                                <summary style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted, #9ca3af)' }}>Metadata ({Object.keys(booster.metadata).length} entries)</summary>
                                                                <Stack gap="xs" style={{ marginTop: '4px' }}>
                                                                    {Object.entries(booster.metadata).map(([key, value]) => (
                                                                        <Stack key={key} direction="horizontal" justify="between">
                                                                            <Paragraph size="sm" muted>{formatMetadataKey(key)}</Paragraph>
                                                                            <Paragraph size="sm">{formatMetadataValue(value)}</Paragraph>
                                                                        </Stack>
                                                                    ))}
                                                                </Stack>
                                                            </details>
                                                        )}
                                                    </Stack>
                                                </Card>
                                            );
                                        })}
                                </Stack>
                            </Stack>
                        </Card>
                    );
                })()}

                {/* Magic Actions Section */}
                <Card>
                    <Stack gap="md">
                        <Heading level={4}>
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph inline>⚡</Paragraph>
                                Magic Actions
                            </Stack>
                        </Heading>
                        <RepostActionsMenu
                            activity={{
                                activityId: pipelineRun.activityId,
                                title: pipelineRun.title,
                                description: pipelineRun.description,
                                type: pipelineRun.type,
                                source: pipelineRun.source,
                                startTime: pipelineRun.startTime,
                                destinations: destinations.reduce((acc, d) => ({ ...acc, [d.name]: d.externalId }), {} as Record<string, string>),
                                pipelineId: pipelineRun.pipelineId,
                                pipelineExecutionId: pipelineRun.id,
                                syncedAt: pipelineRun.updatedAt,
                            } as SynchronizedActivity}
                            onSuccess={() => { }}
                            isPro={true}
                            inline
                        />
                        <Button
                            variant="secondary"
                            size="small"
                            disabled={exportStatus === 'loading'}
                            onClick={async () => {
                                setExportStatus('loading');
                                try {
                                    const data = await api.get(`/export/run/${pipelineRun.id}`);
                                    const response = data as { downloadUrl: string; fitFileAvailable: boolean };
                                    const link = document.createElement('a');
                                    link.href = response.downloadUrl;
                                    link.download = `run-${pipelineRun.id}.zip`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    setExportStatus('done');
                                    toast.success('Export Ready', `Run data saved as ZIP${response.fitFileAvailable ? ' (includes FIT file)' : ''}`);
                                } catch {
                                    setExportStatus('error');
                                    toast.error('Export Failed', 'Could not export run data. Try again.');
                                }
                            }}
                        >
                            {exportStatus === 'loading' ? '⏳ Exporting...' : '📦 Export Run Data'}
                        </Button>
                    </Stack>
                </Card>

                {/* Footer */}
                <Paragraph size="sm" muted centered>
                    Synced: {formatDateTime(pipelineRun.updatedAt)}
                </Paragraph>
            </Stack >
        </PageLayout >
    );
};

export default ActivityDetailPage;
