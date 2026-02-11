import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { usePluginLookup } from '../../hooks/usePluginLookup';
import { Stack } from '../library/layout';
import {
  DashboardSummaryCard,
  CardSkeleton,
  EmptyState,
  Pill,
  Paragraph,
  SkeletonLoading,
  SummaryListItem
} from '../library/ui';

/**
 * PipelinesSummaryCard - Dashboard summary card showing pipeline status
 */
export const PipelinesSummaryCard: React.FC = () => {
  const navigate = useNavigate();
  const { pipelines, loading } = useRealtimePipelines();
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
      {pipelines.slice(0, 5).map(pipeline => {
        const enricherCount = pipeline.enrichers?.length ?? 0;
        const isDisabled = (pipeline as { disabled?: boolean }).disabled;
        return (
          <SummaryListItem
            key={pipeline.id}
            icon={getSourceIcon(pipeline.source)}
            title={pipeline.name || 'Unnamed Pipeline'}
            subtitle={<>{getSourceName(pipeline.source)} · <Pill variant="primary" size="small">{enricherCount} booster{enricherCount !== 1 ? 's' : ''}</Pill> → {pipeline.destinations.map((dest, i) => (
              <Pill key={i} variant="pink" size="small">{getDestinationName(dest)}</Pill>
            ))}</>}
            status={isDisabled ? '○' : '✓'}
            statusVariant={isDisabled ? 'inactive' : 'active'}
          />
        );
      })}
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
        loading={loading}
        skeleton={<CardSkeleton variant="pipelines" itemCount={3} />}
      >
        {pipelineContent}
      </SkeletonLoading>
    </DashboardSummaryCard>
  );
};

export default PipelinesSummaryCard;
