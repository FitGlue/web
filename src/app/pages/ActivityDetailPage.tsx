import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
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
    const [svgContent, setSvgContent] = React.useState<string | null>(null);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
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

// Remove unused getDestinationActivityType - we now get type directly from PipelineRun

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
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();
    const { isNerdMode } = useNerdMode();

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
        successfulEnrichers,
        failedEnrichers,
    } = useMemo(() => {
        if (!pipelineRun) {
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
        const successfulEnrichers = providerExecutions.filter((p: ProviderExecution) => p.Status?.toUpperCase() === 'SUCCESS');
        const failedEnrichers = providerExecutions.filter((p: ProviderExecution) => p.Status?.toUpperCase() !== 'SUCCESS');

        return {
            sourceInfo,
            destinations,
            providerExecutions,
            activityType,
            generatedAssets,
            pipelineName,
            successfulEnrichers,
            failedEnrichers,
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

    const destinationNode = destinations.length > 0 ? (
        <Stack direction="horizontal" gap="xs">
            {destinations.map(dest => {
                const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                const isFailed = dest.status === 'Failed';
                const isSuccess = dest.status === 'Success';
                const badgeVariant = isFailed ? 'error' : isSuccess ? 'destination' : 'default';
                return (
                    <Badge key={dest.name} variant={badgeVariant as 'destination' | 'error' | 'default'} size="sm">
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
                <Heading level={3}>{pipelineRun.title || 'Untitled Activity'}</Heading>
            </Stack>
            <Stack direction="horizontal" gap="sm" align="center">
                {pipelineName && (
                    <Paragraph muted size="sm">via {pipelineName}</Paragraph>
                )}
                <Paragraph muted size="sm">{formatDateTime(pipelineRun.startTime)}</Paragraph>
            </Stack>
        </Stack>
    );

    return (
        <PageLayout
            title={pipelineRun.title || 'Activity Details'}
            backTo="/activities"
            backLabel="Activities"
            loading={loading}
        >
            <Stack gap="lg">
                {/* Hero Card with Flow Visualization */}
                <GlowCard variant={getGlowCardVariant(destinations.length > 0)} header={heroHeader}>
                    <Stack gap="md">
                        {/* Description */}
                        {pipelineRun.description && (
                            <Paragraph><span style={{ whiteSpace: 'pre-line' }}>{pipelineRun.description}</span></Paragraph>
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
                            {destinations.filter(d => d.status === 'Success').map(dest => {
                                const destInfo = formatPlatformName(dest.name.toLowerCase(), sources, registryDestinations);
                                const externalUrl = buildDestinationUrl(registryDestinations, dest.name.toLowerCase(), dest.externalId);

                                const cardHeader = (
                                    <Stack direction="horizontal" align="center" gap="sm">
                                        <span style={{ fontSize: '1.5rem' }}>{destInfo.icon}</span>
                                        <Heading level={4}>{destInfo.name}</Heading>
                                    </Stack>
                                );

                                return (
                                    <GlowCard
                                        key={dest.name}
                                        variant="success"
                                        header={cardHeader}
                                        onClick={externalUrl ? () => window.open(externalUrl, '_blank') : undefined}
                                    >
                                        <Stack gap="xs">
                                            {externalUrl ? (
                                                <Link to={externalUrl} external>
                                                    View on {destInfo.name} ↗
                                                </Link>
                                            ) : (
                                                <Code>{dest.externalId}</Code>
                                            )}
                                            <Paragraph size="sm" muted>
                                                ✓ Synced successfully
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

                {/* Nerd mode booster execution details - using PipelineRun boosters */}
                {isNerdMode && pipelineRun.boosters && pipelineRun.boosters.length > 0 && (
                    <Card>
                        <Stack gap="md">
                            <Heading level={4}>
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline>🔧</Paragraph>
                                    Booster Execution Details
                                    <Badge variant="default" size="sm">
                                        {pipelineRun.boosters.length} boosters
                                    </Badge>
                                </Stack>
                            </Heading>
                            <Stack gap="sm">
                                {pipelineRun.boosters.map((booster, idx) => (
                                    <Card key={idx}>
                                        <Stack gap="xs">
                                            <Paragraph size="sm"><strong>{booster.providerName}</strong></Paragraph>
                                            <Paragraph size="sm" muted>Status: {booster.status}</Paragraph>
                                            {booster.durationMs > 0 && (
                                                <Paragraph size="sm" muted>Duration: {booster.durationMs}ms</Paragraph>
                                            )}
                                            {booster.error && (
                                                <Code>{booster.error}</Code>
                                            )}
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
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
                    </Stack>
                </Card>

                {/* Footer */}
                <Paragraph size="sm" muted centered>
                    Synced: {formatDateTime(pipelineRun.updatedAt)}
                </Paragraph>
            </Stack>
        </PageLayout>
    );
};

export default ActivityDetailPage;
