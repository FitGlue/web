import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { useRealtimeActivities } from '../hooks/useRealtimeActivities';
import { PageLayout, Stack } from '../components/library/layout';
import { EnrichedActivityCard } from '../components/dashboard/EnrichedActivityCard';
import { UnsyncedActivityCard } from '../components/dashboard/UnsyncedActivityCard';
import { CardSkeleton, StatInline, LiveToggle, Heading, Paragraph, Button, TabbedCard } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { ActivitiesService, SynchronizedActivity, UnsynchronizedEntry } from '../services/ActivitiesService';

type TabMode = 'enhanced' | 'failed';
const PAGE_SIZE = 20;

const ActivitiesListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as TabMode) || 'enhanced';
    const [tabMode, setTabMode] = useState<TabMode>(initialTab);
    const navigate = useNavigate();

    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreActivities, setHasMoreActivities] = useState(true);
    const [hasMoreUnsync, setHasMoreUnsync] = useState(true);
    const [extraActivities, setExtraActivities] = useState<SynchronizedActivity[]>([]);
    const [extraUnsync, setExtraUnsync] = useState<UnsynchronizedEntry[]>([]);

    const handleTabChange = (mode: TabMode) => {
        setTabMode(mode);
        setSearchParams({ tab: mode });
    };

    const { activities: initialActivities, unsynchronized: initialUnsync, stats: initialStats, loading, refreshAll, lastUpdated } = useActivities('dashboard');

    const { isEnabled: liveEnabled, isListening, toggleRealtime } = useRealtimeActivities(true, 20);

    const liveToggle = (
        <LiveToggle
            isEnabled={liveEnabled}
            isListening={isListening}
            onToggle={toggleRealtime}
        />
    );

    const activities = useMemo(() => {
        const combined = [...initialActivities, ...extraActivities];
        const seen = new Set<string>();
        return combined.filter(a => {
            if (!a.activityId || seen.has(a.activityId)) return false;
            seen.add(a.activityId);
            return true;
        });
    }, [initialActivities, extraActivities]);

    const unsynchronized = useMemo(() => {
        const combined = [...initialUnsync, ...extraUnsync];
        const seen = new Set<string>();
        return combined.filter(e => {
            if (!e.pipelineExecutionId || seen.has(e.pipelineExecutionId)) return false;
            seen.add(e.pipelineExecutionId);
            return true;
        });
    }, [initialUnsync, extraUnsync]);

    const handleActivityClick = (id: string) => navigate(`/activities/${id}`);
    const handleUnsyncClick = (pipelineExecutionId: string) => navigate(`/activities/unsynchronized/${pipelineExecutionId}`);

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

    const handleRefresh = () => {
        setExtraActivities([]);
        setExtraUnsync([]);
        setHasMoreActivities(true);
        setHasMoreUnsync(true);
        refreshAll();
    };

    const stats = useMemo(() => {
        return {
            totalSynced: initialStats?.totalSynced || 0,
            thisMonth: initialStats?.monthlySynced || 0,
        };
    }, [initialStats]);

    return (
        <PageLayout
            title="Boosted Activities"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={handleRefresh}
            loading={loading}
            lastUpdated={lastUpdated}
            headerActions={liveToggle}
        >
            <Stack gap="lg">
                <Stack gap="sm">
                    <Stack direction="horizontal" align="center" gap="sm">
                        <Heading level={2}>
                            🚀 Your Boosted Activities
                        </Heading>
                    </Stack>
                    <Paragraph muted>
                        Every activity you&apos;ve supercharged with FitGlue magic
                    </Paragraph>
                </Stack>

                <Stack direction="horizontal" gap="md">
                    <StatInline
                        value={stats.totalSynced}
                        label="Total Boosted"
                        subLabel="All Time"
                        loading={loading && !initialStats?.totalSynced}
                    />
                    <StatInline
                        value={stats.thisMonth}
                        label="Boosted"
                        subLabel="This Month"
                        loading={loading && !initialStats?.monthlySynced}
                    />
                </Stack>

                <TabbedCard
                    tabs={[
                        { id: 'enhanced', icon: '🚀', label: 'Boosted', count: activities.length },
                        { id: 'failed', icon: '⚠️', label: 'Issues', count: unsynchronized.length, variant: 'warning' },
                    ]}
                    activeTab={tabMode}
                    onTabChange={(tabId) => handleTabChange(tabId as TabMode)}
                    footerText={
                        tabMode === 'enhanced'
                            ? (activities.length > 0 ? `${activities.length} boosted` : undefined)
                            : (unsynchronized.length > 0 ? `${unsynchronized.length} issues` : undefined)
                    }
                >
                    {tabMode === 'enhanced' && (
                        <>
                            {loading && activities.length === 0 ? (
                                <Stack gap="md">
                                    <CardSkeleton variant="activity" />
                                    <CardSkeleton variant="activity" />
                                    <CardSkeleton variant="activity" />
                                </Stack>
                            ) : activities.length === 0 ? (
                                <Stack gap="md" align="center">
                                    <Paragraph size="lg">🏃</Paragraph>
                                    <Heading level={3}>No Activities Yet</Heading>
                                    <Paragraph muted centered>
                                        Your boosted activities will appear here once you connect your fitness apps.
                                    </Paragraph>
                                </Stack>
                            ) : (
                                <Stack gap="md">
                                    {activities.map(activity => (
                                        <EnrichedActivityCard
                                            key={activity.activityId}
                                            activity={activity}
                                            onClick={() => handleActivityClick(activity.activityId!)}
                                        />
                                    ))}

                                    {hasMoreActivities && (
                                        <Stack align="center">
                                            <Button
                                                variant="secondary"
                                                onClick={loadMoreActivities}
                                                disabled={loadingMore}
                                            >
                                                {loadingMore ? 'Loading...' : 'Load More Activities'}
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                        </>
                    )}

                    {tabMode === 'failed' && (
                        <>
                            {loading && unsynchronized.length === 0 ? (
                                <Stack gap="md">
                                    <CardSkeleton variant="activity" />
                                    <CardSkeleton variant="activity" />
                                </Stack>
                            ) : unsynchronized.length === 0 ? (
                                <Stack gap="md" align="center">
                                    <Paragraph size="lg">✅</Paragraph>
                                    <Heading level={3}>All Good!</Heading>
                                    <Paragraph muted centered>
                                        No issues to report. Everything is running smoothly!
                                    </Paragraph>
                                </Stack>
                            ) : (
                                <Stack gap="md">
                                    {unsynchronized.map(entry => (
                                        <UnsyncedActivityCard
                                            key={entry.pipelineExecutionId}
                                            entry={entry}
                                            onClick={() => handleUnsyncClick(entry.pipelineExecutionId!)}
                                        />
                                    ))}

                                    {hasMoreUnsync && (
                                        <Stack align="center">
                                            <Button
                                                variant="secondary"
                                                onClick={loadMoreUnsync}
                                                disabled={loadingMore}
                                            >
                                                {loadingMore ? 'Loading...' : 'Load More'}
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                        </>
                    )}
                </TabbedCard>
            </Stack>
        </PageLayout>
    );
};

export default ActivitiesListPage;
