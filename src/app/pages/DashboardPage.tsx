import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInputs } from '../hooks/useInputs';
import { useActivities } from '../hooks/useActivities';
import { useRealtimeActivities } from '../hooks/useRealtimeActivities';
import { usePipelines } from '../hooks/usePipelines';
import { useIntegrations } from '../hooks/useIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { usePluginLookup } from '../hooks/usePluginLookup';
import { useUser } from '../hooks/useUser';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';
import { formatFieldLabel } from '../utils/formatters';

import { Card, CardSkeleton, EmptyState, ConnectionStatusItem, LoadingState, LiveToggle, Paragraph, Badge, Button, DashboardSummaryCard, SummaryListItem, PendingInputItem, Pill } from '../components/library/ui';
import { WelcomeBanner } from '../components/onboarding/WelcomeBanner';
import { GalleryOfBoosts } from '../components/dashboard/GalleryOfBoosts';
import { FileUploadPanel } from '../components/dashboard/FileUploadPanel';
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
    const { inputs, loading: inputsLoading, refresh: inputsRefresh } = useInputs();
    const { activities, loading: statsLoading, refresh: statsRefresh } = useActivities('dashboard');
    const { integrations, loading: integrationsLoading, refresh: integrationsRefresh, fetchIfNeeded: fetchIntegrations } = useIntegrations();
    const { pipelines, loading: pipelinesLoading, refresh: pipelinesRefresh, fetchIfNeeded: fetchPipelines } = usePipelines();
    const { user } = useUser();

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

    const { getSourceInfo, getSourceName, getSourceIcon, getDestinationName } = usePluginLookup();

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



    const getInputSourceInfo = (input: typeof inputs[0]): { source: string; icon: string; isAuto: boolean } => {
        const pipeline = input.pipelineId
            ? pipelines.find(p => p.id === input.pipelineId)
            : undefined;

        let sourceId = pipeline?.source?.toLowerCase() || '';
        if (!sourceId) {
            const [sourcePart] = (input.activityId || '').split(':');
            sourceId = sourcePart?.toLowerCase().replace('source_', '') || 'unknown';
        }
        sourceId = sourceId.replace('source_', '');

        const sourceInfo = getSourceInfo(sourceId);
        return { source: sourceInfo.name, icon: sourceInfo.icon, isAuto: input.autoPopulated === true };
    };



    if (isLoading && !integrations && pipelines.length === 0) {
        return (
            <PageLayout title="Dashboard" onRefresh={refresh} headerActions={liveToggle}>
                <LoadingState />
            </PageLayout>
        );
    }

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


            {user && (
                <Card variant={getEffectiveTier(user) === TIER_ATHLETE ? 'premium' : 'default'}>
                    <Stack direction="horizontal" align="center" justify="between">
                        <Badge variant={getEffectiveTier(user) === TIER_ATHLETE ? 'light' : 'default'}>
                            {getEffectiveTier(user) === TIER_ATHLETE ? '✨ ATHLETE' : 'HOBBYIST'}
                        </Badge>
                    <Stack direction="horizontal" align="center" gap="md">
                        {getEffectiveTier(user) === TIER_ATHLETE ? (
                            <>
                                {user.trialEndsAt && (() => {
                                    const daysLeft = Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    return daysLeft > 0 ? (
                                        <Paragraph inline>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</Paragraph>
                                    ) : null;
                                })()}
                                <Paragraph inline nowrap>Unlimited syncs</Paragraph>
                                <Button size="small" variant="secondary-light" onClick={() => navigate('/settings/subscription')}>Manage →</Button>
                            </>
                        ) : (
                            <>
                                <Paragraph inline>{user.syncCountThisMonth || 0}/25 syncs</Paragraph>
                                <Button size="small" variant="primary" onClick={() => navigate('/settings/subscription')}>Upgrade →</Button>
                            </>
                        )}
                    </Stack>
                    </Stack>
                </Card>
            )}

            <Stack gap="lg">
                <Grid cols={3} gap="md">
                    <DashboardSummaryCard
                        title="Connections"
                        icon="🔗"
                        linkTo="/settings/integrations"
                        linkLabel="Manage →"
                        footerText={<><strong>{connectedCount}</strong> of {registryIntegrations.length} connected</>}
                    >
                        {integrationsLoading && !integrations ? (
                            <CardSkeleton variant="connections" itemCount={4} />
                        ) : (
                            <Stack gap="xs">
                                {registryIntegrations.map(integration => {
                                    const status = integrations?.[integration.id as keyof IntegrationsSummary];
                                    return (
                                        <ConnectionStatusItem
                                            key={integration.id}
                                            name={integration.name}
                                            connected={status?.connected ?? false}
                                            icon={integration.icon}
                                            iconType={integration.iconType}
                                            iconPath={integration.iconPath}
                                        />
                                    );
                                })}
                            </Stack>
                        )}
                    </DashboardSummaryCard>

                    <DashboardSummaryCard
                        title="Pipelines"
                        icon="🔀"
                        linkTo="/settings/pipelines"
                        linkLabel="View All →"
                        footerText={pipelines.length > 0 ? <><strong>{pipelines.length}</strong> active pipeline{pipelines.length !== 1 ? 's' : ''}</> : undefined}
                    >
                        {pipelinesLoading && pipelines.length === 0 ? (
                            <CardSkeleton variant="pipelines" itemCount={3} />
                        ) : pipelines.length === 0 ? (
                            <EmptyState
                                variant="mini"
                                title="No pipelines configured"
                                actionLabel="Create First Pipeline"
                                onAction={() => navigate('/settings/pipelines/new')}
                            />
                        ) : (
                            <Stack gap="xs">
                                {pipelines.slice(0, 5).map(pipeline => (
                                    <SummaryListItem
                                        key={pipeline.id}
                                        title={pipeline.name || `${getSourceName(pipeline.source)}→${pipeline.destinations.map(d => getDestinationName(d)).join('/')}`}
                                        subtitle={pipeline.name ? `${getSourceIcon(pipeline.source)} ${getSourceName(pipeline.source)}→${pipeline.destinations.map(d => getDestinationName(d)).join('/')}` : undefined}
                                        status={<Pill variant="primary">{pipeline.enrichers?.length ?? 0} booster{(pipeline.enrichers?.length ?? 0) !== 1 ? 's' : ''}</Pill>}
                                    />
                                ))}
                                {pipelines.length > 5 && (
                                    <Paragraph muted size="sm">+{pipelines.length - 5} more...</Paragraph>
                                )}
                            </Stack>
                        )}
                    </DashboardSummaryCard>

                    <DashboardSummaryCard
                        title="Action Required"
                        icon="⚡"
                        linkTo="/inputs"
                        linkLabel="View All →"
                        showLink={inputs.length > 0}
                        footerText={<><strong>{inputs.length}</strong> pending</>}
                    >
                        {inputsLoading && inputs.length === 0 ? (
                            <CardSkeleton variant="actions" itemCount={2} />
                        ) : inputs.length === 0 ? (
                            <EmptyState
                                variant="mini"
                                icon="✓"
                                title="All caught up! No pending actions."
                            />
                        ) : (
                            <Stack gap="xs">
                                {inputs.slice(0, 3).map(input => {
                                    const sourceInfo = getInputSourceInfo(input);
                                    const formattedFields = input.requiredFields?.map(formatFieldLabel).join(', ') || 'input';
                                    return (
                                        <PendingInputItem
                                            key={input.id}
                                            icon={sourceInfo.icon}
                                            title={<Stack direction="horizontal" gap="sm" align="center">{sourceInfo.source}{sourceInfo.isAuto && <Badge variant="warning" size="sm">Awaiting</Badge>}</Stack>}
                                            subtitle={sourceInfo.isAuto ? 'Waiting for results...' : `Needs: ${formattedFields}`}
                                            variant={sourceInfo.isAuto ? 'awaiting' : 'needs-input'}
                                            onClick={() => navigate('/inputs')}
                                        />
                                    );
                                })}
                            </Stack>
                        )}
                    </DashboardSummaryCard>
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
