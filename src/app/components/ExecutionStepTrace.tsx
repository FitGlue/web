import React from 'react';
import { ExecutionStep, ExecutionStepKind, ExecutionStepStatus } from '../../types/pb/models/pipeline/execution';
import { Stack } from './library/layout';
import { LoadingState, EmptyState } from './library/ui';

const KIND_LABEL: Record<number, string> = {
    [ExecutionStepKind.EXECUTION_STEP_KIND_SOURCE]: 'Source',
    [ExecutionStepKind.EXECUTION_STEP_KIND_PARSE]: 'Parse',
    [ExecutionStepKind.EXECUTION_STEP_KIND_GATE]: 'Gate',
    [ExecutionStepKind.EXECUTION_STEP_KIND_ENRICHER_BATCH]: 'Enrichers',
    [ExecutionStepKind.EXECUTION_STEP_KIND_ROUTER]: 'Router',
    [ExecutionStepKind.EXECUTION_STEP_KIND_DESTINATION]: 'Destination',
};

const KIND_ICON: Record<number, string> = {
    [ExecutionStepKind.EXECUTION_STEP_KIND_SOURCE]: '📥',
    [ExecutionStepKind.EXECUTION_STEP_KIND_PARSE]: '🔍',
    [ExecutionStepKind.EXECUTION_STEP_KIND_GATE]: '🚦',
    [ExecutionStepKind.EXECUTION_STEP_KIND_ENRICHER_BATCH]: '✨',
    [ExecutionStepKind.EXECUTION_STEP_KIND_ROUTER]: '🔀',
    [ExecutionStepKind.EXECUTION_STEP_KIND_DESTINATION]: '📤',
};

const STATUS_PILL: Record<number, { label: string; className: string }> = {
    [ExecutionStepStatus.EXECUTION_STEP_STATUS_QUEUED]: { label: 'QUEUED', className: 'step-pill--queued' },
    [ExecutionStepStatus.EXECUTION_STEP_STATUS_RUNNING]: { label: 'RUNNING', className: 'step-pill--running' },
    [ExecutionStepStatus.EXECUTION_STEP_STATUS_OK]: { label: 'OK', className: 'step-pill--ok' },
    [ExecutionStepStatus.EXECUTION_STEP_STATUS_PASS]: { label: 'PASS', className: 'step-pill--ok' },
    [ExecutionStepStatus.EXECUTION_STEP_STATUS_SKIPPED]: { label: 'SKIPPED', className: 'step-pill--skipped' },
    [ExecutionStepStatus.EXECUTION_STEP_STATUS_FAILED]: { label: 'FAILED', className: 'step-pill--failed' },
    [ExecutionStepStatus.EXECUTION_STEP_STATUS_RETRIED]: { label: 'RETRIED', className: 'step-pill--retried' },
};

function formatDuration(ms: number): string {
    if (ms <= 0) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

interface Props {
    steps: ExecutionStep[];
    isLoading?: boolean;
}

export const ExecutionStepTrace: React.FC<Props> = ({ steps, isLoading }) => {
    if (isLoading) return <LoadingState message="Loading execution trace..." />;

    const sorted = [...steps].sort((a, b) => a.ordinal - b.ordinal);

    if (sorted.length === 0) {
        return (
            <EmptyState
                icon="🔍"
                title="No Trace Data"
                description="No execution steps found. This run may predate the step trace feature."
            />
        );
    }

    return (
        <Stack gap="sm">
            {sorted.map((step) => {
                const pill = STATUS_PILL[step.status] ?? { label: 'UNKNOWN', className: 'step-pill--queued' };
                const label = step.statusLabel ?? pill.label;
                const icon = KIND_ICON[step.kind] ?? '⚙️';
                const kindLabel = KIND_LABEL[step.kind] ?? 'Step';
                const dur = formatDuration(step.durationMs);

                return (
                    <div key={step.id} className="execution-step-row">
                        <span className="execution-step-ordinal">{step.ordinal}</span>
                        <span className="execution-step-icon">{icon}</span>
                        <div className="execution-step-body">
                            <span className="execution-step-kind">{kindLabel}</span>
                            <span className="execution-step-name">{step.displayName}</span>
                            {step.error && (
                                <span className="execution-step-error">{step.error}</span>
                            )}
                        </div>
                        <div className="execution-step-meta">
                            {dur && <span className="execution-step-dur">{dur}</span>}
                            <span className={`step-pill ${pill.className}`}>{label}</span>
                        </div>
                    </div>
                );
            })}
        </Stack>
    );
};
