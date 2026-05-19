import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { useUser } from '../hooks/useUser';
import { PipelineRunsList, FilterMode } from '../components/dashboard/PipelineRunsList';
import { StatInline, LiveToggle } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { ActivitiesService } from '../services/ActivitiesService';
import './ActivitiesListPage.css';

const ActivitiesListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as FilterMode) || 'all';

    const handleTabChange = (mode: FilterMode) => {
        setSearchParams({ tab: mode });
    };

    const { loading, isListening, forceRefresh } = useRealtimePipelineRuns(true, 50);
    const [liveEnabled, setLiveEnabled] = useState(true);

    const { user: profile, loading: profileLoading } = useUser();

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
        <div className="activities-page">
            {/* Page head */}
            <div className="page-head">
                <div>
                    <div className="page-head__eyebrow">ACTIVITIES</div>
                    <h1>Pipeline Runs</h1>
                </div>
                <div className="page-head__actions">
                    <LiveToggle
                        isEnabled={liveEnabled}
                        isListening={isListening}
                        onToggle={() => setLiveEnabled(prev => !prev)}
                    />
                    <button className="fg-button fg-button--ghost fg-button--sm" onClick={handleRefresh} disabled={loading}>
                        {loading ? '…' : '⟲ REFRESH'}
                    </button>
                </div>
            </div>

            {/* Stats band */}
            <div className="fg-band">
                <span className="fg-band__label">PIPELINE RUNS</span>
                <span className="fg-band__right">REAL-TIME</span>
            </div>

            {/* Stat slabs */}
            <div className="activities-page__stats">
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
            </div>

            {/* Runs list */}
            <div className="activities-page__list">
                <PipelineRunsList
                    showTabs={true}
                    variant="tabbed"
                    limit={50}
                    initialTab={initialTab}
                    onTabChange={handleTabChange}
                />
            </div>
        </div>
    );
};

export default ActivitiesListPage;
