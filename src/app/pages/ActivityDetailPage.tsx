import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { SynchronizedActivity, ExecutionRecord, ActivitiesService } from '../services/ActivitiesService';
import { PipelineTrace } from '../components/PipelineTrace';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, CardSkeleton, Pill, Heading, Paragraph, Code, Badge, GlowCard } from '../components/library/ui';
import { FlowVisualization } from '../components/library/ui/FlowVisualization';
import { BoosterGrid } from '../components/library/ui/BoosterGrid';
import '../components/library/ui/CardSkeleton.css';
import { EnricherBadge } from '../components/dashboard/EnricherBadge';
import { RepostActionsMenu } from '../components/RepostActionsMenu';
import { useNerdMode } from '../state/NerdModeContext';
import { formatActivityType, formatDestination, formatDestinationStatus } from '../../types/pb/enum-formatters';
import { buildDestinationUrl } from '../utils/destinationUrls';
import { PluginManifest } from '../types/plugin';
import { Link } from '../components/library/navigation';
import { BoosterExecution, PipelineRun } from '../../types/pb/user';

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

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

const getGlowCardVariant = (hasDestinations: boolean): 'default' | 'success' | 'premium' | 'awaiting' => {
    if (hasDestinations) return 'success';
    return 'awaiting';
};

const ActivityDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState<SynchronizedActivity | null>(null);
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();
    const { isNerdMode } = useNerdMode();

    // Get pipeline runs for this activity - this has booster metadata!
    const { pipelineRuns } = useRealtimePipelineRuns(true, 50);

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

    // Get the most recent pipeline run for this activity (has booster data with metadata)
    const activityPipelineRun = useMemo((): PipelineRun | undefined => {
        return pipelineRuns.find(run => run.activityId === id);
    }, [pipelineRuns, id]);

    // Memoized data extraction - prefer pipeline run data for boosters
    const {
        sourceInfo,
        destinations,
        providerExecutions,
        activityType,
        generatedAssets,
        pipelineName,
        successfulEnrichers,
        failedEnrichers,
        pipelineRunDestinations,
    } = useMemo(() => {
        if (!activity) {
            return {
                sourceInfo: { name: '', icon: '' },
                destinations: [],
                providerExecutions: [],
                activityType: '',
                generatedAssets: [],
                pipelineName: undefined,
                successfulEnrichers: [],
                failedEnrichers: [],
                pipelineRunDestinations: [],
            };
        }

        const originalSource = deriveOriginalSource(activity);
        const sourceInfo = formatPlatformName(originalSource, sources, registryDestinations);
        const destinations = activity.destinations ? Object.entries(activity.destinations) : [];

        // Prefer pipeline run boosters (has metadata) over legacy execution trace
        const providerExecutions = activityPipelineRun?.boosters
            ? mapBoostersToExecutions(activityPipelineRun.boosters)
            : extractEnricherExecutions(activity.pipelineExecution);

        const destinationActivityType = getDestinationActivityType(activity.pipelineExecution);
        const activityType = destinationActivityType
            ? formatActivityType(destinationActivityType)
            : formatActivityType(activity.type);
        const generatedAssets = extractGeneratedAssets(providerExecutions);
        const pipelineName = activity.pipelineId
            ? pipelines.find(p => p.id === activity.pipelineId)?.name
            : undefined;
        const successfulEnrichers = providerExecutions.filter(p => p.Status?.toUpperCase() === 'SUCCESS');
        const failedEnrichers = providerExecutions.filter(p => p.Status?.toUpperCase() !== 'SUCCESS');

        // Get detailed destination info from pipeline run
        const pipelineRunDestinations = activityPipelineRun?.destinations || [];

        return {
            sourceInfo,
            destinations,
            providerExecutions,
            activityType,
            generatedAssets,
            pipelineName,
            successfulEnrichers,
            failedEnrichers,
            pipelineRunDestinations,
        };
    }, [activity, sources, registryDestinations, pipelines, activityPipelineRun]);

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

    const destinationNode = destinations.length > 0 ? (
        <Stack direction="horizontal" gap="xs">
            {destinations.map(([platform]) => {
                const destInfo = formatPlatformName(platform, sources, registryDestinations);
                return (
                    <Badge key={platform} variant="destination" size="sm">
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
                <Paragraph inline>⏳</Paragraph>
                <Paragraph inline size="sm">Pending</Paragraph>
            </Stack>
        </Badge>
    );

    // Header content for GlowCard
    const heroHeader = (
        <Stack direction="horizontal" align="center" justify="between">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
                <Pill variant="gradient" size="small">{activityType}</Pill>
                <Heading level={3}>{activity.title || 'Untitled Activity'}</Heading>
            </Stack>
            <Stack direction="horizontal" gap="sm" align="center">
                {pipelineName && (
                    <Paragraph muted size="sm">via {pipelineName}</Paragraph>
                )}
                <Paragraph muted size="sm">{formatDateTime(activity.startTime)}</Paragraph>
            </Stack>
        </Stack>
    );

    return (
        <PageLayout
            title={activity.title || 'Activity Details'}
            backTo="/activities"
            backLabel="Activities"
            onRefresh={fetchActivity}
            loading={loading}
        >
            <Stack gap="lg">
                {/* Hero Card with Flow Visualization */}
                <GlowCard variant={getGlowCardVariant(destinations.length > 0)} header={heroHeader}>
                    <Stack gap="md">
                        {/* Description */}
                        {activity.description && (
                            <Paragraph><span style={{ whiteSpace: 'pre-line' }}>{activity.description}</span></Paragraph>
                        )}

                        {/* Flow Visualization */}
                        <FlowVisualization
                            source={sourceNode}
                            center={boostersNode}
                            destination={destinationNode}
                        />
                    </Stack>
                </GlowCard>

                {/* Enricher Details - Expanded Metadata */}
                {successfulEnrichers.length > 0 && (
                    <Card>
                        <Stack gap="md">
                            <Heading level={4}>
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline>✨</Paragraph>
                                    Enrichments Applied
                                </Stack>
                            </Heading>
                            <Grid cols={2} gap="md">
                                {successfulEnrichers.map((enricher, idx) => (
                                    <Card key={idx}>
                                        <Stack gap="sm">
                                            <EnricherBadge
                                                providerName={enricher.ProviderName}
                                                status={enricher.Status}
                                                metadata={enricher.Metadata}
                                            />
                                            {enricher.Metadata && Object.keys(enricher.Metadata).length > 0 && (
                                                <Stack gap="xs">
                                                    {Object.entries(enricher.Metadata)
                                                        .filter(([key]) => !key.startsWith('asset_'))
                                                        .slice(0, 6)
                                                        .map(([key, value]) => (
                                                            <Stack key={key} direction="horizontal" justify="between">
                                                                <Paragraph size="sm" muted>{formatMetadataKey(key)}</Paragraph>
                                                                <Paragraph size="sm">{formatMetadataValue(value)}</Paragraph>
                                                            </Stack>
                                                        ))}
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Card>
                                ))}
                            </Grid>
                            {failedEnrichers.length > 0 && (
                                <Paragraph size="sm" muted>
                                    ⚠️ {failedEnrichers.length} enricher{failedEnrichers.length > 1 ? 's' : ''} skipped
                                </Paragraph>
                            )}
                        </Stack>
                    </Card>
                )}

                {/* Synced Destinations - Big Clickable GlowCards */}
                {destinations.length > 0 && (
                    <Stack gap="md">
                        <Heading level={4}>
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph inline>🚀</Paragraph>
                                Synced Destinations
                            </Stack>
                        </Heading>
                        <Grid cols={2} gap="md">
                            {destinations.map(([platform, activityId]) => {
                                const destInfo = formatPlatformName(platform, sources, registryDestinations);
                                const activityIdStr = String(activityId);
                                const externalUrl = buildDestinationUrl(registryDestinations, platform, activityIdStr);

                                // Get status from pipeline run destinations
                                const runDest = pipelineRunDestinations.find(d =>
                                    formatDestination(d.destination)?.toLowerCase() === platform.toLowerCase()
                                );
                                const status = runDest ? formatDestinationStatus(runDest.status) : 'SUCCESS';
                                const isSuccess = status === 'SUCCESS';

                                const cardHeader = (
                                    <Stack direction="horizontal" align="center" gap="sm">
                                        <span style={{ fontSize: '1.5rem' }}>{destInfo.icon}</span>
                                        <Heading level={4}>{destInfo.name}</Heading>
                                    </Stack>
                                );

                                return (
                                    <GlowCard
                                        key={platform}
                                        variant={isSuccess ? 'success' : 'default'}
                                        header={cardHeader}
                                        onClick={externalUrl ? () => window.open(externalUrl, '_blank') : undefined}
                                    >
                                        <Stack gap="xs">
                                            {externalUrl ? (
                                                <Link to={externalUrl} external>
                                                    View on {destInfo.name} ↗
                                                </Link>
                                            ) : (
                                                <Code>{activityIdStr}</Code>
                                            )}
                                            <Paragraph size="sm" muted>
                                                {isSuccess ? '✓ Synced successfully' : `Status: ${status}`}
                                            </Paragraph>
                                        </Stack>
                                    </GlowCard>
                                );
                            })}
                        </Grid>
                    </Stack>
                )}

                {/* Generated Assets */}
                {generatedAssets.length > 0 && (
                    <Card>
                        <Stack gap="md">
                            <Heading level={4}>
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline>🎨</Paragraph>
                                    Generated Assets
                                </Stack>
                            </Heading>
                            <Grid cols={3} gap="md">
                                {generatedAssets.map((asset, idx) => (
                                    <Stack key={idx} align="center" gap="sm">
                                        <Link to={asset.url} external>
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
                        </Stack>
                    </Card>
                )}

                {/* Pipeline Execution Trace - Nerd Mode Only */}
                {isNerdMode && activity.pipelineExecution && activity.pipelineExecution.length > 0 && (
                    <Card>
                        <Stack gap="md">
                            <Heading level={4}>
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline>🔧</Paragraph>
                                    Pipeline Execution Trace
                                    <Badge variant="default" size="sm">
                                        {activity.pipelineExecution.length} steps
                                    </Badge>
                                </Stack>
                            </Heading>
                            <PipelineTrace
                                trace={activity.pipelineExecution}
                                pipelineExecutionId={activity.pipelineExecutionId}
                                isLoading={loading}
                            />
                        </Stack>
                    </Card>
                )}

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
                            activity={activity}
                            onSuccess={fetchActivity}
                            isPro={true}
                            inline
                        />
                    </Stack>
                </Card>

                {/* Footer */}
                <Paragraph size="sm" muted centered>
                    Synced: {formatDateTime(activity.syncedAt)}
                </Paragraph>
            </Stack>
        </PageLayout>
    );
};

export default ActivityDetailPage;
