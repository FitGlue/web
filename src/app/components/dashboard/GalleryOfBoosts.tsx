import React, { useMemo } from 'react';
import { SynchronizedActivity } from '../../services/ActivitiesService';
import { EnrichedActivityCard } from './EnrichedActivityCard';
import { CardSkeleton, Paragraph, DashboardSummaryCard } from '../library/ui';
import { Stack } from '../library/layout';

interface GalleryOfBoostsProps {
    activities: SynchronizedActivity[];
    onActivityClick?: (activityId: string) => void;
    limit?: number;
    loading?: boolean;
}

const wasPipelineProcessed = (activity: SynchronizedActivity): boolean => {
    if (activity.pipelineExecution && activity.pipelineExecution.length > 0) {
        return true;
    }
    return !!activity.pipelineExecutionId;
};

export const GalleryOfBoosts: React.FC<GalleryOfBoostsProps> = ({
    activities,
    onActivityClick,
    limit = 6,
    loading = false,
}) => {
    const enrichedActivities = useMemo(() => {
        return activities
            .filter(wasPipelineProcessed)
            .slice(0, limit);
    }, [activities, limit]);

    if (loading && enrichedActivities.length === 0) {
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

    if (enrichedActivities.length === 0) {
        return null;
    }

    return (
        <DashboardSummaryCard
            title="Recent Boosts"
            icon="✨"
            linkTo="/activities"
            linkLabel="View All →"
            footerText={<><Paragraph inline><strong>{enrichedActivities.length}</strong></Paragraph> recent enhanced activities</>}
        >
            <Stack gap="md">
                {enrichedActivities.map(activity => (
                    <EnrichedActivityCard
                        key={activity.activityId}
                        activity={activity}
                        onClick={onActivityClick ? () => onActivityClick(activity.activityId!) : undefined}
                    />
                ))}
            </Stack>
        </DashboardSummaryCard>
    );
};
