import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRealtimeInputs } from '../hooks/useRealtimeInputs';
import { useRealtimeStats } from '../hooks/useRealtimeActivities';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { PageLayout, Stack, Grid } from '../components/library/layout';

import { LiveToggle } from '../components/library/ui';
import { WelcomeBanner } from '../components/onboarding/WelcomeBanner';
import { PipelineRunsList } from '../components/dashboard/PipelineRunsList';
import { FileUploadPanel } from '../components/dashboard/FileUploadPanel';
import { ConnectionsSummaryCard } from '../components/dashboard/ConnectionsSummaryCard';
import { PipelinesSummaryCard } from '../components/dashboard/PipelinesSummaryCard';
import { ActionRequiredSummaryCard } from '../components/dashboard/ActionRequiredSummaryCard';
import { SubscriptionBanner } from '../components/dashboard/SubscriptionBanner';
import { IntegrationsSummary } from '../state/integrationsState';
import { RedirectNotification } from './NotFoundPage';

const ONBOARDING_COMPLETE_KEY = 'fitglue_onboarding_complete';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showRedirectNotification, setShowRedirectNotification] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(() => {
        return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
    });

    // Plugin registry (still REST for now - global static data)
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();

    // Real-time hooks (Firebase SDK) - no REST calls for reads
    const { loading: inputsLoading } = useRealtimeInputs();
    const { integrations } = useRealtimeIntegrations();
    const { pipelines } = useRealtimePipelines();
    const {
        pipelineRuns,
        loading: runsLoading,
        isListening,
        forceRefresh
    } = useRealtimePipelineRuns(true, 10);
    const [liveEnabled, setLiveEnabled] = useState(true);

    // Real-time stats listener
    useRealtimeStats(true);

    const liveToggle = (
        <LiveToggle
            isEnabled={liveEnabled}
            isListening={isListening}
            onToggle={() => setLiveEnabled(prev => !prev)}
        />
    );

    useEffect(() => {
        if (searchParams.get('redirected') === 'true') {
            setShowRedirectNotification(true);
            searchParams.delete('redirected');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Real-time hooks auto-subscribe, no manual fetch needed
    const refresh = () => {
        // Force refresh just updates the lastUpdated timestamp
        // Real-time listeners will automatically provide fresh data
        forceRefresh();
    };

    const isLoading = runsLoading || inputsLoading || registryLoading;

    // Onboarding status
    const connectedCount = registryIntegrations.filter(
        ri => integrations?.[ri.id as keyof IntegrationsSummary]?.connected
    ).length;
    const hasConnections = connectedCount > 0;
    const hasPipelines = pipelines.length > 0;
    const hasSyncs = pipelineRuns.length > 0;
    const allOnboardingComplete = hasConnections && hasPipelines && hasSyncs;

    useEffect(() => {
        if (!isLoading && allOnboardingComplete && !onboardingComplete) {
            localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            setOnboardingComplete(true);
        }
    }, [isLoading, allOnboardingComplete, onboardingComplete]);

    return (
        <PageLayout title="Dashboard" onRefresh={refresh} loading={isLoading} headerActions={liveToggle}>
            {showRedirectNotification && (
                <RedirectNotification
                    onDismiss={() => setShowRedirectNotification(false)}
                />
            )}

            {!onboardingComplete && !isLoading && !allOnboardingComplete && (
                <WelcomeBanner
                    hasConnections={hasConnections}
                    hasPipelines={hasPipelines}
                    hasSyncs={hasSyncs}
                />
            )}

            <SubscriptionBanner />

            <Stack gap="lg">
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
        </PageLayout>
    );
};

export default DashboardPage;
