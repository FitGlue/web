import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { PageLayout, PageHeader } from '../components/library/layout';
import { CardSkeleton, RunRow } from '../components/library/ui';
import { PipelineRun, PipelineRunStatus } from '../../types/pb/user';
import { client } from '../../shared/api/client';
import './ActivitiesListPage.css';

type StatusFilter = 'all' | 'synced' | 'skipped' | 'failed' | 'pending';

const FILTER_LABELS: Record<StatusFilter, string> = {
    all: 'ALL',
    synced: 'SYNCED',
    skipped: 'SKIPPED',
    failed: 'FAILED',
    pending: 'PENDING',
};

function matchesFilter(run: PipelineRun, filter: StatusFilter): boolean {
    switch (filter) {
        case 'synced':
            return run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED
                || run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL;
        case 'skipped':
            return run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED;
        case 'failed':
            return run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED
                || run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_TIER_BLOCKED
                || run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_CANCELLED;
        case 'pending':
            return run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING
                || run.status === PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING;
        default:
            return true;
    }
}

function startOfDay(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDayLabel(date: Date): string {
    return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
}

function getDayRelative(dateKey: string): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const todayKey = startOfDay(today);
    const yesterdayKey = startOfDay(yesterday);
    if (dateKey === todayKey) return 'TODAY';
    if (dateKey === yesterdayKey) return 'YESTERDAY';
    return '';
}

const ActivitiesListPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeFilter = (searchParams.get('status') as StatusFilter) || 'all';

    const { pipelineRuns, loading } = useRealtimePipelineRuns(true, 100);
    const { pipelines } = useRealtimePipelines();

    const [heroStats, setHeroStats] = useState<{
        activitiesThisMonth: number;
        activitiesThisWeek: number;
    } | null>(null);

    useEffect(() => {
        client.GET('/users/me/activities/stats').then(({ data }) => {
            if (!data) return;
            setHeroStats({
                activitiesThisMonth: data.activitiesThisMonth ?? 0,
                activitiesThisWeek: data.activitiesThisWeek ?? 0,
            });
        }).catch(() => { /* non-critical */ });
    }, []);

    const pipelineNameById = useMemo(() => {
        return new Map(pipelines.map(p => [p.id, p.name ?? '']));
    }, [pipelines]);

    // Deduplicate
    const uniqueRuns = useMemo(() => {
        const seen = new Set<string>();
        return pipelineRuns.filter(r => {
            if (!r.id || seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
        });
    }, [pipelineRuns]);

    // Count per filter for badges
    const counts = useMemo<Record<StatusFilter, number>>(() => ({
        all: uniqueRuns.length,
        synced: uniqueRuns.filter(r => matchesFilter(r, 'synced')).length,
        skipped: uniqueRuns.filter(r => matchesFilter(r, 'skipped')).length,
        failed: uniqueRuns.filter(r => matchesFilter(r, 'failed')).length,
        pending: uniqueRuns.filter(r => matchesFilter(r, 'pending')).length,
    }), [uniqueRuns]);

    // Filter + group by day
    const dayGroups = useMemo(() => {
        const filtered = uniqueRuns.filter(r => matchesFilter(r, activeFilter));

        const groups = new Map<string, { label: string; runs: PipelineRun[] }>();
        for (const run of filtered) {
            const date = run.createdAt ? new Date(run.createdAt) : new Date();
            const key = startOfDay(date);
            if (!groups.has(key)) {
                groups.set(key, { label: formatDayLabel(date), runs: [] });
            }
            groups.get(key)!.runs.push(run);
        }
        return Array.from(groups.entries()).map(([key, g]) => ({ key, ...g }));
    }, [uniqueRuns, activeFilter]);

    const setFilter = (f: StatusFilter) => {
        setSearchParams(f === 'all' ? {} : { status: f });
    };

    const handleRunClick = (run: PipelineRun) => {
        if (run.activityId) {
            navigate(`/activities/${run.activityId}`);
        } else {
            navigate(`/activities/unsynchronized/${run.id}`);
        }
    };

    const stats = heroStats ? (
        <>
            <div className="page-header-stat">
                <span className="page-header-stat__value page-header-stat__value--gradient">
                    {heroStats.activitiesThisMonth}
                </span>
                <span className="page-header-stat__label">This Month</span>
            </div>
            <div className="page-header-stat">
                <span className="page-header-stat__value">
                    {heroStats.activitiesThisWeek}
                </span>
                <span className="page-header-stat__label">This Week</span>
            </div>
        </>
    ) : undefined;

    return (
        <PageLayout fullWidth>
            <PageHeader
                crumbs={['Activities']}
                title="Activities"
                meta="Real-time feed of every pipeline run — synced, skipped, failed, or in flight."
                stats={stats}
            />

            {/* Filter chip strip */}
            <div className="activities-filter">
                {(Object.keys(FILTER_LABELS) as StatusFilter[]).map(f => (
                    <button
                        key={f}
                        className={`activities-filter__chip${activeFilter === f ? ' activities-filter__chip--active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {FILTER_LABELS[f]}
                        <span className="activities-filter__chip-count">{counts[f]}</span>
                    </button>
                ))}
                <div className="activities-filter__spacer" />
            </div>

            {/* Feed */}
            {loading && pipelineRuns.length === 0 ? (
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <CardSkeleton variant="activity" />
                    <CardSkeleton variant="activity" />
                    <CardSkeleton variant="activity" />
                </div>
            ) : dayGroups.length === 0 ? (
                <div className="activities-empty">
                    <div className="activities-empty__icon">🏃</div>
                    <div className="activities-empty__title">
                        {activeFilter === 'all' ? 'No Pipeline Runs Yet' : `No ${FILTER_LABELS[activeFilter]} Runs`}
                    </div>
                    <div className="activities-empty__sub">
                        {activeFilter === 'all'
                            ? 'Your pipeline runs will appear here once you connect your fitness apps.'
                            : `No runs matching the "${FILTER_LABELS[activeFilter]}" filter.`
                        }
                    </div>
                </div>
            ) : (
                dayGroups.map(group => (
                    <div key={group.key}>
                        <div className="activities-day">
                            <span className="activities-day__date">{group.label}</span>
                            {getDayRelative(group.key) && (
                                <span className="activities-day__rel">{getDayRelative(group.key)}</span>
                            )}
                            <span className="activities-day__count">
                                <b>{group.runs.length}</b> {group.runs.length === 1 ? 'RUN' : 'RUNS'}
                            </span>
                        </div>
                        {group.runs.map(run => (
                            <RunRow
                                key={run.id}
                                run={run}
                                variant="feed"
                                pipelineName={pipelineNameById.get(run.pipelineId)}
                                onClick={() => handleRunClick(run)}
                            />
                        ))}
                    </div>
                ))
            )}
        </PageLayout>
    );
};

export default ActivitiesListPage;
