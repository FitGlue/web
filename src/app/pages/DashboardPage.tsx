import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInputs } from '../hooks/useInputs';
import { useActivities } from '../hooks/useActivities';
import { useRealtimeActivities } from '../hooks/useRealtimeActivities';
import { usePipelines } from '../hooks/usePipelines';
import { useIntegrations } from '../hooks/useIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { PageLayout, Stack, Grid } from '../components/library/layout';

import { LiveToggle } from '../components/library/ui';
import { WelcomeBanner } from '../components/onboarding/WelcomeBanner';
import { GalleryOfBoosts } from '../components/dashboard/GalleryOfBoosts';
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
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { loading: inputsLoading, refresh: inputsRefresh } = useInputs();
    const { activities, loading: statsLoading, refresh: statsRefresh } = useActivities('dashboard');
    const { integrations, loading: integrationsLoading, refresh: integrationsRefresh, fetchIfNeeded: fetchIntegrations } = useIntegrations();
    const { pipelines, loading: pipelinesLoading, refresh: pipelinesRefresh, fetchIfNeeded: fetchPipelines } = usePipelines();

    const { isEnabled: liveEnabled, isListening, toggleRealtime } = useRealtimeActivities(true, 10);

    const liveToggle = (
        <LiveToggle
            isEnabled={liveEnabled}
            isListening={isListening}
            onToggle={toggleRealtime}
        />
    );

    useEffect(() => {
        if (searchParams.get('redirected') === 'true') {
            setShowRedirectNotification(true);
            searchParams.delete('redirected');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        fetchIntegrations();
        fetchPipelines();
    }, [fetchIntegrations, fetchPipelines]);

    const refresh = () => {
        inputsRefresh();
        statsRefresh();
        integrationsRefresh();
        pipelinesRefresh();
    };

    const isLoading = statsLoading || inputsLoading || integrationsLoading || pipelinesLoading || registryLoading;

    // Onboarding status
    const connectedCount = registryIntegrations.filter(
        ri => integrations?.[ri.id as keyof IntegrationsSummary]?.connected
    ).length;
    const hasConnections = connectedCount > 0;
    const hasPipelines = pipelines.length > 0;
    const hasActivities = activities.length > 0;
    const allOnboardingComplete = hasConnections && hasPipelines && hasActivities;

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
                    hasSyncs={hasActivities}
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

                <GalleryOfBoosts
                    activities={activities}
                    onActivityClick={(activityId) => navigate(`/activities/${activityId}`)}
                    loading={statsLoading}
                />
            </Stack>
        </PageLayout>
    );
};

export default DashboardPage;
