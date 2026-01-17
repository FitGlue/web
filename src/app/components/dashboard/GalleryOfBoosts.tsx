import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SynchronizedActivity } from '../../services/ActivitiesService';
import { EnrichedActivityCard } from './EnrichedActivityCard';
import { CardSkeleton } from '../ui/CardSkeleton';
import './GalleryOfBoosts.css';

interface GalleryOfBoostsProps {
    /** All activities from the activities hook */
    activities: SynchronizedActivity[];
    /** Navigate to activity details */
    onActivityClick?: (activityId: string) => void;
    /** Maximum number of activities to show */
    limit?: number;
    /** Show loading skeleton while data is being fetched */
    loading?: boolean;
}

/**
 * Check if an activity was processed through a pipeline (and thus potentially enriched)
 * Since the list endpoint doesn't return pipelineExecution details,
 * we use pipelineExecutionId as the indicator
 */
const wasPipelineProcessed = (activity: SynchronizedActivity): boolean => {
    // If pipelineExecution is available (e.g., from single activity fetch), check it
    if (activity.pipelineExecution && activity.pipelineExecution.length > 0) {
        return true;
    }
    // Otherwise, check if it has a pipelineExecutionId (indicates it went through a pipeline)
    return !!activity.pipelineExecutionId;
};

/**
 * GalleryOfBoosts displays a showcase of recently processed activities
 * with before/after comparisons and aggregate statistics.
 */
export const GalleryOfBoosts: React.FC<GalleryOfBoostsProps> = ({
    activities,
    onActivityClick,
    limit = 10,
    loading = false,
}) => {
    // Filter to only pipeline-processed activities
    const enrichedActivities = useMemo(() => {
        return activities
            .filter(wasPipelineProcessed)
            .slice(0, limit);
    }, [activities, limit]);

    // Calculate aggregate stats based on pipeline-processed activities
    const stats = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisMonthActivities = activities.filter(a => {
            const syncDate = a.syncedAt ? new Date(a.syncedAt) : null;
            return syncDate && syncDate >= startOfMonth;
        });

        const processedThisMonth = thisMonthActivities.filter(wasPipelineProcessed);

        return {
            activitiesProcessed: processedThisMonth.length,
            totalActivities: thisMonthActivities.length,
        };
    }, [activities]);

    // Show loading skeleton while fetching
    if (loading && enrichedActivities.length === 0) {
        return (
            <div className="gallery-skeleton">
                <div className="gallery-skeleton__header">
                    <div className="gallery-skeleton__header-left">
                        <div className="skeleton-line skeleton-line--title" style={{ width: '200px' }} />
                        <div className="skeleton-line skeleton-line--text" style={{ width: '180px' }} />
                    </div>
                    <div className="skeleton-line skeleton-line--link" />
                </div>

                <div className="gallery-skeleton__stats">
                    <div className="gallery-skeleton__stat">
                        <div className="skeleton-line" style={{ height: '32px', width: '40px' }} />
                        <div className="skeleton-line skeleton-line--text" />
                        <div className="skeleton-line skeleton-line--subtext" />
                    </div>
                    <div className="gallery-skeleton__stat">
                        <div className="skeleton-line" style={{ height: '32px', width: '40px' }} />
                        <div className="skeleton-line skeleton-line--text" />
                        <div className="skeleton-line skeleton-line--subtext" />
                    </div>
                </div>

                <div className="gallery-skeleton__grid">
                    <CardSkeleton variant="activity" />
                    <CardSkeleton variant="activity" />
                    <CardSkeleton variant="activity" />
                </div>
            </div>
        );
    }

    // Don't render if no processed activities and not loading
    if (enrichedActivities.length === 0) {
        return null;
    }

    return (
        <div className="gallery-of-boosts">
            <div className="gallery-of-boosts__header">
                <div className="gallery-of-boosts__header-left">
                    <h3 className="gallery-of-boosts__title">
                        <span className="gallery-of-boosts__title-icon">✨</span>
                        Your Enhanced Activities
                    </h3>
                    <p className="gallery-of-boosts__subtitle">
                        Where the magic has happened
                    </p>
                </div>
                <Link to="/activities" className="card-link">View All →</Link>
            </div>

            {/* Aggregate Stats */}
            <div className="gallery-of-boosts__stats">
                <div className="gallery-of-boosts__stat">
                    <span className="gallery-of-boosts__stat-value">{stats.activitiesProcessed}</span>
                    <span className="gallery-of-boosts__stat-label">Activities Synced</span>
                    <span className="gallery-of-boosts__stat-period">This Month</span>
                </div>
                <div className="gallery-of-boosts__stat">
                    <span className="gallery-of-boosts__stat-value">{enrichedActivities.length}</span>
                    <span className="gallery-of-boosts__stat-label">Recent Syncs</span>
                    <span className="gallery-of-boosts__stat-period">Shown Below</span>
                </div>
            </div>

            {/* Activity Cards Grid */}
            <div className="gallery-of-boosts__grid">
                {enrichedActivities.map(activity => (
                    <EnrichedActivityCard
                        key={activity.activityId}
                        activity={activity}
                        onClick={onActivityClick ? () => onActivityClick(activity.activityId!) : undefined}
                    />
                ))}
            </div>
        </div>
    );
};
