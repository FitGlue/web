import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { SynchronizedActivity, ExecutionRecord, ActivitiesService } from '../services/ActivitiesService';
import { PipelineTrace } from '../components/PipelineTrace';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, CardSkeleton, Pill, Button, Heading, Paragraph, Code, TabbedCard } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { EnricherBadge } from '../components/dashboard/EnricherBadge';
import { RepostActionsMenu } from '../components/RepostActionsMenu';
import { useNerdMode } from '../state/NerdModeContext';
import { formatActivityType, formatDestinationStatus } from '../../types/pb/enum-formatters';
import { buildDestinationUrl } from '../utils/destinationUrls';
import { PluginManifest } from '../types/plugin';
import { Link } from '../components/library/navigation';
import { PipelineRunStatus } from '../../types/pb/user';

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

// Status groupings for filtering pipeline runs
type RunsTabMode = 'all' | 'completed' | 'attention';

const COMPLETED_STATUSES = [
    PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED,
    PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL,
];

const ATTENTION_STATUSES = [
    PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING,
    PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING,
    PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED,
    PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED,
];

const getStatusInfo = (status?: PipelineRunStatus): { label: string; icon: string; variant: 'success' | 'warning' | 'error' | 'default' } => {
    switch (status) {
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED:
            return { label: 'Synced', icon: '✅', variant: 'success' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL:
            return { label: 'Partial', icon: '⚠️', variant: 'warning' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED:
            return { label: 'Failed', icon: '❌', variant: 'error' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING:
            return { label: 'Running', icon: '🔄', variant: 'default' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING:
            return { label: 'Awaiting Input', icon: '⏳', variant: 'warning' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED:
            return { label: 'Skipped', icon: '⏭️', variant: 'default' };
        default:
            return { label: 'Unknown', icon: '❓', variant: 'default' };
    }
};

const deriveOriginalSource = (activity: SynchronizedActivity): string => {
    if (activity.pipelineExecution && activity.pipelineExecution.length > 0) {
        const firstService = activity.pipelineExecution[0].service;
        if (firstService) {
            return firstService
                .replace(/-handler$/, '')
                .replace(/-webhook$/, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
        }
    }
    return activity.source || 'Unknown';
};

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

interface GeneratedAsset {
    type: string;
    url: string;
    providerName: string;
}

const extractGeneratedAssets = (providerExecutions: ProviderExecution[]): GeneratedAsset[] => {
    const assets: GeneratedAsset[] = [];

    for (const execution of providerExecutions) {
        if (execution.Status?.toUpperCase() !== 'SUCCESS' || !execution.Metadata) {
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

const isSvgUrl = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        return pathname.endsWith('.svg') || pathname.includes('.svg');
    } catch {
        return url.toLowerCase().includes('.svg');
    }
};

const SvgAsset: React.FC<{ url: string; alt: string; className?: string }> = ({ url, alt, className }) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch SVG');
                return res.text();
            })
            .then(text => {
                if (cancelled) return;
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');
                const svgElement = doc.querySelector('svg');
                if (svgElement) {
                    svgElement.removeAttribute('width');
                    svgElement.removeAttribute('height');
                    svgElement.setAttribute('aria-label', alt);
                    svgElement.setAttribute('role', 'img');
                    if (className) {
                        svgElement.classList.add(...className.split(' '));
                    }
                    setSvgContent(svgElement.outerHTML);
                } else {
                    setError(true);
                }
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });

        return () => { cancelled = true; };
    }, [url, alt, className]);

    if (error) {
        return <img src={url} alt={alt} className={className} />;
    }

    if (!svgContent) {
        return <div className={className} style={{ opacity: 0.5 }} aria-label={`Loading ${alt}`} />;
    }

    // eslint-disable-next-line react/no-danger
    return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

const getDestinationActivityType = (pipelineExecution?: ExecutionRecord[]): string | null => {
    if (!pipelineExecution) return null;

    const checkOrder = ['router', ...pipelineExecution
        .filter(r => r.service?.endsWith('-uploader'))
        .map(r => r.service as string)
    ];

    for (const service of checkOrder) {
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

const formatPlatformName = (
    platform: string,
    sources: PluginManifest[],
    destinations: PluginManifest[]
): { name: string; icon: string } => {
    const key = platform.toLowerCase();

    const allPlugins = [...sources, ...destinations];
    const plugin = allPlugins.find(p => p.id === key);

    const name = plugin?.name || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
    const icon = plugin?.icon || '📱';

    return { name, icon };
};

const formatDateTime = (dateStr?: string): string => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const ActivityDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    // Use ActivitiesService directly for single activity fetch instead of batched REST hook
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState<SynchronizedActivity | null>(null);
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();
    const [traceExpanded, setTraceExpanded] = useState(false);
    const { isNerdMode } = useNerdMode();
    const [runsTabMode, setRunsTabMode] = useState<RunsTabMode>('all');

    // Get all pipeline runs and filter by this activity
    const { pipelineRuns, loading: runsLoading } = useRealtimePipelineRuns(true, 50);

    // Filter pipeline runs for this activity
    const activityRuns = useMemo(() => {
        return pipelineRuns.filter(run => run.activityId === id);
    }, [pipelineRuns, id]);

    // Filter by status tab
    const filteredRuns = useMemo(() => {
        switch (runsTabMode) {
            case 'completed':
                return activityRuns.filter(run => COMPLETED_STATUSES.includes(run.status));
            case 'attention':
                return activityRuns.filter(run => ATTENTION_STATUSES.includes(run.status));
            case 'all':
            default:
                return activityRuns;
        }
    }, [activityRuns, runsTabMode]);

    // Count runs by category
    const runsCounts = useMemo(() => ({
        all: activityRuns.length,
        completed: activityRuns.filter(run => COMPLETED_STATUSES.includes(run.status)).length,
        attention: activityRuns.filter(run => ATTENTION_STATUSES.includes(run.status)).length,
    }), [activityRuns]);

    const fetchActivity = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await ActivitiesService.get(id);
            setActivity(data || null);
        } catch (e) {
            console.error('Failed to load activity', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
    }, [id]);

    useEffect(() => {
        if (isNerdMode) {
            setTraceExpanded(true);
        }
    }, [isNerdMode]);

    if (loading && !activity) {
        return (
            <PageLayout title="Loading..." backTo="/activities" backLabel="Activities">
                <CardSkeleton variant="activity-detail" />
            </PageLayout>
        );
    }

    if (!activity) {
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

    const originalSource = deriveOriginalSource(activity);
    const sourceInfo = formatPlatformName(originalSource, sources, registryDestinations);
    const destinations = activity.destinations ? Object.entries(activity.destinations) : [];
    const providerExecutions = extractEnricherExecutions(activity.pipelineExecution);
    const destinationActivityType = getDestinationActivityType(activity.pipelineExecution);
    const activityType = destinationActivityType
        ? formatActivityType(destinationActivityType)
        : formatActivityType(activity.type);

    const failedBoosters = providerExecutions.filter(p => p.Status?.toUpperCase() === 'FAILED');
    const generatedAssets = extractGeneratedAssets(providerExecutions);

    const pipelineName = activity.pipelineId
        ? pipelines.find(p => p.id === activity.pipelineId)?.name
        : undefined;

    return (
        <PageLayout
            title={activity.title || 'Activity Details'}
            backTo="/activities"
            backLabel="Activities"
            onRefresh={fetchActivity}
            loading={loading}
        >
            <Stack gap="lg">
                <Stack direction="horizontal" align="center" justify="between">
                    <Stack direction="horizontal" align="center" gap="sm">
                        <Pill variant="gradient">{activityType}</Pill>
                        {pipelineName && (
                            <Paragraph inline muted>via {pipelineName}</Paragraph>
                        )}
                        <Paragraph inline muted>{formatDateTime(activity.startTime)}</Paragraph>
                    </Stack>
                    <RepostActionsMenu
                        activity={activity}
                        onSuccess={fetchActivity}
                        isPro={true}
                    />
                </Stack>

                {activity.description && (
                    <Paragraph>{activity.description}</Paragraph>
                )}

                <Stack direction="horizontal" align="center" gap="md" wrap>
                    <Stack align="center" gap="xs">
                        <Paragraph inline>{sourceInfo.icon}</Paragraph>
                        <Paragraph inline>{sourceInfo.name}</Paragraph>
                    </Stack>

                    <Paragraph inline>→</Paragraph>

                    <Stack align="center" gap="xs">
                        <Paragraph inline>✨ FitGlue Magic</Paragraph>
                        {providerExecutions.length > 0 && (
                            <Stack direction="horizontal" gap="xs" wrap>
                                {providerExecutions.map((exec, idx) => (
                                    <EnricherBadge
                                        key={idx}
                                        providerName={exec.ProviderName}
                                        status={exec.Status}
                                        metadata={exec.Metadata}
                                    />
                                ))}
                            </Stack>
                        )}
                        {providerExecutions.length === 0 && (
                            <Paragraph size="sm" muted>No boosters applied</Paragraph>
                        )}
                        {failedBoosters.length > 0 && (
                            <Paragraph size="sm">⚠️ {failedBoosters.length} skipped</Paragraph>
                        )}
                    </Stack>

                    <Paragraph inline>→</Paragraph>

                    {destinations.length > 0 ? (
                        <Stack direction="horizontal" gap="sm" wrap>
                            {destinations.map(([platform]) => {
                                const destInfo = formatPlatformName(platform, sources, registryDestinations);
                                return (
                                    <Stack key={platform} align="center" gap="xs">
                                        <Paragraph inline>{destInfo.icon}</Paragraph>
                                        <Paragraph inline>{destInfo.name}</Paragraph>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    ) : (
                        <Stack align="center" gap="xs">
                            <Paragraph inline>⏳</Paragraph>
                            <Paragraph inline>Pending</Paragraph>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            {destinations.length > 0 && (
                <Card>
                    <Heading level={3}>
                        <Paragraph inline>🚀</Paragraph>
                        Synced Destinations
                    </Heading>
                    <Grid cols={2} gap="md">
                        {destinations.map(([platform, activityId]) => {
                            const destInfo = formatPlatformName(platform, sources, registryDestinations);
                            const activityIdStr = String(activityId);
                            const externalUrl = buildDestinationUrl(registryDestinations, platform, activityIdStr);

                            return (
                                <Stack key={platform} gap="sm">
                                    <Stack direction="horizontal" align="center" gap="sm">
                                        <Paragraph inline>{destInfo.icon}</Paragraph>
                                        <Paragraph bold>{destInfo.name}</Paragraph>
                                    </Stack>
                                    <Stack>
                                        {externalUrl ? (
                                            <Link
                                                to={externalUrl}
                                                external

                                            >
                                                {activityIdStr} ↗
                                            </Link>
                                        ) : (
                                            <Code>{activityIdStr}</Code>
                                        )}
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Grid>
                </Card>
            )}

            {generatedAssets.length > 0 && (
                <Card>
                    <Heading level={3}>
                        <Paragraph inline>🎨</Paragraph>
                        Generated Assets
                    </Heading>
                    <Grid cols={3} gap="md">
                        {generatedAssets.map((asset, idx) => (
                            <Stack key={idx} align="center" gap="sm">
                                <Link
                                    to={asset.url}
                                    external

                                >
                                    <Stack align="center" gap="xs">
                                        {isSvgUrl(asset.url) ? (
                                            <SvgAsset
                                                url={asset.url}
                                                alt={formatAssetType(asset.type)}

                                            />
                                        ) : (
                                            <img
                                                src={asset.url}
                                                alt={formatAssetType(asset.type)}

                                            />
                                        )}
                                    </Stack>
                                    <Paragraph size="sm" centered>
                                        {formatAssetType(asset.type)}
                                    </Paragraph>
                                </Link>
                            </Stack>
                        ))}
                    </Grid>
                </Card>
            )}

            {/* Pipeline Runs Section - Shows all runs for this activity */}
            {activityRuns.length > 0 && (
                <TabbedCard
                    tabs={[
                        { id: 'all', icon: '📋', label: 'All Runs', count: runsCounts.all },
                        { id: 'completed', icon: '✅', label: 'Completed', count: runsCounts.completed },
                        { id: 'attention', icon: '⚡', label: 'In Progress', count: runsCounts.attention, variant: runsCounts.attention > 0 ? 'warning' : undefined },
                    ]}
                    activeTab={runsTabMode}
                    onTabChange={(tabId) => setRunsTabMode(tabId as RunsTabMode)}
                    footerText={filteredRuns.length > 0 ? `${filteredRuns.length} pipeline runs` : undefined}
                >
                    {runsLoading && filteredRuns.length === 0 ? (
                        <Stack gap="md">
                            <CardSkeleton variant="activity" />
                        </Stack>
                    ) : filteredRuns.length === 0 ? (
                        <Stack gap="md" align="center">
                            <Paragraph size="lg">
                                {runsTabMode === 'completed' ? '🏃' : runsTabMode === 'attention' ? '✅' : '📋'}
                            </Paragraph>
                            <Heading level={4}>
                                {runsTabMode === 'completed' ? 'No completed runs' : runsTabMode === 'attention' ? 'No runs need attention' : 'No pipeline runs'}
                            </Heading>
                        </Stack>
                    ) : (
                        <Stack gap="md">
                            {filteredRuns.map(run => {
                                const statusInfo = getStatusInfo(run.status);
                                const runPipeline = pipelines.find(p => p.id === run.pipelineId);
                                const boosters = run.boosters || [];

                                return (
                                    <Card key={run.id}>
                                        <Stack gap="sm">
                                            <Stack direction="horizontal" align="center" justify="between">
                                                <Stack direction="horizontal" gap="sm" align="center">
                                                    <Pill variant={statusInfo.variant === 'success' ? 'success' : statusInfo.variant === 'error' ? 'error' : 'default'}>
                                                        {statusInfo.icon} {statusInfo.label}
                                                    </Pill>
                                                    {runPipeline && (
                                                        <Paragraph muted size="sm">via {runPipeline.name}</Paragraph>
                                                    )}
                                                </Stack>
                                                <Paragraph muted size="sm">
                                                    {run.createdAt ? new Date(run.createdAt).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    }) : 'Unknown time'}
                                                </Paragraph>
                                            </Stack>

                                            {run.statusMessage && (
                                                <Paragraph size="sm" muted>
                                                    ℹ️ {run.statusMessage}
                                                </Paragraph>
                                            )}

                                            {boosters.length > 0 && (
                                                <Stack direction="horizontal" gap="xs" wrap>
                                                    {boosters.map((booster, idx) => (
                                                        <EnricherBadge
                                                            key={idx}
                                                            providerName={booster.providerName}
                                                            status={booster.status}
                                                            metadata={booster.metadata as Record<string, unknown>}
                                                        />
                                                    ))}
                                                </Stack>
                                            )}

                                            {run.destinations && run.destinations.length > 0 && (
                                                <Stack direction="horizontal" gap="xs" wrap>
                                                    {run.destinations.map((dest, idx) => {
                                                        const destStatus = formatDestinationStatus(dest.status) || 'PENDING';
                                                        const destInfo = formatPlatformName(
                                                            dest.destination?.toString() || 'unknown',
                                                            sources,
                                                            registryDestinations
                                                        );
                                                        return (
                                                            <Pill
                                                                key={idx}
                                                                variant={destStatus === 'SUCCESS' ? 'success' : destStatus === 'FAILED' ? 'error' : 'default'}
                                                                size="small"
                                                            >
                                                                {destInfo.icon} {destInfo.name}
                                                            </Pill>
                                                        );
                                                    })}
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </TabbedCard>
            )}

            {activity.pipelineExecution && activity.pipelineExecution.length > 0 && (
                <Stack gap="sm">
                    <Button
                        variant="text"
                        onClick={() => setTraceExpanded(!traceExpanded)}

                    >
                        <Paragraph inline>
                            {traceExpanded ? '▼' : '▶'}
                        </Paragraph>
                        <Paragraph inline>
                            Pipeline Execution Trace (Legacy)
                        </Paragraph>
                        <Paragraph inline muted>
                            {activity.pipelineExecution.length} steps
                        </Paragraph>
                    </Button>

                    {traceExpanded && (
                        <Stack>
                            <PipelineTrace
                                trace={activity.pipelineExecution}
                                pipelineExecutionId={activity.pipelineExecutionId}
                                isLoading={loading}
                            />
                        </Stack>
                    )}
                </Stack>
            )}

            <Paragraph size="sm" muted centered>
                Synced: {formatDateTime(activity.syncedAt)}
            </Paragraph>
        </PageLayout>
    );
};

export default ActivityDetailPage;
