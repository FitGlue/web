import React from 'react';
import { SynchronizedActivity, ExecutionRecord } from '../../services/ActivitiesService';
import { EnricherBadge } from './EnricherBadge';
import { Card } from '../ui/Card';
import { formatActivityType, formatDestination } from '../../../types/pb/enum-formatters';
import { usePipelines } from '../../hooks/usePipelines';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import { PluginManifest } from '../../types/plugin';

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
 * Extract destination upload statuses from pipeline execution trace.
 * Looks for services ending in '-uploader' (e.g., 'strava-uploader') and extracts their status.
 * Returns a map of destination name to status ('SUCCESS', 'FAILED', etc.)
 */
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

/**
 * Get platform name and icon from registry.
 * Searches sources and destinations for matching plugin.
 */
const getPlatformInfo = (
    platform: string,
    sources: PluginManifest[],
    destinations: PluginManifest[]
): { name: string; icon: string } => {
    const key = platform.toLowerCase();
    const allPlugins = [...sources, ...destinations];
    const plugin = allPlugins.find(p => p.id === key);

    const name = plugin?.name || formatDestination(platform);
    const icon = plugin?.icon || '📱';

    return { name, icon };
};

/**
 * EnrichedActivityCard shows the magic flow: Source → Boosters → Destination
 * A clean, full-width card that highlights the transformation journey.
 */
export const EnrichedActivityCard: React.FC<EnrichedActivityCardProps> = ({
    activity,
    onClick,
}) => {
    const { pipelines } = usePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();
    const providerExecutions = extractEnricherExecutions(activity.pipelineExecution);
    const enrichedTitle = getEnrichedTitle(activity.pipelineExecution);
    const destinationActivityType = getDestinationActivityType(activity.pipelineExecution);
    const destinationStatuses = extractDestinationStatuses(activity.pipelineExecution);
    const hasDetailedData = activity.pipelineExecution && activity.pipelineExecution.length > 0;

    const activityTitle = enrichedTitle || activity.title || 'Untitled Activity';
    const titleWasEnhanced = enrichedTitle && enrichedTitle !== activity.title;

    // Use destination type if available, otherwise fall back to source type
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

    // Source and destination info with registry icons
    const sourceInfo = getPlatformInfo(activity.source || 'unknown', sources, registryDestinations);
    const destinations = activity.destinations ? Object.keys(activity.destinations) : [];

    // Look up pipeline name by ID
    const pipelineName = activity.pipelineId
        ? pipelines.find(p => p.id === activity.pipelineId)?.name
        : undefined;

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
                    {pipelineName && (
                        <span className="enriched-activity-card__pipeline-name">via {pipelineName}</span>
                    )}
                </div>
                {syncDate && <span className="enriched-activity-card__date">{syncDate}</span>}
            </div>

            {/* Flow Visualization: Source → Boosters → Destination */}
            <div className="enriched-activity-card__flow">
                {/* Source */}
                <div className="enriched-activity-card__flow-node enriched-activity-card__flow-node--source">
                    <span className="enriched-activity-card__flow-icon">{sourceInfo.icon}</span>
                    <span className="enriched-activity-card__flow-label">{sourceInfo.name}</span>
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
                        ) : !activity.pipelineExecution ? (
                            <div className="enriched-activity-card__boosters-loading">
                                <div className="shimmer-box" style={{ width: '60px', height: '20px' }}></div>
                                <div className="shimmer-box" style={{ width: '40px', height: '20px' }}></div>
                            </div>
                        ) : (
                            <span className="enriched-activity-card__no-boosters">No boosters applied</span>
                        )}
                    </div>
                </div>

                <span className="enriched-activity-card__flow-arrow">→</span>

                {/* Destinations with status and icons */}
                <div className="enriched-activity-card__flow-node enriched-activity-card__flow-node--destination">
                    {destinations.length > 0 ? (
                        <div className="enriched-activity-card__destinations">
                            {destinations.map(dest => {
                                const status = destinationStatuses[dest];
                                const isFailed = status === 'FAILED';
                                const destInfo = getPlatformInfo(dest, sources, registryDestinations);
                                return (
                                    <span
                                        key={dest}
                                        className={`enriched-activity-card__destination ${isFailed ? 'enriched-activity-card__destination--failed' : ''}`}
                                    >
                                        <span className="enriched-activity-card__destination-icon">{destInfo.icon}</span>
                                        {destInfo.name}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <>
                            <span className="enriched-activity-card__flow-icon">🚀</span>
                            <span className="enriched-activity-card__flow-label enriched-activity-card__flow-label--pending">
                                Pending upload
                            </span>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};
