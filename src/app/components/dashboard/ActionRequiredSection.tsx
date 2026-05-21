import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeInputs } from '../../hooks/useRealtimeInputs';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { usePluginLookup } from '../../hooks/usePluginLookup';
import { formatFieldLabel } from '../../utils/formatters';
import { DashboardBand } from '../library/ui/DashboardBand';
import { Badge } from '../library/ui/Badge';

export const ActionRequiredSection: React.FC = () => {
    const navigate = useNavigate();
    const { inputs, loading } = useRealtimeInputs();
    const { pipelines } = useRealtimePipelines();
    const { getSourceInfo } = usePluginLookup();

    const pendingCount = inputs.length;

    const getInputSourceInfo = (input: typeof inputs[0]) => {
        const pipeline = input.pipelineId
            ? pipelines.find(p => p.id === input.pipelineId)
            : undefined;
        let sourceId = pipeline?.source?.toLowerCase() || '';
        if (!sourceId) {
            const [sourcePart] = (input.activityId || '').split(':');
            sourceId = sourcePart?.toLowerCase().replace('source_', '') || 'unknown';
        }
        sourceId = sourceId.replace('source_', '');
        const sourceInfo = getSourceInfo(sourceId);
        return { ...sourceInfo, isAuto: input.autoPopulated === true };
    };

    return (
        <>
            <DashboardBand
                label="⚡ Action Required"
                right={loading ? '…' : `${pendingCount} PENDING`}
            />
            {!loading && pendingCount === 0 ? (
                <div className="action-row">
                    <div className="action-row__tick">✓</div>
                    <div>
                        <div className="action-row__title">All caught up</div>
                        <div className="action-row__sub">
                            No pending actions across {pipelines.length} pipeline{pipelines.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            ) : (
                inputs.slice(0, 3).map(input => {
                    const sourceInfo = getInputSourceInfo(input);
                    const formattedFields = input.displayConfig?.summary
                        || input.requiredFields?.map(f => input.displayConfig?.fieldLabels?.[f] || formatFieldLabel(f)).join(', ')
                        || 'input';
                    return (
                        <div
                            key={input.id}
                            className="action-row action-row--pending"
                            onClick={() => navigate('/inputs')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/inputs'); }}
                        >
                            <div className="action-row__tick action-row__tick--pending">
                                {sourceInfo.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="action-row__title">
                                    {sourceInfo.name}
                                    {sourceInfo.isAuto && (
                                        <> <Badge variant="warning" size="sm">Awaiting</Badge></>
                                    )}
                                </div>
                                <div className="action-row__sub">
                                    {sourceInfo.isAuto ? 'Waiting for results…' : formattedFields}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </>
    );
};
