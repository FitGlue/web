import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useRealtimeInputs } from '../hooks/useRealtimeInputs';
import { useRealtimeStats } from '../hooks/useRealtimeStats';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { pipelineRunsAtom } from '../state/activitiesState';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { useToast } from '../components/library/ui/Toast/Toast';

import { WelcomeBanner } from '../components/onboarding/WelcomeBanner';
import { PipelineRunsList } from '../components/dashboard/PipelineRunsList';
import { FileUploadPanel } from '../components/dashboard/FileUploadPanel';
import { ConnectionsSummaryCard } from '../components/dashboard/ConnectionsSummaryCard';
import { PipelinesSummaryCard } from '../components/dashboard/PipelinesSummaryCard';
import { ActionRequiredSummaryCard } from '../components/dashboard/ActionRequiredSummaryCard';
import { SubscriptionBanner } from '../components/dashboard/SubscriptionBanner';
import { PWAInstallBanner } from '../components/dashboard/PWAInstallBanner';
import { SmartNudge } from '../components/SmartNudge';
import { IntegrationsSummary } from '../state/integrationsState';
import { useUser } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';
import { GuidedTour } from '../components/onboarding/GuidedTour';
import { GuidedTourProvider, useGuidedTour } from '../hooks/useGuidedTour';

const ONBOARDING_COMPLETE_KEY = 'fitglue_onboarding_complete';

const DashboardPageInner: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { info } = useToast();
    const [onboardingComplete, setOnboardingComplete] = useState(() => {
        return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
    });
    const { startTour } = useGuidedTour();

    // Plugin registry (still REST for now - global static data)
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();

    // Real-time hooks (Firebase SDK) - no REST calls for reads
    const { loading: inputsLoading } = useRealtimeInputs();
    const { integrations } = useRealtimeIntegrations();
    const { pipelines } = useRealtimePipelines();
    // Read pipelineRuns from atom - PipelineRunsList component manages the listener
    const [pipelineRuns] = useAtom(pipelineRunsAtom);

    // User tier and showcase profile
    const { user } = useUser();
    const api = useApi();
    const isAthlete = user ? getEffectiveTier(user) === TIER_ATHLETE : false;
    const [hasShowcaseProfile, setHasShowcaseProfile] = useState(false);

    const fetchShowcaseStatus = useCallback(async () => {
        if (!isAthlete) return;
        try {
            const data = await api.get('/users/me/showcase-management/profile') as {
                profile: { subtitle?: string; bio?: string } | null;
            };
            // Consider profile 'set up' when subtitle or bio is filled in
            const p = data.profile;
            setHasShowcaseProfile(!!(p));
        } catch {
            // Silently ignore — showcase check is non-critical
        }
    }, [api, isAthlete]);

    useEffect(() => {
        fetchShowcaseStatus();
    }, [fetchShowcaseStatus]);

    // Real-time stats listener
    useRealtimeStats(true);

    useEffect(() => {
        if (searchParams.get('redirected') === 'true') {
            info('Page Not Found', "The page you visited doesn't exist — we've brought you back home.");
            searchParams.delete('redirected');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams, info]);

    const isLoading = inputsLoading || registryLoading;

    // Onboarding status
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

    return (
        <PageLayout title="Dashboard" loading={isLoading}>
            <Stack gap="lg">
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

                {/* Show PWA install banner only when WelcomeBanner is hidden */}
                {(onboardingComplete || allOnboardingComplete) && <PWAInstallBanner />}

                <SubscriptionBanner />

                <SmartNudge page="dashboard" />

                <Grid cols={3} gap="md">
                    <ConnectionsSummaryCard />
                    <PipelinesSummaryCard />
                    <ActionRequiredSummaryCard />
                </Grid>

                <FileUploadPanel />

                <PipelineRunsList
                    variant="dashboard"
                    title="Recent Runs"
                    defaultFilter="all"
                    limit={6}
                    onRunClick={(run) => run.activityId && navigate(`/activities/${run.activityId}`)}
                />
            </Stack>

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
