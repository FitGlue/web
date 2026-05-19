import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EnricherBadge } from './EnricherBadge';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import { PluginManifest } from '../../types/plugin';
import { BoosterExecution, PipelineRun, PipelineRunStatus } from '../../../types/pb/user';
import { formatActivityType, formatActivitySource, formatDestination, formatDestinationStatus } from '../../../types/pb/enum-formatters';
import './EnrichedActivityCard.css';

interface EnrichedActivityCardProps {
    /** PipelineRun from pipeline_runs collection */
    pipelineRun: PipelineRun;
    onClick?: () => void;
}

interface ProviderExecution {
    ProviderName: string;
    Status: string;
    Metadata?: Record<string, unknown>;
}

/** Convert PipelineRun.boosters to ProviderExecution format for display */
const mapBoostersToExecutions = (boosters?: BoosterExecution[]): ProviderExecution[] => {
    if (!boosters || boosters.length === 0) return [];
    return boosters.map(b => ({
        ProviderName: b.providerName,
        Status: b.status,
        Metadata: b.metadata as Record<string, unknown>,
    }));
};

const getSourceInfo = (source: string, sources: PluginManifest[]): { name: string; icon: string } => {
    const key = source.replace(/^SOURCE_/, '').toLowerCase();
    const plugin = sources.find(p => p.id === key);
    return {
        name: plugin?.name || formatActivitySource(source) || source,
        icon: plugin?.icon || '📱',
    };
};

const getDestinationInfo = (
    destinationKey: string,
    destinations: PluginManifest[],
    formattedName?: string
): { name: string; icon: string } => {
    const key = destinationKey.toLowerCase();
    const plugin = destinations.find(p => p.id === key);
    return {
        name: plugin?.name || formattedName || formatDestination(destinationKey) || destinationKey,
        icon: plugin?.icon || '🚀',
    };
};

