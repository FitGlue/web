import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeInputs } from '../../hooks/useRealtimeInputs';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { usePluginLookup } from '../../hooks/usePluginLookup';
import { formatFieldLabel } from '../../utils/formatters';
import { Stack } from '../library/layout';
import {
  DashboardSummaryCard,
  CardSkeleton,
  EmptyState,
  PendingInputItem,
  Badge,
  SkeletonLoading
} from '../library/ui';

/**
 * ActionRequiredSummaryCard - Dashboard summary card showing pending inputs
 */
export const ActionRequiredSummaryCard: React.FC = () => {
  const navigate = useNavigate();
  const { inputs, loading } = useRealtimeInputs();
  const { pipelines } = useRealtimePipelines();
  const { getSourceInfo } = usePluginLookup();

  const getInputSourceInfo = (input: typeof inputs[0]): { source: string; icon: string; isAuto: boolean } => {
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
    return { source: sourceInfo.name, icon: sourceInfo.icon, isAuto: input.autoPopulated === true };
  };

  const inputContent = inputs.length === 0 ? (
    <EmptyState
      variant="mini"
      icon="✓"
      title="All caught up! No pending actions."
    />
  ) : (
    <Stack gap="xs">
      {inputs.slice(0, 3).map(input => {
        const sourceInfo = getInputSourceInfo(input);
        const formattedFields = input.displayConfig?.summary
          || input.requiredFields?.map(f => input.displayConfig?.fieldLabels?.[f] || formatFieldLabel(f)).join(', ')
          || 'input';
        return (
          <PendingInputItem
            key={input.id}
            icon={sourceInfo.icon}
            title={<Stack direction="horizontal" gap="sm" align="center">{sourceInfo.source}{sourceInfo.isAuto && <Badge variant="warning" size="sm">Awaiting</Badge>}</Stack> as ReactNode}
            subtitle={sourceInfo.isAuto ? 'Waiting for results...' : formattedFields}
            variant={sourceInfo.isAuto ? 'awaiting' : 'needs-input'}
            onClick={() => navigate('/inputs')}
          />
        );
      })}
    </Stack>
  );

  return (
    <DashboardSummaryCard
      title="Action Required"
      icon="⚡"
      linkTo="/inputs"
      linkLabel="View All →"
      showLink={inputs.length > 0}
      footerText={<><strong>{inputs.length}</strong> pending</>}
    >
      <SkeletonLoading
        loading={loading}
        skeleton={<CardSkeleton variant="actions" itemCount={2} />}
      >
        {inputContent}
      </SkeletonLoading>
    </DashboardSummaryCard>
  );
};

export default ActionRequiredSummaryCard;
