import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipelines } from '../../hooks/usePipelines';
import { usePluginLookup } from '../../hooks/usePluginLookup';
import { Stack } from '../library/layout';
import {
  DashboardSummaryCard,
  CardSkeleton,
  EmptyState,
  SummaryListItem,
  Pill,
  Paragraph,
  SkeletonLoading
} from '../library/ui';

/**
 * PipelinesSummaryCard - Dashboard summary card showing pipeline status
 */
export const PipelinesSummaryCard: React.FC = () => {
  const navigate = useNavigate();
  const { pipelines, loading, loaded } = usePipelines();
  const { getSourceName, getSourceIcon, getDestinationName } = usePluginLookup();

  const pipelineContent = pipelines.length === 0 ? (
    <EmptyState
      variant="mini"
      title="No pipelines configured"
      actionLabel="Create First Pipeline"
      onAction={() => navigate('/settings/pipelines/new')}
    />
  ) : (
    <Stack gap="xs">
      {pipelines.slice(0, 5).map(pipeline => (
        <SummaryListItem
          key={pipeline.id}
          title={pipeline.name || `${getSourceName(pipeline.source)}→${pipeline.destinations.map(d => getDestinationName(d)).join('/')}`}
          subtitle={pipeline.name ? `${getSourceIcon(pipeline.source)} ${getSourceName(pipeline.source)}→${pipeline.destinations.map(d => getDestinationName(d)).join('/')}` : undefined}
          status={<Pill variant="primary">{pipeline.enrichers?.length ?? 0} booster{(pipeline.enrichers?.length ?? 0) !== 1 ? 's' : ''}</Pill>}
        />
      ))}
      {pipelines.length > 5 && (
        <Paragraph muted size="sm">+{pipelines.length - 5} more...</Paragraph>
      )}
    </Stack>
  );

  return (
    <DashboardSummaryCard
      title="Pipelines"
      icon="🔀"
      linkTo="/settings/pipelines"
      linkLabel="View All →"
      footerText={pipelines.length > 0 ? <><strong>{pipelines.length}</strong> active pipeline{pipelines.length !== 1 ? 's' : ''}</> : undefined}
    >
      <SkeletonLoading
        loading={loading || !loaded}
        skeleton={<CardSkeleton variant="pipelines" itemCount={3} />}
      >
        {pipelineContent}
      </SkeletonLoading>
    </DashboardSummaryCard>
  );
};

export default PipelinesSummaryCard;
