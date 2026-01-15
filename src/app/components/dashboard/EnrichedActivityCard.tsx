import React from 'react';
import { SynchronizedActivity, ExecutionRecord } from '../../services/ActivitiesService';
import { EnricherBadge } from './EnricherBadge';
import { Card } from '../ui/Card';

interface EnrichedActivityCardProps {
    activity: SynchronizedActivity;
    onClick?: () => void;
}

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

/**
 * Extract enricher executions from pipeline execution records (if available)
 */
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
 * Get the enriched title from router outputs if available
 */
const getEnrichedTitle = (pipelineExecution?: ExecutionRecord[]): string | null => {
    if (!pipelineExecution) return null;

    // Try router first, then strava-uploader
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

/**
 * Format activity type from enum number to readable string
 */
const formatActivityType = (type?: number): string => {
    const types: Record<number, string> = {
        0: 'Unknown',
        1: 'Run',
        2: 'Ride',
        3: 'Swim',
        4: 'Walk',
        5: 'Hike',
        6: 'Strength',
        7: 'Workout',
    };
    return types[type ?? 0] || 'Activity';
};

/**
 * EnrichedActivityCard shows a before/after comparison for a synced activity.
 * Works with both list-level data (minimal) and single activity data (with pipelineExecution).
 */
export const EnrichedActivityCard: React.FC<EnrichedActivityCardProps> = ({
    activity,
    onClick,
}) => {
    const providerExecutions = extractEnricherExecutions(activity.pipelineExecution);
    const enrichedTitle = getEnrichedTitle(activity.pipelineExecution);
    const successfulEnrichers = providerExecutions.filter(p => p.Status?.toUpperCase() === 'SUCCESS');
    const hasDetailedData = activity.pipelineExecution && activity.pipelineExecution.length > 0;

    const activityTitle = activity.title || 'Untitled Activity';
    const finalTitle = enrichedTitle || activityTitle;
    const titleChanged = enrichedTitle && enrichedTitle !== activityTitle;

    const activityType = formatActivityType(activity.type);
    const syncDate = activity.syncedAt
        ? new Date(activity.syncedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
          })
        : null;

    // Check for destinations (synced to external services)
    const destinations = activity.destinations ? Object.keys(activity.destinations) : [];
    const hasDestinations = destinations.length > 0;

    // Check for heatmap metadata (only available with detailed data)
    const heatmapExec = successfulEnrichers.find(p => p.ProviderName === 'muscle-heatmap');
    const hasHeatmap = !!heatmapExec;

    return (
        <Card
            className={`enriched-activity-card ${hasDetailedData ? 'has-enrichments' : 'synced-only'}`}
            onClick={onClick}
        >
            <div className="enriched-activity-card__content">
                {/* Before State */}
                <div className="enriched-activity-card__before">
                    <span className="enriched-activity-card__label">Before</span>
                    <div className="enriched-activity-card__state">
                        <span className="enriched-activity-card__type-badge">{activityType}</span>
                        <span className="enriched-activity-card__title enriched-activity-card__title--muted">
                            {activityTitle}
                        </span>
                        <div className="enriched-activity-card__placeholder">
                            <span className="enriched-activity-card__placeholder-icon">📋</span>
                            <span className="enriched-activity-card__placeholder-text">Raw activity data</span>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="enriched-activity-card__arrow">
                    <span className="enriched-activity-card__arrow-icon">→</span>
                </div>

                {/* After State */}
                <div className="enriched-activity-card__after">
                    <span className="enriched-activity-card__label">After</span>
                    <div className="enriched-activity-card__state">
                        <span className="enriched-activity-card__type-badge enriched-activity-card__type-badge--enhanced">
                            {activityType}
                        </span>
                        <span className={`enriched-activity-card__title ${titleChanged ? 'enriched-activity-card__title--enhanced' : ''}`}>
                            {finalTitle}
                            {titleChanged && <span className="enriched-activity-card__enhanced-indicator">✨</span>}
                        </span>
                        {hasHeatmap ? (
                            <div className="enriched-activity-card__heatmap-preview">
                                <span className="enriched-activity-card__heatmap-icon">💪</span>
                                <span className="enriched-activity-card__heatmap-text">
                                    Muscle Heatmap Generated
                                </span>
                            </div>
                        ) : hasDestinations ? (
                            <div className="enriched-activity-card__destinations">
                                <span className="enriched-activity-card__destination-icon">🚀</span>
                                <span className="enriched-activity-card__destination-text">
                                    Synced to {destinations.join(', ')}
                                </span>
                            </div>
                        ) : (
                            <div className="enriched-activity-card__metrics">
                                <span className="enriched-activity-card__metric">
                                    ✅ Processed by FitGlue
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enrichment Timeline (only shown with detailed data) */}
            {providerExecutions.length > 0 && (
                <div className="enriched-activity-card__timeline">
                    <span className="enriched-activity-card__timeline-label">Applied Boosters:</span>
                    <div className="enriched-activity-card__badges">
                        {providerExecutions.map((exec, idx) => (
                            <EnricherBadge
                                key={idx}
                                providerName={exec.ProviderName}
                                status={exec.Status}
                                metadata={exec.Metadata}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="enriched-activity-card__footer">
                <span className="enriched-activity-card__source">{activity.source}</span>
                {syncDate && <span className="enriched-activity-card__date">{syncDate}</span>}
            </div>
        </Card>
    );
};
