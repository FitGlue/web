import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useInputs } from '../hooks/useInputs';
import { useActivities } from '../hooks/useActivities';
import { useRealtimeActivities } from '../hooks/useRealtimeActivities';
import { usePipelines } from '../hooks/usePipelines';
import { useIntegrations } from '../hooks/useIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useUser } from '../hooks/useUser';
import { PageLayout } from '../components/layout/PageLayout';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';

import { Card } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import '../components/ui/CardSkeleton.css';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
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
        // Check localStorage on initial render to avoid pop
        return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
    });
    const { sources, destinations, integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { inputs, loading: inputsLoading, refresh: inputsRefresh } = useInputs();
    const { activities, loading: statsLoading, refresh: statsRefresh } = useActivities('dashboard');
    const { integrations, loading: integrationsLoading, refresh: integrationsRefresh, fetchIfNeeded: fetchIntegrations } = useIntegrations();
    const { pipelines, loading: pipelinesLoading, refresh: pipelinesRefresh, fetchIfNeeded: fetchPipelines } = usePipelines();
    const { user } = useUser();

    // PHASE 3: Enable real-time activity updates via Firestore listeners
    // This automatically updates the dashboard when new activities are synchronized
    const { isEnabled: liveEnabled, isListening, toggleRealtime } = useRealtimeActivities(true, 10);

    // Live status toggle button for header
    const liveToggle = (
        <button
            className={`live-toggle-btn ${isListening ? 'active' : ''}`}
            onClick={toggleRealtime}
            title={liveEnabled ? 'Live updates enabled (click to disable)' : 'Live updates disabled (click to enable)'}
            aria-label={liveEnabled ? 'Disable live updates' : 'Enable live updates'}
        >
            <span className={`live-dot ${isListening ? 'pulsing' : ''}`} />
            <span className="live-label">{isListening ? 'LIVE' : 'OFF'}</span>
        </button>
    );

    // Check for redirect notification flag
    useEffect(() => {
        if (searchParams.get('redirected') === 'true') {
            setShowRedirectNotification(true);
            // Clean up the URL
            searchParams.delete('redirected');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);


    // Fetch data on mount (only if stale or not loaded)
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

    // Helper functions
    const getSourceName = (source: string): string => {
        const normalized = String(source).toLowerCase().replace('source_', '');
        const found = sources.find(s => s.id === normalized);
        return found?.name || normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    const getSourceIcon = (source: string): string => {
        const normalized = String(source).toLowerCase().replace('source_', '');
        const found = sources.find(s => s.id === normalized);
        return found?.icon || '📥';
    };

    const getDestinationName = (dest: string | number): string => {
        const normalized = String(dest).toLowerCase();
        const found = destinations.find(d =>
            d.id === normalized ||
            d.destinationType === Number(dest)
        );
        return found?.name || (typeof dest === 'string'
            ? dest.charAt(0).toUpperCase() + dest.slice(1).toLowerCase()
            : `Destination ${dest}`);
    };

    const connectedCount = registryIntegrations.filter(
        ri => integrations?.[ri.id as keyof IntegrationsSummary]?.connected
    ).length;

    // Track onboarding completion state - once complete, cache it
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

    // Parse activity ID (e.g., "FITBIT:217758352929208470") into friendly display
    const parseActivityId = (activityId: string): { source: string; icon: string; timestamp: string } => {
        const [sourcePart, idPart] = activityId.split(':');
        const source = sourcePart?.toLowerCase() || 'unknown';

        // Get source icon from registry
        const sourceInfo = registryIntegrations.find(ri => ri.id === source);
        const icon = sourceInfo?.icon || '📥';
        const sourceName = sourceInfo?.name || source.charAt(0).toUpperCase() + source.slice(1);

        // Try to parse the ID as a timestamp (if numeric)
        let timestamp = 'Activity';
        if (idPart && /^\d+$/.test(idPart)) {
            // Fitbit IDs include timestamp - convert from Fitbit's format
            const date = new Date(parseInt(idPart));
            if (!isNaN(date.getTime()) && date.getFullYear() > 2020) {
                timestamp = date.toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                });
            }
        }

        return { source: sourceName, icon, timestamp };
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
            {/* Redirect Notification (shown when redirected from 404) */}
            {showRedirectNotification && (
                <RedirectNotification
                    onDismiss={() => setShowRedirectNotification(false)}
                />
            )}

            {/* Welcome Banner for new users - show until all onboarding steps complete */}
            {!onboardingComplete && !isLoading && !allOnboardingComplete && (
                <WelcomeBanner
                    hasConnections={hasConnections}
                    hasPipelines={hasPipelines}
                    hasSyncs={hasActivities}
                />
            )}


            {/* Plan & Usage Banner */}
            {user && (
                <div className={`plan-banner ${getEffectiveTier(user) === TIER_ATHLETE ? 'athlete' : 'hobbyist'}`}>
                    <span className={`plan-badge ${getEffectiveTier(user) === TIER_ATHLETE ? 'athlete' : 'hobbyist'}`}>
                        {getEffectiveTier(user) === TIER_ATHLETE ? '✨ ATHLETE' : 'HOBBYIST'}
                    </span>
                    <div className="usage-mini">
                        {getEffectiveTier(user) === TIER_ATHLETE ? (
                            <>
                                {user.trialEndsAt && (() => {
                                    const daysLeft = Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    return daysLeft > 0 ? (
                                        <span className="trial-pill">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                                    ) : null;
                                })()}
                                <span className="unlimited">Unlimited syncs</span>
                                <Link to="/settings/subscription" className="manage-pill">Manage →</Link>
                            </>
                        ) : (
                            <>
                                <div className="usage-bar-mini">
                                    <div
                                        className="usage-fill-mini"
                                        style={{ width: `${Math.min(100, ((user.syncCountThisMonth || 0) / 25) * 100)}%` }}
                                    />
                                </div>
                                <span className="usage-text">{user.syncCountThisMonth || 0}/25 syncs</span>
                                <Link to="/settings/subscription" className="upgrade-link">Upgrade →</Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Overview Cards */}
            <div className="dashboard-grid">
                {/* Connection Status */}
                <Card className="dashboard-card status-card">
                    <div className="card-header-row">
                        <h3>🔗 Connections</h3>
                        <Link to="/settings/integrations" className="card-link">Manage →</Link>
                    </div>
                    {integrationsLoading && !integrations ? (
                        <CardSkeleton variant="connections" itemCount={4} />
                    ) : (
                        <>
                            <div className="connections-list">
                                {registryIntegrations.map(integration => {
                                    const status = integrations?.[integration.id as keyof IntegrationsSummary];
                                    return (
                                        <div key={integration.id} className={`connection-item ${status?.connected ? 'connected' : ''}`}>
                                            <span className="connection-icon">{integration.icon}</span>
                                            <span className="connection-name">{integration.name}</span>
                                            <span className={`connection-status ${status?.connected ? 'active' : 'inactive'}`}>
                                                {status?.connected ? '✓' : '○'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="card-footer-stat">
                                <strong>{connectedCount}</strong> of {registryIntegrations.length} connected
                            </div>
                        </>
                    )}
                </Card>

                {/* Pipeline Status */}
                <Card className="dashboard-card pipelines-card">
                    <div className="card-header-row">
                        <h3>🔀 Pipelines</h3>
                        <Link to="/settings/pipelines" className="card-link">View All →</Link>
                    </div>
                    {pipelinesLoading && pipelines.length === 0 ? (
                        <CardSkeleton variant="pipelines" itemCount={3} />
                    ) : pipelines.length === 0 ? (
                        <div className="empty-state-mini">
                            <p>No pipelines configured</p>
                            <Button variant="primary" size="small" onClick={() => navigate('/settings/pipelines/new')}>
                                Create First Pipeline
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="pipelines-summary">
                                {pipelines.slice(0, 3).map(pipeline => (
                                    <div key={pipeline.id} className="pipeline-summary-item">
                                        {pipeline.name && (
                                            <span className="pipeline-name-mini">{pipeline.name}</span>
                                        )}
                                        <span className="pipeline-flow-mini">
                                            <span className="pipeline-source-mini">
                                                {getSourceIcon(pipeline.source)} {getSourceName(pipeline.source)}
                                            </span>
                                            <span className="arrow">→</span>
                                            <span className="pipeline-destinations-mini">
                                                {pipeline.destinations.map((d, i) => (
                                                    <span key={i} className="destination-item">
                                                        {i > 0 && <span className="destination-separator">/</span>}
                                                        {getDestinationName(d)}
                                                    </span>
                                                ))}
                                            </span>
                                        </span>
                                        <span className="enricher-count">
                                            {pipeline.enrichers?.length ?? 0} enricher{(pipeline.enrichers?.length ?? 0) !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ))}
                                {pipelines.length > 3 && (
                                    <p className="more-info">+{pipelines.length - 3} more...</p>
                                )}
                            </div>
                            <div className="card-footer-stat">
                                <strong>{pipelines.length}</strong> active pipeline{pipelines.length !== 1 ? 's' : ''}
                            </div>
                        </>
                    )}
                </Card>

                {/* Pending Actions */}
                <Card className="dashboard-card actions-card">
                    <div className="card-header-row">
                        <h3>⚡ Action Required</h3>
                        {inputs.length > 0 && <Link to="/inputs" className="card-link">View All →</Link>}
                    </div>
                    {inputsLoading && inputs.length === 0 ? (
                        <CardSkeleton variant="actions" itemCount={2} />
                    ) : inputs.length === 0 ? (
                        <>
                            <div className="all-clear">
                                <span className="check-icon">✓</span>
                                <p>All caught up! No pending actions.</p>
                            </div>
                            <div className="card-footer-stat">
                                <strong>{inputs.length}</strong> pending
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="pending-list">
                                {inputs.slice(0, 3).map(input => {
                                    const parsed = parseActivityId(input.activityId);
                                    return (
                                        <div key={input.id} className="pending-item" onClick={() => navigate('/inputs')}>
                                            <span className="pending-icon">{parsed.icon}</span>
                                            <div className="pending-info">
                                                <span className="pending-activity">
                                                    {parsed.source} • {parsed.timestamp}
                                                </span>
                                                <span className="pending-fields">
                                                    Needs: {input.requiredFields?.join(', ') || 'input'}
                                                </span>
                                            </div>
                                            <span className="pending-arrow">→</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="card-footer-stat">
                                <strong>{inputs.length}</strong> pending
                            </div>
                        </>
                    )}
                </Card>
            </div>


            {/* File Upload Panel - Only shows if user has file_upload pipelines */}
            <FileUploadPanel />

            {/* Gallery of Boosts - Visual Proof of Enrichments */}
            <GalleryOfBoosts
                activities={activities}
                onActivityClick={(activityId) => navigate(`/activities/${activityId}`)}
                loading={statsLoading}
            />
        </PageLayout>
    );
};

export default DashboardPage;