/** Map status → stamp modifier for the status pill */
const getStatusStamp = (status?: PipelineRunStatus): { cls: string; label: string } => {
    switch (status) {
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED:
            return { cls: 'fg-stamp fg-stamp--green', label: '✓ SYNCED' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL:
            return { cls: 'fg-stamp fg-stamp--gold', label: '⚠ PARTIAL' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED:
            return { cls: 'fg-stamp fg-stamp--rose', label: '✕ FAILED' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING:
            return { cls: 'fg-stamp fg-stamp--violet', label: '⟳ RUNNING' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING:
            return { cls: 'fg-stamp fg-stamp--gold', label: '⏳ PENDING' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED:
            return { cls: 'fg-stamp fg-stamp--ink', label: '⏭ SKIPPED' };
        case PipelineRunStatus.PIPELINE_RUN_STATUS_TIER_BLOCKED:
            return { cls: 'fg-stamp fg-stamp--rose', label: '🔒 UPGRADE' };
        default:
            return { cls: 'fg-stamp fg-stamp--ink', label: 'UNKNOWN' };
    }
};

const isTierBlocked = (status?: PipelineRunStatus) =>
    status === PipelineRunStatus.PIPELINE_RUN_STATUS_TIER_BLOCKED;

/**
 * EnrichedActivityCard — Brutal × Aurora reskin
 * fg-band--sm header strip, booster chip strip, aurora-cyan metrics
 */
export const EnrichedActivityCard: React.FC<EnrichedActivityCardProps> = ({
    pipelineRun,
    onClick,
}) => {
    const navigate = useNavigate();
    const { pipelines } = useRealtimePipelines();
    const { sources, destinations: registryDestinations } = usePluginRegistry();

    const providerExecutions = mapBoostersToExecutions(pipelineRun.boosters);

    const destinationStatuses: Record<string, string> = pipelineRun.destinations
        ? pipelineRun.destinations.reduce((acc, d) => {
            const destName = formatDestination(d.destination) || 'Unknown';
            acc[destName] = formatDestinationStatus(d.status) || 'Unknown';
            return acc;
        }, {} as Record<string, string>)
        : {};

    const activityTitle = pipelineRun.title || 'Untitled Activity';
    const activityType = formatActivityType(pipelineRun.type);
    const syncDate = pipelineRun.createdAt
        ? new Date(pipelineRun.createdAt).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        })
        : null;

    const sourceInfo = getSourceInfo(pipelineRun.source || 'unknown', sources);
    const destinations = pipelineRun.destinations?.map(d => formatDestination(d.destination) || 'Unknown') || [];
    const pipelineName = pipelineRun.pipelineId
        ? pipelines.find((p: { id: string }) => p.id === pipelineRun.pipelineId)?.name
        : undefined;

    const stamp = getStatusStamp(pipelineRun.status);
    const tierBlocked = isTierBlocked(pipelineRun.status);

    // Destination status helpers
    const successDests = destinations.filter(d => destinationStatuses[d] === 'Success');
    const pendingDests = destinations.filter(d =>
        destinationStatuses[d] === 'Pending' || !destinationStatuses[d]);
    const failedDests = destinations.filter(d => destinationStatuses[d] === 'Failed');
    const skippedDests = destinations.filter(d => destinationStatuses[d] === 'Skipped');

    return (
        <div
            className="enriched-activity-card"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        >
            {/* Header strip — fg-band--sm style */}
            <div className="enriched-activity-card__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    {/* Activity type stamp */}
                    <span className="fg-stamp">{activityType}</span>
                    {/* Title */}
                    <span className="enriched-activity-card__title">{activityTitle}</span>
                    {/* Pipeline name */}
                    {pipelineName && (
                        <span className="enriched-activity-card__pipeline">via {pipelineName}</span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {/* Status stamp */}
                    <span className={stamp.cls}>{stamp.label}</span>
                    {/* Date in mono */}
                    {syncDate && <span className="enriched-activity-card__date">{syncDate}</span>}
                </div>
            </div>

            {/* Body — source → boosters → destinations */}
            <div className="enriched-activity-card__body">
                <div className="enriched-activity-card__flow">
                    {/* Source */}
                    <span className="enriched-activity-card__source">
                        <span className="fg-booster-chip fg-booster-chip--sm">
                            <span className="fg-booster-chip__emoji">{sourceInfo.icon}</span>
                            {sourceInfo.name}
                        </span>
                    </span>

                    {/* Arrow */}
                    <span className="enriched-activity-card__arrow">→</span>

                    {/* Booster pills */}
                    {providerExecutions.length > 0 && (
                        <span className="enriched-activity-card__boosters">
                            {providerExecutions.map((exec, idx) => (
                                <EnricherBadge
                                    key={idx}
                                    providerName={exec.ProviderName}
                                    status={exec.Status}
                                    metadata={exec.Metadata}
                                />
                            ))}
                        </span>
                    )}

                    {/* Arrow to destinations */}
                    {destinations.length > 0 && (
                        <>
                            <span className="enriched-activity-card__arrow">→</span>
                            {/* Destinations */}
                            <span className="enriched-activity-card__destinations" style={{ display: 'flex', gap: '0.3125rem', flexWrap: 'wrap' }}>
                                {successDests.map(dest => {
                                    const info = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                                    return (
                                        <span key={dest} className="fg-booster-chip fg-booster-chip--done fg-booster-chip--sm">
                                            <span className="fg-booster-chip__emoji">{info.icon}</span>
                                            {info.name}
                                        </span>
                                    );
                                })}
                                {pendingDests.map(dest => {
                                    const info = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                                    return (
                                        <span key={dest} className="fg-booster-chip fg-booster-chip--sm" style={{ opacity: 0.55 }}>
                                            <span className="fg-booster-chip__emoji">⏳</span>
                                            {info.name}
                                        </span>
                                    );
                                })}
                                {failedDests.map(dest => {
                                    const info = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                                    return (
                                        <span key={dest} className="fg-booster-chip fg-booster-chip--sm" style={{ background: 'var(--fg-rose)', color: 'var(--fg-paper)' }}>
                                            <span className="fg-booster-chip__emoji">✕</span>
                                            {info.name}
                                        </span>
                                    );
                                })}
                                {skippedDests.map(dest => {
                                    const info = getDestinationInfo(dest.toLowerCase(), registryDestinations, dest);
                                    return (
                                        <span key={dest} className="fg-booster-chip fg-booster-chip--queued fg-booster-chip--sm">
                                            <span className="fg-booster-chip__emoji">⏭</span>
                                            {info.name}
                                        </span>
                                    );
                                })}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Tier blocked upgrade CTA */}
            {tierBlocked && (
                <div className="enriched-activity-card__status-msg">
                    🔒 {pipelineRun.statusMessage || 'Monthly sync limit reached.'}
                    {' '}
                    <button
                        className="fg-button fg-button--sm"
                        onClick={(e) => { e.stopPropagation(); navigate('/settings/subscription'); }}
                        style={{ marginLeft: '0.75rem' }}
                    >
                        Upgrade →
                    </button>
                </div>
            )}

            {/* Non-terminal status message */}
            {!tierBlocked && pipelineRun?.statusMessage &&
                pipelineRun.status !== PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED && (
                    <div className="enriched-activity-card__status-msg">
                        ℹ {pipelineRun.statusMessage}
                    </div>
                )}
        </div>
    );
};
