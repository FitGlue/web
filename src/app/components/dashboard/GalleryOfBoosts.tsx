import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipelineRuns } from '../../hooks/usePipelineRuns';
import { EnrichedActivityCard } from './EnrichedActivityCard';
import { CardSkeleton, Paragraph, DashboardSummaryCard, EmptyState } from '../library/ui';
import { Stack } from '../library/layout';
import { PipelineRunStatus } from '../../../types/pb/user';

interface GalleryOfBoostsProps {
    onActivityClick?: (activityId: string) => void;
    limit?: number;
}

/**
 * GalleryOfBoosts - Shows recent pipeline runs with completed boosters
 * 
 * Now sources data directly from pipeline_runs collection (via usePipelineRuns hook)
 * instead of relying on activities with execution traces from the old executions collection.
 */
export const GalleryOfBoosts: React.FC<GalleryOfBoostsProps> = ({
    onActivityClick,
    limit = 6,
}) => {
    const navigate = useNavigate();
    const { pipelineRuns, loading } = usePipelineRuns(true, limit);

    // Filter to only show runs that have boosters applied (synced or partial success)
    const completedRuns = pipelineRuns.filter(run =>
        (run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED ||
            run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL) &&
        run.boosters && run.boosters.length > 0
    );

    if (loading && completedRuns.length === 0) {
        return (
            <DashboardSummaryCard
                title="Recent Boosts"
                icon="✨"
                linkTo="/activities"
                linkLabel="View All →"
            >
                <Stack gap="md">
                    <CardSkeleton variant="activity" />
                    <CardSkeleton variant="activity" />
                </Stack>
            </DashboardSummaryCard>
        );
    }

    const boostsContent = completedRuns.length === 0 ? (
        <EmptyState
            variant="mini"
            icon="🚀"
            title="No boosted activities yet"
            description="Connect your fitness apps and set up a pipeline to start enhancing your activities."
            actionLabel="Create Pipeline"
            onAction={() => navigate('/settings/pipelines/new')}
        />
    ) : (
        <Stack gap="md">
            {completedRuns.map(run => (
                <EnrichedActivityCard
                    key={run.id}
                    pipelineRun={run}
                    onClick={onActivityClick && run.activityId ? () => onActivityClick(run.activityId) : undefined}
                />
            ))}
        </Stack>
    );

    return (
        <DashboardSummaryCard
            title="Recent Boosts"
            icon="✨"
            linkTo="/activities"
            linkLabel="View All →"
            showLink={completedRuns.length > 0}
            footerText={completedRuns.length > 0 ? <><Paragraph inline><strong>{completedRuns.length}</strong></Paragraph> recent enhanced activities</> : undefined}
        >
            {boostsContent}
        </DashboardSummaryCard>
    );
};
