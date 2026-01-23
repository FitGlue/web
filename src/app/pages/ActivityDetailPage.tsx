import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { usePipelines } from '../hooks/usePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { SynchronizedActivity, ExecutionRecord } from '../services/ActivitiesService';
import { PipelineTrace } from '../components/PipelineTrace';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import '../components/ui/CardSkeleton.css';
import { EnricherBadge } from '../components/dashboard/EnricherBadge';
import { RepostActionsMenu } from '../components/RepostActionsMenu';
import { useNerdMode } from '../state/NerdModeContext';
import { formatActivityType } from '../../types/pb/enum-formatters';
import { buildDestinationUrl } from '../utils/destinationUrls';
import { PluginManifest } from '../types/plugin';
import './ActivityDetailPage.css';

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

// Helper to derive original trigger source from pipeline execution trace
// Uses generic pattern detection instead of hardcoded platform names
const deriveOriginalSource = (activity: SynchronizedActivity): string => {
    if (activity.pipelineExecution && activity.pipelineExecution.length > 0) {
        const firstService = activity.pipelineExecution[0].service;
        if (firstService) {
            // Remove common suffixes and format the name nicely
            return firstService
                .replace(/-handler$/, '')
                .replace(/-webhook$/, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
        }
    }
    return activity.source || 'Unknown';
};

// Extract enricher executions from pipeline
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

// Extract generated assets from provider executions
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

        // Check for asset_* keys in metadata
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

// Format asset type for display
const formatAssetType = (type: string): string => {
    const typeMap: Record<string, string> = {
        'ai_banner': 'AI Banner',
        'muscle_heatmap': 'Muscle Heatmap',
        'route_thumbnail': 'Route Map',
    };
    return typeMap[type] || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// Check if URL points to an SVG asset
const isSvgUrl = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        // Check for .svg extension or SVG content type indicators in GCS URLs
        return pathname.endsWith('.svg') || pathname.includes('.svg');
    } catch {
        return url.toLowerCase().includes('.svg');
    }
};

// Component to render SVG inline by fetching and embedding the content
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
                // Parse and sanitize the SVG content
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');
                const svgElement = doc.querySelector('svg');
                if (svgElement) {
                    // Remove any existing width/height to allow CSS control
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
        // Fallback to img tag if SVG fetch/parse fails
        return <img src={url} alt={alt} className={className} />;
    }

    if (!svgContent) {
        // Loading state - show placeholder
        return <div className={className} style={{ opacity: 0.5 }} aria-label={`Loading ${alt}`} />;
    }

    // eslint-disable-next-line react/no-danger
    return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

