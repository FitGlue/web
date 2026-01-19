import React from 'react';
import { SynchronizedActivity, ExecutionRecord } from '../../services/ActivitiesService';
import { EnricherBadge } from './EnricherBadge';
import { Card } from '../ui/Card';
import { formatActivityType } from '../../../types/pb/enum-formatters';

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
 * Get the destination activity type from pipeline outputs
 * This is the type the activity will appear as in the destination (e.g., "Run", "Ride")
 */
const getDestinationActivityType = (pipelineExecution?: ExecutionRecord[]): string | null => {
    if (!pipelineExecution) return null;

    // Try strava-uploader first, then router, then any webhook/handler
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

    // Fallback: check any webhook/handler
    const webhookRecord = pipelineExecution.find(r =>
        r.service?.includes('webhook') || r.service?.includes('-handler')
    );
    if (webhookRecord?.outputsJson) {
        try {
            const outputs = JSON.parse(webhookRecord.outputsJson);
            if (outputs.activity_type) return String(outputs.activity_type);
        } catch {
            // ignore
        }
    }

    return null;
};

/**
 * Format source name for display
 */
const formatSourceName = (source: string): string => {
    const names: Record<string, string> = {
        hevy: 'Hevy',
        strava: 'Strava',
        fitbit: 'Fitbit',
        garmin: 'Garmin',
        apple: 'Apple Health',
        showcase: 'Showcase',
    };
    return names[source.toLowerCase()] || source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
};

/**
 * EnrichedActivityCard shows the magic flow: Source → Boosters → Destination
 * A clean, full-width card that highlights the transformation journey.
 */
export const EnrichedActivityCard: React.FC<EnrichedActivityCardProps> = ({
    activity,
    onClick,
}) => {
    const providerExecutions = extractEnricherExecutions(activity.pipelineExecution);
    const enrichedTitle = getEnrichedTitle(activity.pipelineExecution);
    const destinationActivityType = getDestinationActivityType(activity.pipelineExecution);
    const hasDetailedData = activity.pipelineExecution && activity.pipelineExecution.length > 0;

    const activityTitle = enrichedTitle || activity.title || 'Untitled Activity';
    const titleWasEnhanced = enrichedTitle && enrichedTitle !== activity.title;

    // Use destination type if available, otherwise fall back to source type
    const activityType = destinationActivityType
        ? formatActivityType(destinationActivityType)
        : formatActivityType(activity.type);
    const syncDate = activity.syncedAt
        ? new Date(activity.syncedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
          })
        : null;

    // Source and destination info
    const sourceName = formatSourceName(activity.source);
    const destinations = activity.destinations ? Object.keys(activity.destinations) : [];
    const destinationNames = destinations.map(d => formatSourceName(d));

    return (
        <Card
            className={`enriched-activity-card ${hasDetailedData ? 'has-enrichments' : 'synced-only'}`}
            onClick={onClick}
        >
            {/* Main Activity Header */}
            <div className="enriched-activity-card__header">
                <div className="enriched-activity-card__title-section">
                    <span className="enriched-activity-card__type-badge">{activityType}</span>
                    <h4 className="enriched-activity-card__title">
                        {activityTitle}
                        {titleWasEnhanced && <span className="enriched-activity-card__enhanced-indicator">✨</span>}
                    </h4>
                </div>
                {syncDate && <span className="enriched-activity-card__date">{syncDate}</span>}
            </div>

            {/* Flow Visualization: Source → Boosters → Destination */}
            <div className="enriched-activity-card__flow">
                {/* Source */}
                <div className="enriched-activity-card__flow-node enriched-activity-card__flow-node--source">
                    <span className="enriched-activity-card__flow-icon">📥</span>
                    <span className="enriched-activity-card__flow-label">{sourceName}</span>
                </div>

                <span className="enriched-activity-card__flow-arrow">→</span>

                {/* Boosters Applied */}
                <div className="enriched-activity-card__flow-center">
                    <div className="enriched-activity-card__boosters">
                        {providerExecutions.length > 0 ? (
                            providerExecutions.map((exec, idx) => (
                                <EnricherBadge
                                    key={idx}
                                    providerName={exec.ProviderName}
                                    status={exec.Status}
                                    metadata={exec.Metadata}
                                />
                            ))
                        ) : (
                            <span className="enriched-activity-card__no-boosters">No boosters applied</span>
                        )}
                    </div>
                </div>

                <span className="enriched-activity-card__flow-arrow">→</span>

                {/* Destination */}
                <div className="enriched-activity-card__flow-node enriched-activity-card__flow-node--destination">
                    <span className="enriched-activity-card__flow-icon">🚀</span>
                    {destinationNames.length > 0 ? (
                        <span className="enriched-activity-card__flow-label">{destinationNames.join(', ')}</span>
                    ) : (
                        <span className="enriched-activity-card__flow-label enriched-activity-card__flow-label--pending">
                            Pending upload
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};
