import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRealtimeActivities } from '../hooks/useRealtimeActivities';
import { PageLayout, Stack } from '../components/library/layout';
import { EnrichedActivityCard } from '../components/dashboard/EnrichedActivityCard';
import { UnsyncedActivityCard } from '../components/dashboard/UnsyncedActivityCard';
import { CardSkeleton, StatInline, LiveToggle, Heading, Paragraph, Button, TabbedCard } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { ActivitiesService, UnsynchronizedEntry } from '../services/ActivitiesService';

type TabMode = 'enhanced' | 'failed';
const PAGE_SIZE = 20;

const ActivitiesListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as TabMode) || 'enhanced';
    const [tabMode, setTabMode] = useState<TabMode>(initialTab);
    const navigate = useNavigate();

    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreUnsync, setHasMoreUnsync] = useState(true);
    const [extraUnsync, setExtraUnsync] = useState<UnsynchronizedEntry[]>([]);

    const handleTabChange = (mode: TabMode) => {
        setTabMode(mode);
        setSearchParams({ tab: mode });
    };

    const { activities: initialActivities, loading, isEnabled: liveEnabled, isListening, toggleRealtime, forceRefresh } = useRealtimeActivities(true, 20);

    // For unsynchronized activities, we still need REST API as it's not in Firestore
    const [initialUnsync, setInitialUnsync] = useState<UnsynchronizedEntry[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [initialStats, setInitialStats] = useState<{ totalSynced?: number; monthlySynced?: number } | null>(null);

    // Load unsynchronized and stats on mount
    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [unsync, stats] = await Promise.all([
                    ActivitiesService.listUnsynchronized(PAGE_SIZE),
                    ActivitiesService.getStats()
                ]);
                setInitialUnsync(unsync);
                setInitialStats(stats);
            } catch (e) {
                console.error('Failed to load unsync/stats', e);
            } finally {
                setStatsLoading(false);
            }
        };
        loadData();
    }, []);

    const liveToggle = (
        <LiveToggle
            isEnabled={liveEnabled}
            isListening={isListening}
            onToggle={toggleRealtime}
        />
    );

    const activities = useMemo(() => {
        const seen = new Set<string>();
        return initialActivities.filter(a => {
            if (!a.activityId || seen.has(a.activityId)) return false;
            seen.add(a.activityId);
            return true;
        });
    }, [initialActivities]);

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

    // Note: "Load more" for activities removed - real-time updates provide continuous fresh data
    // Users see most recent activities via useRealtimeActivities hook

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

    const handleRefresh = async () => {
        setExtraUnsync([]);
        setHasMoreUnsync(true);
        await forceRefresh();
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
            loading={loading || statsLoading}
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
