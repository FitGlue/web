import React from 'react';
import { ExecutionRecord } from '../services/ActivitiesService';
import { StatusPill } from './library/ui/StatusPill';
import { humanizeServiceName, humanizeKey, humanizeEnumValue } from '../utils/formatters';
import { Text } from './library/ui/Text';
import { Stack } from './library/layout/Stack';
import { Badge } from './library/ui/Badge';
import { Link } from './library/navigation/Link';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { buildDestinationUrl } from '../utils/destinationUrls';
import './TraceItem.css';

interface TraceItemProps {
    execution: ExecutionRecord;
    index: number;
}

// Renderers
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
        <Stack gap="sm">
            {Array.isArray(providerExecutions) && providerExecutions.length > 0 && (
                <>
                    <Text variant="muted">
                        Ran {providerExecutions.length} enrichment provider{providerExecutions.length !== 1 ? 's' : ''}
                    </Text>
                    <Stack gap="xs">
                        {providerExecutions.map((providerExec: Record<string, unknown>, idx: number) => {
                            const metadata = (providerExec.Metadata as Record<string, unknown>) || {};
                            const metadataEntries = Object.entries(metadata);
                            // Status is a STRING: "SUCCESS", "FAILED", "SKIPPED"
                            // But check metadata for enrichers that report their internal status
                            // Some use generic "status" key, others use prefixed like "cadence_summary_status"
                            let status = (typeof providerExec.Status === 'string' ? providerExec.Status.toUpperCase() : 'UNKNOWN');

                            // Find status from metadata - check for any key that is exactly "status" or ends with "_status"
                            let metadataStatus: string | null = null;
                            for (const [key, val] of Object.entries(metadata)) {
                                if ((key === 'status' || key.endsWith('_status')) && typeof val === 'string') {
                                    metadataStatus = val.toLowerCase();
                                    break;
                                }
                            }

                            if (status === 'SUCCESS' && metadataStatus) {
                                // Override execution status with metadata status if more specific
                                if (metadataStatus === 'error') {
                                    status = 'ERROR';
                                } else if (metadataStatus === 'skipped') {
                                    status = 'SKIPPED';
                                }
                                // 'success' in metadata means truly successful, no override needed
                            }
                            const providerName = (typeof providerExec.ProviderName === 'string' ? providerExec.ProviderName : `Provider ${idx}`);
                            const badgeVariant = status === 'SUCCESS' ? 'success' : status === 'ERROR' ? 'error' : status === 'SKIPPED' ? 'warning' : 'default';

                            return (
                                <Stack key={idx} gap="xs">
                                    <Stack direction="horizontal" gap="sm" align="center">
                                        <Text>{humanizeServiceName(providerName)}</Text>
                                        <Badge variant={badgeVariant} size="sm">{status}</Badge>
                                    </Stack>
                                    {metadataEntries.length > 0 && (
                                        <Stack gap="xs">
                                            {metadataEntries.map(([key, value]) => (
                                                <Text key={key} variant="small">{humanizeKey(key)}: {String(value)}</Text>
                                            ))}
                                        </Stack>
                                    )}
                                </Stack>
                            );
                        })}
                    </Stack>
                </>
            )}
        </Stack>
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
        <Stack gap="sm">
             <Text>Routed to <strong>{routedDestinations.length}</strong> destination{routedDestinations.length !== 1 ? 's' : ''}</Text>
             {routedDestinations.length > 0 && (
                 <Stack direction="horizontal" gap="sm" wrap>
                     {routedDestinations.map((d: unknown, idx: number) => {
                         const dest = d as Record<string, unknown>;
                         return <Badge key={idx} variant="info">{String(dest.destination || d)}</Badge>;
                     })}
                 </Stack>
             )}
             {appliedEnrichments.length > 0 && (
                <Text variant="muted">
                    Applied: {appliedEnrichments.map((e: unknown) => humanizeEnumValue(String(e))).join(', ')}
                </Text>
             )}
        </Stack>
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
        <Stack gap="xs">
            {activityNameStr && (
                <Text variant="small">Activity: {activityNameStr}</Text>
            )}
            {activityTypeStr && (
                <Text variant="small">Type: {activityTypeStr}</Text>
            )}
            {externalIdStr && (
                <Text variant="small">
                    {externalIdLabel}:{' '}
                    {externalUrl ? (
                        <Link to={externalUrl} external>
                            {externalIdStr} ↗
                        </Link>
                    ) : (
                        externalIdStr
                    )}
                </Text>
            )}
            {uploadStatusStr && uploadStatusStr !== 'SUCCESS' && (
                <Text variant="small">Status: {uploadStatusStr}</Text>
            )}
        </Stack>
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
        <Stack gap="xs">
            {workoutIdStr && (
                <Text variant="small">Workout ID: {workoutIdStr}</Text>
            )}
            {activityNameStr && (
                <Text variant="small">Activity: {activityNameStr}</Text>
            )}
            {activityTypeStr && (
                <Text variant="small">Type: {activityTypeStr}</Text>
            )}
        </Stack>
    );
};

export const TraceItem: React.FC<TraceItemProps> = ({ execution, index }) => {
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

    const isEnricher = execution.service === 'enricher';

    return (
        <div className={`trace-item${isEnricher ? ' trace-item--enricher' : ''}`}>
            <span className="trace-item__ordinal">{String(index + 1).padStart(2, '0')}</span>
            <div className="trace-item__body">
                <span className="trace-item__service">{serviceName}</span>
                {execution.errorMessage && (
                    <span className="trace-item__error">{execution.errorMessage}</span>
                )}
                {customContent && (
                    <div className="trace-item__detail">{customContent}</div>
                )}
            </div>
            <div className="trace-item__meta">
                <StatusPill status={execution.status || 'UNKNOWN'} />
            </div>
        </div>
    );
};
