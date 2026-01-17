import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { PageLayout } from '../components/layout/PageLayout';
import { EnrichedActivityCard } from '../components/dashboard/EnrichedActivityCard';
import { UnsyncedActivityCard } from '../components/dashboard/UnsyncedActivityCard';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import '../components/ui/CardSkeleton.css';
import { ActivitiesService, SynchronizedActivity, UnsynchronizedEntry } from '../services/ActivitiesService';
import './ActivitiesListPage.css';

type TabMode = 'enhanced' | 'failed';
const PAGE_SIZE = 20;

const ActivitiesListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as TabMode) || 'enhanced';
    const [tabMode, setTabMode] = useState<TabMode>(initialTab);
    const navigate = useNavigate();

    // Pagination state
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreActivities, setHasMoreActivities] = useState(true);
    const [hasMoreUnsync, setHasMoreUnsync] = useState(true);
    const [extraActivities, setExtraActivities] = useState<SynchronizedActivity[]>([]);
    const [extraUnsync, setExtraUnsync] = useState<UnsynchronizedEntry[]>([]);

    const handleTabChange = (mode: TabMode) => {
        setTabMode(mode);
        setSearchParams({ tab: mode });
    };

    // Fetch initial data with execution details for enriched view
    const { activities: initialActivities, unsynchronized: initialUnsync, loading, refresh, lastUpdated } = useActivities(
        tabMode === 'enhanced' ? 'dashboard' : 'unsynchronized'
    );

    // Combine initial + paginated data
    const activities = useMemo(() => {
        const combined = [...initialActivities, ...extraActivities];
        // Dedupe by activityId
        const seen = new Set<string>();
        return combined.filter(a => {
            if (!a.activityId || seen.has(a.activityId)) return false;
            seen.add(a.activityId);
            return true;
        });
    }, [initialActivities, extraActivities]);

    const unsynchronized = useMemo(() => {
        const combined = [...initialUnsync, ...extraUnsync];
        // Dedupe by pipelineExecutionId
        const seen = new Set<string>();
        return combined.filter(e => {
            if (!e.pipelineExecutionId || seen.has(e.pipelineExecutionId)) return false;
            seen.add(e.pipelineExecutionId);
            return true;
        });
    }, [initialUnsync, extraUnsync]);

    const handleActivityClick = (id: string) => navigate(`/activities/${id}`);
    const handleUnsyncClick = (pipelineExecutionId: string) => navigate(`/activities/unsynchronized/${pipelineExecutionId}`);

    // Load more activities
    const loadMoreActivities = useCallback(async () => {
        if (loadingMore || !hasMoreActivities) return;

        setLoadingMore(true);
        try {
            const offset = activities.length;
            const newActivities = await ActivitiesService.list(PAGE_SIZE, true, offset);

            if (newActivities.length < PAGE_SIZE) {
                setHasMoreActivities(false);
            }

            setExtraActivities(prev => [...prev, ...newActivities]);
        } catch (e) {
            console.error('Failed to load more activities', e);
        } finally {
            setLoadingMore(false);
        }
    }, [activities.length, loadingMore, hasMoreActivities]);

    const loadMoreUnsync = useCallback(async () => {
        if (loadingMore || !hasMoreUnsync) return;

        setLoadingMore(true);
        try {
            const offset = unsynchronized.length;
            const newUnsync = await ActivitiesService.listUnsynchronized(PAGE_SIZE, offset);

            if (newUnsync.length < PAGE_SIZE) {
                setHasMoreUnsync(false);
            }

            setExtraUnsync(prev => [...prev, ...newUnsync]);
        } catch (e) {
            console.error('Failed to load more unsynchronized', e);
        } finally {
            setLoadingMore(false);
        }
    }, [unsynchronized.length, loadingMore, hasMoreUnsync]);

    // Reset pagination when refreshing
    const handleRefresh = () => {
        setExtraActivities([]);
        setExtraUnsync([]);
        setHasMoreActivities(true);
        setHasMoreUnsync(true);
        refresh();
    };

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisMonthActivities = activities.filter(a => {
            const syncDate = a.syncedAt ? new Date(a.syncedAt) : null;
            return syncDate && syncDate >= startOfMonth;
        });

        return {
            totalSynced: activities.length,
            thisMonth: thisMonthActivities.length,
            failed: unsynchronized.length,
        };
    }, [activities, unsynchronized]);

    return (
        <PageLayout
            title="Activities"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={handleRefresh}
            loading={loading}
            lastUpdated={lastUpdated}
        >
            <div className="activities-page">
                {/* Header */}
                <div className="activities-page__header">
                    <div className="activities-page__header-left">
                        <h2 className="activities-page__title">
                            <span className="activities-page__title-icon">✨</span>
                            Your Enhanced Activities
                        </h2>
                        <p className="activities-page__subtitle">
                            Full history of your synced activities and pipeline executions
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="activities-page__stats">
                    <div className="activities-page__stat">
                        <span className="activities-page__stat-value">{stats.totalSynced}</span>
                        <span className="activities-page__stat-label">Total Synced</span>
                        <span className="activities-page__stat-period">All Time</span>
                    </div>
                    <div className="activities-page__stat">
                        <span className="activities-page__stat-value">{stats.thisMonth}</span>
                        <span className="activities-page__stat-label">Synced</span>
                        <span className="activities-page__stat-period">This Month</span>
                    </div>
                    <div className="activities-page__stat">
                        <span className="activities-page__stat-value">{stats.failed}</span>
                        <span className="activities-page__stat-label">Need Review</span>
                        <span className="activities-page__stat-period">Failed / Stalled</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="activities-page__tabs">
                    <button
                        className={`activities-page__tab ${tabMode === 'enhanced' ? 'activities-page__tab--active' : ''}`}
                        onClick={() => handleTabChange('enhanced')}
                    >
                        ✨ Enhanced
                        <span className="activities-page__tab-count">{activities.length}</span>
                    </button>
                    <button
                        className={`activities-page__tab activities-page__tab--failed ${tabMode === 'failed' ? 'activities-page__tab--active' : ''}`}
                        onClick={() => handleTabChange('failed')}
                    >
                        ⚠️ Failed / Stalled
                        <span className="activities-page__tab-count">{unsynchronized.length}</span>
                    </button>
                </div>

                {/* Enhanced Tab Content */}
                {tabMode === 'enhanced' && (
                    <>
                        {loading && activities.length === 0 ? (
                            <div className="activities-page__grid">
                                <CardSkeleton variant="activity" />
                                <CardSkeleton variant="activity" />
                                <CardSkeleton variant="activity" />
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="activities-page__empty">
                                <div className="activities-page__empty-icon">🏃</div>
                                <h3 className="activities-page__empty-title">No Activities Yet</h3>
                                <p className="activities-page__empty-message">
                                    Your synchronized activities will appear here once you connect your fitness apps.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="activities-page__grid">
                                    {activities.map(activity => (
                                        <EnrichedActivityCard
                                            key={activity.activityId}
                                            activity={activity}
                                            onClick={() => handleActivityClick(activity.activityId!)}
                                        />
                                    ))}
                                </div>

                                {hasMoreActivities && (
                                    <div className="activities-page__pagination">
                                        <button
                                            className="activities-page__load-more"
                                            onClick={loadMoreActivities}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? 'Loading...' : 'Load More Activities'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Failed/Stalled Tab Content */}
                {tabMode === 'failed' && (
                    <>
                        {loading && unsynchronized.length === 0 ? (
                            <div className="activities-page__grid">
                                <CardSkeleton variant="activity" />
                                <CardSkeleton variant="activity" />
                            </div>
                        ) : unsynchronized.length === 0 ? (
                            <div className="activities-page__empty">
                                <div className="activities-page__empty-icon">✅</div>
                                <h3 className="activities-page__empty-title">All Synced!</h3>
                                <p className="activities-page__empty-message">
                                    No failed or stalled pipeline executions. Everything is running smoothly!
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="activities-page__grid">
                                    {unsynchronized.map(entry => (
                                        <UnsyncedActivityCard
                                            key={entry.pipelineExecutionId}
                                            entry={entry}
                                            onClick={() => handleUnsyncClick(entry.pipelineExecutionId!)}
                                        />
                                    ))}
                                </div>

                                {hasMoreUnsync && (
                                    <div className="activities-page__pagination">
                                        <button
                                            className="activities-page__load-more"
                                            onClick={loadMoreUnsync}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? 'Loading...' : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </PageLayout>
    );
};

export default ActivitiesListPage;