// Get destination activity type from pipeline outputs
// Uses generic -uploader suffix detection instead of hardcoded service names
const getDestinationActivityType = (pipelineExecution?: ExecutionRecord[]): string | null => {
    if (!pipelineExecution) return null;

    // Check router first, then any uploader output
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

// Format platform name and icon using registry data (centralized in registry.ts)
const formatPlatformName = (
    platform: string,
    sources: PluginManifest[],
    destinations: PluginManifest[]
): { name: string; icon: string } => {
    const key = platform.toLowerCase();

    // Try to find in registry (sources + destinations)
    const allPlugins = [...sources, ...destinations];
    const plugin = allPlugins.find(p => p.id === key);

    const name = plugin?.name || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
    // Use icon from registry if available, fallback to generic icon
    const icon = plugin?.icon || '📱';

    return { name, icon };
};

// Format datetime nicely
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
    const { activities, loading, refresh } = useActivities('single', id);
    const { pipelines, fetchIfNeeded: fetchPipelines } = usePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();
    const [activity, setActivity] = useState<SynchronizedActivity | null>(null);
    const [traceExpanded, setTraceExpanded] = useState(false);
    const { isNerdMode } = useNerdMode();

    // Fetch pipelines to look up name
    useEffect(() => {
        fetchPipelines();
    }, [fetchPipelines]);

    useEffect(() => {
        if (id && activities.length > 0) {
            setActivity(activities.find(a => a.activityId === id) || null);
        }
    }, [id, activities]);

    // Auto-expand trace in nerd mode
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
                <div className="activity-detail__empty">
                    <span className="activity-detail__empty-icon">🔍</span>
                    <h3>Activity not found</h3>
                    <p>This activity may have been deleted or doesn&apos;t exist.</p>
                </div>
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

    // Look up pipeline name by ID
    const pipelineName = activity.pipelineId
        ? pipelines.find(p => p.id === activity.pipelineId)?.name
        : undefined;

    return (
        <PageLayout
            title={activity.title || 'Activity Details'}
            backTo="/activities"
            backLabel="Activities"
            onRefresh={refresh}
            loading={loading}
        >
            {/* Hero Header */}
            <div className="activity-detail__hero">
                <div className="activity-detail__hero-header">
                    <div className="activity-detail__hero-meta">
                        <span className="activity-detail__type-badge">{activityType}</span>
                        {pipelineName && (
                            <span className="activity-detail__pipeline-name">via {pipelineName}</span>
                        )}
                        <span className="activity-detail__date">{formatDateTime(activity.startTime)}</span>
                    </div>
                    <RepostActionsMenu
                        activity={activity}
                        onSuccess={refresh}
                        isPro={true}
                    />
                </div>

                {activity.description && (
                    <p className="activity-detail__description">{activity.description}</p>
                )}

                {/* Flow Visualization with Boosters */}
                <div className="activity-detail__flow">
                    <div className="activity-detail__flow-node activity-detail__flow-node--source">
                        <span className="activity-detail__flow-icon">{sourceInfo.icon}</span>
                        <span className="activity-detail__flow-label">{sourceInfo.name}</span>
                    </div>

                    <span className="activity-detail__flow-arrow">→</span>

                    {/* FitGlue Magic Center - with boosters */}
                    <div className="activity-detail__flow-center">
                        <span className="activity-detail__flow-magic-label">
                            ✨ FitGlue Magic
                        </span>
                        {providerExecutions.length > 0 && (
                            <div className="activity-detail__flow-boosters">
                                {providerExecutions.map((exec, idx) => (
                                    <EnricherBadge
                                        key={idx}
                                        providerName={exec.ProviderName}
                                        status={exec.Status}
                                        metadata={exec.Metadata}
                                    />
                                ))}
                            </div>
                        )}
                        {providerExecutions.length === 0 && (
                            <span className="activity-detail__flow-no-boosters">No boosters applied</span>
                        )}
                        {failedBoosters.length > 0 && (
                            <span className="activity-detail__flow-booster-note">
                                ⚠️ {failedBoosters.length} skipped
                            </span>
                        )}
                    </div>

                    <span className="activity-detail__flow-arrow">→</span>

                    {destinations.length > 0 ? (
                        <div className="activity-detail__flow-destinations">
                            {destinations.map(([platform]) => {
                                const destInfo = formatPlatformName(platform, sources, registryDestinations);
                                return (
                                    <div key={platform} className="activity-detail__flow-node activity-detail__flow-node--destination">
                                        <span className="activity-detail__flow-icon">{destInfo.icon}</span>
                                        <span className="activity-detail__flow-label">{destInfo.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="activity-detail__flow-node activity-detail__flow-node--pending">
                            <span className="activity-detail__flow-icon">⏳</span>
                            <span className="activity-detail__flow-label">Pending</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Destinations */}
            {destinations.length > 0 && (
                <Card className="activity-detail__destinations-card">
                    <h3 className="activity-detail__section-title">
                        <span className="activity-detail__section-icon">🚀</span>
                        Synced Destinations
                    </h3>
                    <div className="activity-detail__destinations-grid">
                        {destinations.map(([platform, activityId]) => {
                            const destInfo = formatPlatformName(platform, sources, registryDestinations);
                            const activityIdStr = String(activityId);
                            // Use registry-provided URL templates instead of hardcoded URLs
                            const externalUrl = buildDestinationUrl(registryDestinations, platform, activityIdStr);

                            return (
                                <div key={platform} className="activity-detail__destination">
                                    <div className="activity-detail__destination-header">
                                        <span className="activity-detail__destination-icon">{destInfo.icon}</span>
                                        <span className="activity-detail__destination-name">{destInfo.name}</span>
                                    </div>
                                    <div className="activity-detail__destination-id">
                                        {externalUrl ? (
                                            <a
                                                href={externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="activity-detail__destination-link"
                                            >
                                                {activityIdStr} ↗
                                            </a>
                                        ) : (
                                            <code>{activityIdStr}</code>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Generated Assets */}
            {generatedAssets.length > 0 && (
                <Card className="activity-detail__assets-card">
                    <h3 className="activity-detail__section-title">
                        <span className="activity-detail__section-icon">🎨</span>
                        Generated Assets
                    </h3>
                    <div className="activity-detail__assets-grid">
                        {generatedAssets.map((asset, idx) => (
                            <div key={idx} className="activity-detail__asset-item">
                                <a
                                    href={asset.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="activity-detail__asset-link"
                                >
                                    <div className="activity-detail__asset-preview">
                                        {isSvgUrl(asset.url) ? (
                                            <SvgAsset
                                                url={asset.url}
                                                alt={formatAssetType(asset.type)}
                                                className="activity-detail__asset-svg"
                                            />
                                        ) : (
                                            <img
                                                src={asset.url}
                                                alt={formatAssetType(asset.type)}
                                                className="activity-detail__asset-image"
                                            />
                                        )}
                                    </div>
                                    <div className="activity-detail__asset-label">
                                        {formatAssetType(asset.type)}
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Pipeline Trace (Collapsible) */}
            {activity.pipelineExecution && activity.pipelineExecution.length > 0 && (
                <div className="activity-detail__trace-section">
                    <button
                        className="activity-detail__trace-toggle"
                        onClick={() => setTraceExpanded(!traceExpanded)}
                    >
                        <span className="activity-detail__trace-toggle-icon">
                            {traceExpanded ? '▼' : '▶'}
                        </span>
                        <span className="activity-detail__trace-toggle-text">
                            Pipeline Execution Trace
                        </span>
                        <span className="activity-detail__trace-toggle-count">
                            {activity.pipelineExecution.length} steps
                        </span>
                    </button>

                    {traceExpanded && (
                        <div className="activity-detail__trace-content">
                            <PipelineTrace
                                trace={activity.pipelineExecution}
                                pipelineExecutionId={activity.pipelineExecutionId}
                                isLoading={loading}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Metadata Footer */}
            <div className="activity-detail__metadata">
                <span className="activity-detail__metadata-item">
                    Synced: {formatDateTime(activity.syncedAt)}
                </span>
            </div>
        </PageLayout>
    );
};

export default ActivityDetailPage;
