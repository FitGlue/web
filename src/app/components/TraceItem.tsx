import React from 'react';
import { ExecutionRecord } from '../services/ActivitiesService';
import { StatusBadge } from './StatusBadge';
import { useNerdMode } from '../state/NerdModeContext';
import { Text } from './ui/Text';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { buildDestinationUrl } from '../utils/destinationUrls';

interface TraceItemProps {
    execution: ExecutionRecord;
    index: number;
}

// Helpers
const formatDuration = (start: string | null | undefined, end?: string | null): string => {
    if (!start || !end) return '';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
};

const humanizeServiceName = (service: string | undefined): string => {
    if (!service) return 'Unknown Service';
    if (service === 'enricher') return 'Data Enrichment';
    if (service === 'router') return 'Destination Router';

    return service
        .replace(/-handler$/, '')
        .replace(/-webhook$/, '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Convert snake_case to Readable Text
const humanizeKey = (key: string): string => {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Humanize enum values like "ENRICHER_PROVIDER_FITBIT_HEART_RATE" to "Fitbit Heart Rate"
const humanizeEnumValue = (value: string): string => {
    return value
        .replace(/^ENRICHER_PROVIDER_/, '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// JSON Truncation Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const truncateJson = (obj: any, depth = 0): any => {
    if (depth > 5) return '[Max Depth]';
    if (!obj) return obj;

    if (Array.isArray(obj)) {
        if (obj.length > 5) {
            const truncated = obj.slice(0, 5).map((item) => truncateJson(item, depth + 1));
            truncated.push(`... ${obj.length - 5} more items ...`);
            return truncated;
        }
        return obj.map((item) => truncateJson(item, depth + 1));
    }

    if (typeof obj === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newObj: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (['sessions', 'laps', 'records', 'points', 'heart_rate_stream', 'power_stream', 'position_lat_stream', 'position_long_stream'].includes(key) && Array.isArray(value)) {
                if (value.length > 3) {
                    const truncated = value.slice(0, 3).map((item) => truncateJson(item, depth + 1));
                    truncated.push(`... ${value.length - 3} more items ...`);
                    newObj[key] = truncated;
                } else {
                    newObj[key] = truncateJson(value, depth + 1);
                }
            } else {
                newObj[key] = truncateJson(value, depth + 1);
            }
        }
        return newObj;
    }
    return obj;
};

// Renderers
const NerdRenderer: React.FC<{ execution: ExecutionRecord }> = ({ execution }) => {
    return (
        <div className="trace-details">
            <div className="trace-meta">
                <span className="trace-time">{execution.timestamp ? new Date(execution.timestamp).toLocaleTimeString() : ''}</span>
                {execution.startTime && execution.endTime && (
                    <span className="trace-duration">Duration: {formatDuration(execution.startTime, execution.endTime)}</span>
                )}
                {execution.triggerType && (
                    <span className="trace-trigger">Trigger: {execution.triggerType}</span>
                )}
            </div>
            {execution.inputsJson && (
                <details className="trace-outputs">
                    <summary>Inputs</summary>
                    <pre className="trace-json">{(() => {
                        try {
                            const parsed = JSON.parse(execution.inputsJson);
                            const truncated = truncateJson(parsed);
                            return JSON.stringify(truncated, null, 2);
                        } catch {
                            return execution.inputsJson;
                        }
                    })()}</pre>
                </details>
            )}
            {execution.outputsJson && (
                <details className="trace-outputs">
                    <summary>Outputs</summary>
                    <pre className="trace-json">{(() => {
                        try {
                            const parsed = JSON.parse(execution.outputsJson);
                            const truncated = truncateJson(parsed);
                            return JSON.stringify(truncated, null, 2);
                        } catch {
                            return execution.outputsJson;
                        }
                    })()}</pre>
                </details>
            )}
        </div>
    );
};

const EnricherRenderer: React.FC<{ execution: ExecutionRecord }> = ({ execution }) => {
    let details: Record<string, unknown> = {};
    try {
        if (execution.outputsJson) {
            details = JSON.parse(execution.outputsJson);
        }
    } catch (e) {
        console.warn('Failed to parse enricher output', e);
    }

    // provider_executions is an ARRAY not a map
    const providerExecutions = details.provider_executions || [];

    return (
        <div className="trace-custom-content">
            {Array.isArray(providerExecutions) && providerExecutions.length > 0 && (
                <>
                    <Text variant="muted">
                        Ran {providerExecutions.length} enrichment provider{providerExecutions.length !== 1 ? 's' : ''}
                    </Text>
                    <div className="enricher-list">
                        {providerExecutions.map((providerExec: Record<string, unknown>, idx: number) => {
                            const metadata = (providerExec.Metadata as Record<string, unknown>) || {};
                            const metadataEntries = Object.entries(metadata);
                            // Status is a STRING: "SUCCESS", "FAILED", "SKIPPED"
                            const status = (typeof providerExec.Status === 'string' ? providerExec.Status.toUpperCase() : 'UNKNOWN');
                            const providerName = (typeof providerExec.ProviderName === 'string' ? providerExec.ProviderName : `Provider ${idx}`);

                            return (
                                <div key={idx} className={`enricher-item status-${status.toLowerCase()}`}>
                                    <div className="enricher-item-header">
                                        <span className="enricher-item-name">{humanizeServiceName(providerName)}</span>
                                        <span className={`enricher-status enricher-status-${status.toLowerCase()}`}>{status}</span>
                                    </div>
                                    {metadataEntries.length > 0 && (
                                        <div className="enricher-metadata">
                                            {metadataEntries.map(([key, value]) => (
                                                <div key={key} className="metadata-row">
                                                    <span className="metadata-key">{humanizeKey(key)}:</span>
                                                    <span className="metadata-value">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

const RouterRenderer: React.FC<{ execution: ExecutionRecord }> = ({ execution }) => {
    let details: Record<string, unknown> = {};
    try {
        if (execution.outputsJson) {
            details = JSON.parse(execution.outputsJson);
        }
    } catch (e) {
        console.warn('Failed to parse router output', e);
    }

    const routedDestinations = Array.isArray(details.routed_destinations) ? details.routed_destinations : [];
    const appliedEnrichments = Array.isArray(details.applied_enrichments) ? details.applied_enrichments : [];

    return (
        <div className="trace-custom-content">
             <Text>Routed to <strong>{routedDestinations.length}</strong> destination{routedDestinations.length !== 1 ? 's' : ''}</Text>
             {routedDestinations.length > 0 && (
                 <div className="router-destinations">
                     {routedDestinations.map((d: unknown, idx: number) => {
                         const dest = d as Record<string, unknown>;
                         return <span key={idx} className="destination-chip">{String(dest.destination || d)}</span>;
                     })}
                 </div>
             )}
             {appliedEnrichments.length > 0 && (
                <div className="applied-enrichments">
                   <Text variant="muted">
                       Applied: {appliedEnrichments.map((e: unknown) => humanizeEnumValue(String(e))).join(', ')}
                   </Text>
                </div>
             )}
        </div>
    );
};

/**
 * Generic destination uploader renderer that works for all destination types.
 * Uses registry-provided URL templates for linking to external activities.
 */
interface DestinationUploaderRendererProps {
    execution: ExecutionRecord;
    destinationId: string;
    externalIdKey: string;
    externalIdKeyAlt?: string;
    externalIdLabel: string;
}

const DestinationUploaderRenderer: React.FC<DestinationUploaderRendererProps> = ({
    execution,
    destinationId,
    externalIdKey,
    externalIdKeyAlt,
    externalIdLabel,
}) => {
    const { destinations } = usePluginRegistry();
    let details: Record<string, unknown> = {};
    try {
        if (execution.outputsJson) {
            details = JSON.parse(execution.outputsJson);
        }
    } catch (e) {
        console.warn(`Failed to parse ${destinationId} uploader output`, e);
    }

    // Try primary key first, then alternative key (e.g., strava_id vs strava_activity_id)
    const externalId = details[externalIdKey] || (externalIdKeyAlt ? details[externalIdKeyAlt] : undefined);
    const activityName = details.activity_name || details.name;
    const activityType = details.activity_type;
    const uploadStatus = details.upload_status || details.status;

    // Convert to strings for type safety
    const activityNameStr = activityName ? String(activityName) : null;
    const activityTypeStr = activityType ? String(activityType) : null;
    const externalIdStr = externalId ? String(externalId) : null;
    const uploadStatusStr = uploadStatus ? String(uploadStatus) : null;

    // Build URL from registry
    const externalUrl = externalIdStr
        ? buildDestinationUrl(destinations, destinationId, externalIdStr)
        : null;

    return (
        <div className="trace-custom-content">
            <div className="info-grid">
                {activityNameStr && (
                    <div className="info-row">
                        <span className="info-label">Activity:</span>
                        <span className="info-value">{activityNameStr}</span>
                    </div>
                )}
                {activityTypeStr && (
                    <div className="info-row">
                        <span className="info-label">Type:</span>
                        <span className="info-value">{activityTypeStr}</span>
                    </div>
                )}
                {externalIdStr && (
                    <div className="info-row">
                        <span className="info-label">{externalIdLabel}:</span>
                        <span className="info-value">
                            {externalUrl ? (
                                <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="external-link">
                                    {externalIdStr} ↗
                                </a>
                            ) : (
                                externalIdStr
                            )}
                        </span>
                    </div>
                )}
                {uploadStatusStr && uploadStatusStr !== 'SUCCESS' && (
                    <div className="info-row">
                        <span className="info-label">Status:</span>
                        <span className="info-value">{uploadStatusStr}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const WebhookRenderer: React.FC<{ execution: ExecutionRecord }> = ({ execution }) => {
    let inputDetails: Record<string, unknown> = {};
    let outputDetails: Record<string, unknown> = {};

    try {
        if (execution.inputsJson) {
            inputDetails = JSON.parse(execution.inputsJson);
        }
    } catch (e) {
        console.warn('Failed to parse webhook input', e);
    }

    try {
        if (execution.outputsJson) {
            outputDetails = JSON.parse(execution.outputsJson);
        }
    } catch (e) {
        console.warn('Failed to parse webhook output', e);
    }

    const payload = inputDetails.payload as Record<string, unknown> | undefined;
    const workoutId = payload?.workoutId || inputDetails.workoutId;
    const activityName = outputDetails.activity_name || outputDetails.name;
    const activityType = outputDetails.activity_type;

    // Convert to strings for type safety
    const workoutIdStr = workoutId ? String(workoutId) : null;
    const activityNameStr = activityName ? String(activityName) : null;
    const activityTypeStr = activityType ? String(activityType) : null;

    return (
        <div className="trace-custom-content">
            <div className="info-grid">
                {workoutIdStr && (
                    <div className="info-row">
                        <span className="info-label">Workout ID:</span>
                        <span className="info-value code">{workoutIdStr}</span>
                    </div>
                )}
                {activityNameStr && (
                    <div className="info-row">
                        <span className="info-label">Activity:</span>
                        <span className="info-value">{activityNameStr}</span>
                    </div>
                )}
                {activityTypeStr && (
                    <div className="info-row">
                        <span className="info-label">Type:</span>
                        <span className="info-value">{activityTypeStr}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export const TraceItem: React.FC<TraceItemProps> = ({ execution, index }) => {
    const { isNerdMode } = useNerdMode();
    const serviceName = humanizeServiceName(execution.service);

    const renderCustomContent = () => {
        if (execution.service === 'enricher') {
            return <EnricherRenderer execution={execution} />;
        }
        if (execution.service === 'router') {
             return <RouterRenderer execution={execution} />;
        }
        // Generic uploader detection: any service ending in '-uploader' is a destination
        // Derives destination ID from service name (e.g., 'strava-uploader' -> 'strava')
        if (execution.service?.endsWith('-uploader')) {
            const destinationId = execution.service.replace('-uploader', '');
            // External ID key follows pattern: {destination}_id or {destination}_activity_id
            const externalIdKey = `${destinationId}_id`;
            const externalIdKeyAlt = `${destinationId}_activity_id`;
            const label = `${destinationId.charAt(0).toUpperCase() + destinationId.slice(1)} ID`;
            return (
                <DestinationUploaderRenderer
                    execution={execution}
                    destinationId={destinationId}
                    externalIdKey={externalIdKey}
                    externalIdKeyAlt={externalIdKeyAlt}
                    externalIdLabel={label}
                />
            );
        }
        if (execution.service?.includes('webhook') || execution.service?.includes('-handler')) {
            return <WebhookRenderer execution={execution} />;
        }
        return null;
    };

    const customContent = renderCustomContent();
    const hasCustomContent = customContent !== null;

    return (
        <div className={`trace-item status-${execution.status?.toLowerCase()}`}>
            <div className="trace-step-number">{index + 1}</div>
            <div className="trace-content">
                <div className="trace-header">
                    <span className="trace-service">{serviceName}</span>
                    <StatusBadge status={execution.status || 'UNKNOWN'} />
                </div>

                {execution.errorMessage && <div className="trace-error">{execution.errorMessage}</div>}

                {!isNerdMode && hasCustomContent && customContent}
                {(isNerdMode || !hasCustomContent) && <NerdRenderer execution={execution} />}
            </div>
        </div>
    );
};
