import React from 'react';
import { PipelineRun, PipelineRunStatus } from '../../../../types/pb/user';
import { ActivityType } from '../../../../types/pb/standardized_activity';
import { formatActivityType } from '../../../../types/pb/enum-formatters';
import './RunRow.css';

export interface RunRowProps {
    run: PipelineRun;
    /** feed: full-width hairline row (ActivitiesListPage). dashboard: compact 2-line (DashboardPage). detail: with diff link. */
    variant?: 'feed' | 'dashboard' | 'detail';
    pipelineName?: string;
    onClick?: () => void;
    onDiffClick?: (e: React.MouseEvent) => void;
}

function getTypeClass(type?: ActivityType): string {
    switch (type) {
        case ActivityType.ACTIVITY_TYPE_RIDE:
        case ActivityType.ACTIVITY_TYPE_VIRTUAL_RIDE:
        case ActivityType.ACTIVITY_TYPE_GRAVEL_RIDE:
        case ActivityType.ACTIVITY_TYPE_MOUNTAIN_BIKE_RIDE:
        case ActivityType.ACTIVITY_TYPE_EBIKE_RIDE:
        case ActivityType.ACTIVITY_TYPE_EMOUNTAIN_BIKE_RIDE:
            return 'run-row__type--cyan';
        case ActivityType.ACTIVITY_TYPE_RUN:
        case ActivityType.ACTIVITY_TYPE_TRAIL_RUN:
        case ActivityType.ACTIVITY_TYPE_VIRTUAL_RUN:
            return 'run-row__type--pink';
        case ActivityType.ACTIVITY_TYPE_PILATES:
        case ActivityType.ACTIVITY_TYPE_YOGA:
        case ActivityType.ACTIVITY_TYPE_WEIGHT_TRAINING:
            return 'run-row__type--violet';
        default:
            return 'run-row__type--ink3';
    }
}

function getStatusClass(status?: PipelineRunStatus): string {
    switch (status) {
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED:
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL:
            return 'run-row__pill--ok';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED:
            return 'run-row__pill--skip';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED:
        case PipelineRunStatus.PIPELINE_RUN_STATUS_TIER_BLOCKED:
            return 'run-row__pill--fail';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING:
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING:
            return 'run-row__pill--pending';
        default:
            return 'run-row__pill--skip';
    }
}

function getStatusLabel(status?: PipelineRunStatus): string {
    switch (status) {
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED: return 'SYNCED';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL: return 'PARTIAL';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED: return 'FAILED';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING: return 'RUNNING';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING: return 'PENDING';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED: return 'SKIPPED';
        case PipelineRunStatus.PIPELINE_RUN_STATUS_TIER_BLOCKED: return 'UPGRADE';
        default: return 'UNKNOWN';
    }
}

export const RunRow: React.FC<RunRowProps> = ({ run, variant = 'feed', pipelineName, onClick, onDiffClick }) => {
    const activityType = formatActivityType(run.type) || 'ACTIVITY';
    const title = run.title || 'Untitled Activity';
    const boosterCount = run.boosters?.length ?? 0;
    const destCount = run.destinations?.length ?? 0;
    const typeClass = getTypeClass(run.type as ActivityType);

    const timestamp = run.createdAt
        ? new Date(run.createdAt).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        })
        : null;

    const interactiveProps = onClick ? {
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick(); },
    } : {};

    if (variant === 'dashboard') {
        const status = run.status;
        const synced = status === PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED
            || status === PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL;
        const skippedOrFailed = status === PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED
            || status === PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED
            || status === PipelineRunStatus.PIPELINE_RUN_STATUS_TIER_BLOCKED;
        const statusLabel = getStatusLabel(status);

        return (
            <div className="run-row run-row--dashboard" onClick={onClick} {...interactiveProps}>
                <div className="run-row__top">
                    <span className={`run-row__type ${typeClass}`}>{activityType}</span>
                    <span className="run-row__title">{title}</span>
                    {timestamp && <span className="run-row__time">{timestamp}</span>}
                </div>
                <div className="run-row__bottom">
                    {pipelineName && <span className="run-row__via">VIA {pipelineName}</span>}
                    {synced && (
                        <span className="run-row__status">
                            {(boosterCount > 0 || destCount > 0) && (
                                <span className="run-row__count">
                                    {boosterCount > 0 && `${boosterCount} BOOSTER${boosterCount !== 1 ? 'S' : ''}`}
                                    {boosterCount > 0 && destCount > 0 && ' · '}
                                    {destCount > 0 && `${destCount} DEST${destCount !== 1 ? 'S' : ''}`}
                                </span>
                            )}
                            <span className="run-row__ok">✓</span>
                        </span>
                    )}
                    {skippedOrFailed && (
                        <span className="run-row__skip">⏭ {statusLabel}</span>
                    )}
                    {!synced && !skippedOrFailed && (
                        <span className={`run-row__pill ${getStatusClass(status)}`}>
                            {statusLabel}
                        </span>
                    )}
                </div>
                {skippedOrFailed && run.statusMessage && (
                    <div className="run-row__reason">ℹ {run.statusMessage}</div>
                )}
            </div>
        );
    }

    return (
        <div className={`run-row run-row--${variant}`} onClick={onClick} {...interactiveProps}>
            <span className={`run-row__type ${typeClass}`}>{activityType}</span>

            <div className="run-row__main">
                <span className="run-row__title">{title}</span>
                <div className="run-row__meta">
                    {pipelineName && <span>VIA <b>{pipelineName}</b></span>}
                    {boosterCount > 0 && <span>{boosterCount} BOOSTER{boosterCount !== 1 ? 'S' : ''}</span>}
                    {destCount > 0 && <span>{destCount} DEST{destCount !== 1 ? 'S' : ''}</span>}
                    {variant === 'detail' && onDiffClick && (
                        <a
                            className="run-row__diff-link"
                            onClick={(e) => { e.stopPropagation(); onDiffClick(e); }}
                            href="#diff"
                        >
                            VIEW DIFF →
                        </a>
                    )}
                </div>
            </div>

            <span className={`run-row__pill ${getStatusClass(run.status)}`}>
                {getStatusLabel(run.status)}
            </span>

            {timestamp && <span className="run-row__time">{timestamp}</span>}

            <span className="run-row__chevron" aria-hidden="true">›</span>
        </div>
    );
};
