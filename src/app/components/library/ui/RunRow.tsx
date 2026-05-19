import React from 'react';
import { PipelineRun, PipelineRunStatus } from '../../../../types/pb/user';
import { formatActivityType } from '../../../../types/pb/enum-formatters';
import './RunRow.css';

export interface RunRowProps {
    run: PipelineRun;
    /** feed: full-width hairline row (ActivitiesListPage). dashboard: compact (DashboardPage). detail: with diff link. */
    variant?: 'feed' | 'dashboard' | 'detail';
    pipelineName?: string;
    onClick?: () => void;
    onDiffClick?: (e: React.MouseEvent) => void;
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

    const timestamp = run.createdAt
        ? new Date(run.createdAt).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        })
        : null;

    return (
        <div
            className={`run-row run-row--${variant}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        >
            <span className="run-row__type">{activityType}</span>

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
