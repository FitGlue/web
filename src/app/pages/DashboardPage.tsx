import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useRealtimeInputs } from '../hooks/useRealtimeInputs';
import { useRealtimeStats } from '../hooks/useRealtimeStats';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { pipelineRunsAtom } from '../state/activitiesState';
import { PageLayout } from '../components/library/layout';
import { useToast } from '../components/library/ui/Toast/Toast';

import { WelcomeBanner } from '../components/onboarding/WelcomeBanner';
import { PipelineRunsList } from '../components/dashboard/PipelineRunsList';
import { FileUploadPanel } from '../components/dashboard/FileUploadPanel';
import { PipelinesSummaryCard } from '../components/dashboard/PipelinesSummaryCard';
import { ActionRequiredSummaryCard } from '../components/dashboard/ActionRequiredSummaryCard';
import { SubscriptionBanner } from '../components/dashboard/SubscriptionBanner';
import { PWAInstallBanner } from '../components/dashboard/PWAInstallBanner';
import { SmartNudge } from '../components/SmartNudge';
import { IntegrationsSummary } from '../state/integrationsState';
import { useUser } from '../hooks/useUser';
import { client } from '../../shared/api/client';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';
import { GuidedTour } from '../components/onboarding/GuidedTour';
import { GuidedTourProvider, useGuidedTour } from '../hooks/useGuidedTour';
import './DashboardPage.css';

const ONBOARDING_COMPLETE_KEY = 'fitglue_onboarding_complete';

const DashboardPageInner: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { info } = useToast();
    const [onboardingComplete, setOnboardingComplete] = useState(() => {
        return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
    });
    const { startTour } = useGuidedTour();

    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { loading: inputsLoading } = useRealtimeInputs();
    const { integrations } = useRealtimeIntegrations();
    const { pipelines } = useRealtimePipelines();
    const [pipelineRuns] = useAtom(pipelineRunsAtom);

    const { user } = useUser();
    const isAthlete = user ? getEffectiveTier(user) === TIER_ATHLETE : false;
    const [hasShowcaseProfile, setHasShowcaseProfile] = useState(false);

    const fetchShowcaseStatus = useCallback(async () => {
        if (!isAthlete) return;
        try {
            const { data } = await client.GET('/users/me/showcase-management/profile');
            const profile = (data as Record<string, unknown>)?.profile;
            setHasShowcaseProfile(!!profile);
        } catch {
            // non-critical
        }
    }, [isAthlete]);

    useEffect(() => { fetchShowcaseStatus(); }, [fetchShowcaseStatus]);

    useRealtimeStats(true);

    const [heroStats, setHeroStats] = useState<{
        activitiesThisMonth: number;
        activitiesThisWeek: number;
        currentStreakDays: number;
    } | null>(null);

    useEffect(() => {
        client.GET('/users/me/activities/stats').then(({ data }) => {
            if (!data) return;
            setHeroStats({
                activitiesThisMonth: data.activitiesThisMonth ?? 0,
                activitiesThisWeek: data.activitiesThisWeek ?? 0,
                currentStreakDays: data.currentStreakDays ?? 0,
            });
        }).catch(() => { /* non-critical */ });
    }, []);

    useEffect(() => {
        if (searchParams.get('redirected') === 'true') {
            info('Page Not Found', "The page you visited doesn't exist — we've brought you back home.");
            searchParams.delete('redirected');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams, info]);

    const isLoading = inputsLoading || registryLoading;

    const connectedCount = registryIntegrations.filter(
        ri => integrations?.[ri.id as keyof IntegrationsSummary]?.connected
    ).length;
    const hasConnections = connectedCount > 0;
    const hasPipelines = pipelines.length > 0;
    const hasSyncs = pipelineRuns.length > 0;
    const allOnboardingComplete = hasConnections && hasPipelines && hasSyncs
        && (!isAthlete || hasShowcaseProfile);

    useEffect(() => {
        if (!isLoading && allOnboardingComplete && !onboardingComplete) {
            localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            setOnboardingComplete(true);
        }
    }, [isLoading, allOnboardingComplete, onboardingComplete]);

    const headerStats = heroStats ? (
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
            <div className="page-header-stat">
                <span className="page-header-stat__value">
                    {heroStats.currentStreakDays}
                </span>
                <span className="page-header-stat__label">Day Streak</span>
            </div>
        </>
    ) : undefined;

    return (
        <PageLayout
            title="Dashboard"
            loading={isLoading}
            headerStats={headerStats}
            fullWidth
        >
            {/* Pre-chrome system messages */}
            {!onboardingComplete && !isLoading && !allOnboardingComplete && (
                <WelcomeBanner
                    hasConnections={hasConnections}
                    hasPipelines={hasPipelines}
                    hasSyncs={hasSyncs}
                    isAthlete={isAthlete}
                    hasShowcaseProfile={hasShowcaseProfile}
                    onStartTour={startTour}
                />
            )}
            {(onboardingComplete || allOnboardingComplete) && <PWAInstallBanner />}
            <SubscriptionBanner />

            {/* Plan band */}
            <div className="fg-band">
                <span className="fg-band__label">
                    {isAthlete ? '✦ ATHLETE' : 'HOBBYIST'} · OVERVIEW
                </span>
                <span className="fg-band__right">{connectedCount} CONNECTED</span>
            </div>

            {/* 3-column body */}
            <div className="dashboard-body">
                {/* Left — Action Required + Nudge + Upload */}
                <div className="dashboard-col">
                    <ActionRequiredSummaryCard />
                    <SmartNudge page="dashboard" />
                    <FileUploadPanel />
                </div>

                {/* Middle — Pipelines */}
                <div className="dashboard-col">
                    <PipelinesSummaryCard />
                </div>

                {/* Right — Recent Runs */}
                <div className="dashboard-col dashboard-col--runs">
                    <div className="fg-band fg-band--ink">
                        <span className="fg-band__label">RECENT RUNS</span>
                    </div>
                    <PipelineRunsList
                        variant="dashboard"
                        title=""
                        defaultFilter="all"
                        limit={6}
                        onRunClick={(run) => run.activityId && navigate(`/activities/${run.activityId}`)}
                    />
                </div>
            </div>

            <GuidedTour />
        </PageLayout>
    );
};

const DashboardPage: React.FC = () => (
    <GuidedTourProvider>
        <DashboardPageInner />
    </GuidedTourProvider>
);

export default DashboardPage;
