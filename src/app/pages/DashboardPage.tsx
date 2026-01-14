import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useInputs } from '../hooks/useInputs';
import { useActivities } from '../hooks/useActivities';
import { usePipelines } from '../hooks/usePipelines';
import { useIntegrations } from '../hooks/useIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { WelcomeBanner } from '../components/onboarding/WelcomeBanner';
import { IntegrationsSummary } from '../state/integrationsState';

interface ActivitySummary {
    activityId: string;
    title?: string;
    type?: string;
    source?: string;
    syncedAt?: string;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { sources, destinations, loading: registryLoading } = usePluginRegistry();
    const { inputs, loading: inputsLoading, refresh: inputsRefresh } = useInputs();
    const { activities, stats, loading: statsLoading, refresh: statsRefresh } = useActivities('list');
    const { integrations, loading: integrationsLoading, refresh: integrationsRefresh, fetchIfNeeded: fetchIntegrations } = useIntegrations();
    const { pipelines, loading: pipelinesLoading, refresh: pipelinesRefresh, fetchIfNeeded: fetchPipelines } = usePipelines();

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

    const recentActivities = activities.slice(0, 5);

    if (isLoading && !integrations && pipelines.length === 0) {
        return (
            <PageLayout title="Dashboard" onRefresh={refresh}>
                <LoadingState />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Dashboard" onRefresh={refresh} loading={isLoading}>
            {/* Welcome Banner for new users */}
            {connectedCount === 0 && !isLoading && (
                <WelcomeBanner />
            )}

            {/* Quick Actions */}
            <div className="dashboard-quick-actions">
                <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
                    + New Pipeline
                </Button>
                <Button variant="secondary" onClick={() => navigate('/settings/integrations')}>
                    Manage Integrations
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="dashboard-grid">
                {/* Connection Status */}
                <Card className="dashboard-card status-card">
                    <div className="card-header-row">
                        <h3>🔗 Connections</h3>
                        <Link to="/settings/integrations" className="card-link">Manage →</Link>
                    </div>
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
                </Card>

                {/* Pipeline Status */}
                <Card className="dashboard-card pipelines-card">
                    <div className="card-header-row">
                        <h3>🔀 Pipelines</h3>
                        <Link to="/settings/pipelines" className="card-link">View All →</Link>
                    </div>
                    {pipelines.length === 0 ? (
                        <div className="empty-state-mini">
                            <p>No pipelines configured</p>
                            <Button variant="primary" size="small" onClick={() => navigate('/settings/pipelines/new')}>
                                Create First Pipeline
                            </Button>
                        </div>
                    ) : (
                        <div className="pipelines-summary">
                            {pipelines.slice(0, 3).map(pipeline => (
                                <div key={pipeline.id} className="pipeline-summary-item">
                                    <span className="pipeline-flow-mini">
                                        {getSourceIcon(pipeline.source)} {getSourceName(pipeline.source)}
                                        <span className="arrow">→</span>
                                        {pipeline.destinations.map((d, i) => (
                                            <span key={i}>{getDestinationName(d)}</span>
                                        ))}
                                    </span>
                                    <span className="enricher-count">
                                        {pipeline.enrichers.length} enricher{pipeline.enrichers.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            ))}
                            {pipelines.length > 3 && (
                                <p className="more-info">+{pipelines.length - 3} more...</p>
                            )}
                        </div>
                    )}
                    <div className="card-footer-stat">
                        <strong>{pipelines.length}</strong> active pipeline{pipelines.length !== 1 ? 's' : ''}
                    </div>
                </Card>

                {/* Pending Actions */}
                <Card className="dashboard-card actions-card">
                    <div className="card-header-row">
                        <h3>⚡ Action Required</h3>
                        {inputs.length > 0 && <Link to="/inputs" className="card-link">View All →</Link>}
                    </div>
                    {inputs.length === 0 ? (
                        <div className="all-clear">
                            <span className="check-icon">✓</span>
                            <p>All caught up! No pending actions.</p>
                        </div>
                    ) : (
                        <div className="pending-list">
                            {inputs.slice(0, 3).map(input => (
                                <div key={input.id} className="pending-item" onClick={() => navigate('/inputs')}>
                                    <span className="pending-icon">📝</span>
                                    <div className="pending-info">
                                        <span className="pending-activity">{input.activityId}</span>
                                        <span className="pending-fields">
                                            Needs: {input.requiredFields?.join(', ') || 'input'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="card-footer-stat">
                        <strong>{inputs.length}</strong> pending
                    </div>
                </Card>

                {/* Stats Summary */}
                <Card className="dashboard-card stats-card">
                    <div className="card-header-row">
                        <h3>📊 Activity Stats</h3>
                        <Link to="/activities" className="card-link">View All →</Link>
                    </div>
                    <div className="stats-summary">
                        <div className="stat-item">
                            <span className="stat-number">{stats.synchronizedCount}</span>
                            <span className="stat-label">Synced This Week</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{activities.length}</span>
                            <span className="stat-label">Total Activities</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activities */}
            {recentActivities.length > 0 && (
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>🏃 Recent Activities</h3>
                        <Link to="/activities" className="section-link">View All →</Link>
                    </div>
                    <div className="recent-activities-list">
                        {recentActivities.map((activity: ActivitySummary) => (
                            <Card
                                key={activity.activityId}
                                className="activity-mini-card clickable"
                                onClick={() => navigate(`/activities/${activity.activityId}`)}
                            >
                                <div className="activity-mini-content">
                                    <div className="activity-mini-left">
                                        <span className="activity-type-badge">{activity.type || 'Activity'}</span>
                                        <span className="activity-title">{activity.title || 'Untitled'}</span>
                                    </div>
                                    <div className="activity-mini-right">
                                        <span className="activity-source">{activity.source}</span>
                                        {activity.syncedAt && (
                                            <span className="activity-date">
                                                {new Date(activity.syncedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default DashboardPage;
