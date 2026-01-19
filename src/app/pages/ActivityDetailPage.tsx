import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { usePipelines } from '../hooks/usePipelines';
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
import './ActivityDetailPage.css';

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

// Helper to derive original trigger source from pipeline execution trace
const deriveOriginalSource = (activity: SynchronizedActivity): string => {
    if (activity.pipelineExecution && activity.pipelineExecution.length > 0) {
        const firstService = activity.pipelineExecution[0].service;
        if (firstService) {
            if (firstService.includes('fitbit')) return 'Fitbit';
            if (firstService.includes('hevy')) return 'Hevy';
            if (firstService.includes('mock')) return 'Mock Source';
            if (firstService.includes('test')) return 'Test';
            return firstService.replace(/-handler$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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

// Get destination activity type from pipeline outputs
const getDestinationActivityType = (pipelineExecution?: ExecutionRecord[]): string | null => {
    if (!pipelineExecution) return null;

    for (const service of ['strava-uploader', 'router']) {
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



// Format source/destination name
const formatPlatformName = (platform: string): { name: string; icon: string } => {
    const platforms: Record<string, { name: string; icon: string }> = {
        hevy: { name: 'Hevy', icon: '📋' },
        strava: { name: 'Strava', icon: '🏃' },
        fitbit: { name: 'Fitbit', icon: '⌚' },
        garmin: { name: 'Garmin', icon: '📍' },
        apple: { name: 'Apple Health', icon: '🍎' },
        showcase: { name: 'Showcase', icon: '🔗' },
    };
    return platforms[platform.toLowerCase()] || {
        name: platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase(),
        icon: '📱'
    };
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
    const sourceInfo = formatPlatformName(originalSource);
    const destinations = activity.destinations ? Object.entries(activity.destinations) : [];
    const providerExecutions = extractEnricherExecutions(activity.pipelineExecution);
    const destinationActivityType = getDestinationActivityType(activity.pipelineExecution);
    const activityType = destinationActivityType
        ? formatActivityType(destinationActivityType)
        : formatActivityType(activity.type);

    const failedBoosters = providerExecutions.filter(p => p.Status?.toUpperCase() === 'FAILED');

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
                        {pipelineName && (
                            <span className="activity-detail__pipeline-name">via {pipelineName}</span>
                        )}
                        <span className="activity-detail__type-badge">{activityType}</span>
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
                                const destInfo = formatPlatformName(platform);
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
                            const destInfo = formatPlatformName(platform);
                            const activityIdStr = String(activityId);
                            let externalUrl = '';
                            if (platform.toLowerCase() === 'strava') {
                                externalUrl = `https://www.strava.com/activities/${activityIdStr}`;
                            } else if (platform.toLowerCase() === 'showcase') {
                                const hostname = window.location.hostname;
                                let showcaseDomain: string;
                                if (hostname.includes('dev.fitglue') || hostname === 'localhost') {
                                    showcaseDomain = 'dev.fitglue.tech';
                                } else if (hostname.includes('test.fitglue')) {
                                    showcaseDomain = 'test.fitglue.tech';
                                } else {
                                    showcaseDomain = 'fitglue.tech';
                                }
                                externalUrl = `https://${showcaseDomain}/showcase/${activityIdStr}`;
                            }

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
