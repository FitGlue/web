import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { useUser } from '../hooks/useUser';
import { PageLayout, Stack } from '../components/library/layout';
import { PipelineRunsList, FilterMode } from '../components/dashboard/PipelineRunsList';
import { StatInline, LiveToggle } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { ActivitiesService } from '../services/ActivitiesService';

const ActivitiesListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as FilterMode) || 'all';

    const handleTabChange = (mode: FilterMode) => {
        setSearchParams({ tab: mode });
    };

    // Get loading/listening state from hook for header indicators
    // The hook uses singleton pattern, so calling it here shares the listener with PipelineRunsList
    const { loading, isListening, forceRefresh } = useRealtimePipelineRuns(true, 50);
    const [liveEnabled, setLiveEnabled] = useState(true);

    // Get user profile for sync credits (billing counter)
    const { user: profile, loading: profileLoading } = useUser();

    // Load stats on mount (still needed for totals)
    const [statsLoading, setStatsLoading] = useState(true);
    const [initialStats, setInitialStats] = useState<{ totalSynced: number; uploadsThisMonth: number } | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await ActivitiesService.getStats();
                setInitialStats(stats);
            } catch (e) {
                console.error('Failed to load stats', e);
            } finally {
                setStatsLoading(false);
            }
        };
        loadStats();
    }, []);

    const liveToggle = (
        <LiveToggle
            isEnabled={liveEnabled}
            isListening={isListening}
            onToggle={() => setLiveEnabled(prev => !prev)}
        />
    );

    const handleRefresh = async () => {
        await forceRefresh();
    };

    const stats = useMemo(() => {
        return {
            totalSynced: initialStats?.totalSynced ?? 0,
            uploadsThisMonth: initialStats?.uploadsThisMonth ?? 0,
            creditsUsedThisMonth: profile?.syncCountThisMonth ?? 0,
        };
    }, [initialStats, profile]);

    return (
        <PageLayout
            title="Pipeline Runs"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={handleRefresh}
            loading={loading || statsLoading || profileLoading}
            headerActions={liveToggle}
        >
            <Stack gap="lg">
                <div className="fg-band">
                    <span className="fg-band__label">PIPELINE RUNS</span>
                    <span className="fg-band__right">REAL-TIME</span>
                </div>

                <Stack direction="horizontal" gap="md" responsive>
                    <StatInline
                        value={stats.totalSynced}
                        label="Total Uploads"
                        subLabel="All Time"
                        loading={statsLoading}
                    />
                    <StatInline
                        value={stats.uploadsThisMonth}
                        label="Uploads"
                        subLabel="This Month"
                        loading={statsLoading}
                    />
                    <StatInline
                        value={stats.creditsUsedThisMonth}
                        label="Credits Used"
                        subLabel="This Month"
                        loading={profileLoading}
                    />
                </Stack>

                <PipelineRunsList
                    showTabs={true}
                    variant="tabbed"
                    limit={50}
                    initialTab={initialTab}
                    onTabChange={handleTabChange}
                />
            </Stack>
        </PageLayout>
    );
};

export default ActivitiesListPage;
