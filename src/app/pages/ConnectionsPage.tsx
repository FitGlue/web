import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { useIntegrations } from '../hooks/useIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import '../components/ui/CardSkeleton.css';
import { IntegrationManifest } from '../types/plugin';

interface IntegrationStatus {
    connected: boolean;
    externalUserId?: string;
    lastUsedAt?: string;
}

interface IntegrationsSummary {
    hevy?: IntegrationStatus;
    strava?: IntegrationStatus;
    fitbit?: IntegrationStatus;
    'apple-health'?: IntegrationStatus;
    'health-connect'?: IntegrationStatus;
}

interface ConnectionCardProps {
    integration: IntegrationManifest;
    status: IntegrationStatus | undefined;
    onConnect: () => void;
    onDisconnect: () => void;
    disconnecting: boolean;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
    integration,
    status,
    onConnect,
    onDisconnect,
    disconnecting,
}) => {
    const isConnected = status?.connected ?? false;

    return (
        <div className={`connection-card ${isConnected ? 'connection-card--connected' : ''}`}>
            <div className="connection-card__header">
                <span className="connection-card__icon">{integration.icon}</span>
                <div className="connection-card__info">
                    <h3 className="connection-card__name">{integration.name}</h3>
                    <p className="connection-card__description">{integration.description}</p>
                </div>
            </div>

            <div className="connection-card__status">
                <span className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '✓ Connected' : '○ Not Connected'}
                </span>
                {isConnected && status?.externalUserId && (
                    <span className="connection-card__external-id">ID: {status.externalUserId}</span>
                )}
                {isConnected && status?.lastUsedAt && (
                    <span className="connection-card__last-used">
                        Last synced: {new Date(status.lastUsedAt).toLocaleDateString()}
                    </span>
                )}
            </div>

            <div className="connection-card__actions">
                {isConnected ? (
                    <Button
                        variant="danger"
                        onClick={onDisconnect}
                        disabled={disconnecting}
                    >
                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={onConnect}
                    >
                        Connect
                    </Button>
                )}
            </div>
        </div>
    );
};

const ConnectionsPage: React.FC = () => {
    const navigate = useNavigate();
    const api = useApi();
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations, loading, refresh: refreshIntegrations, fetchIfNeeded } = useIntegrations();
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    useEffect(() => {
        fetchIfNeeded();
    }, [fetchIfNeeded]);

    const handleConnect = (integration: IntegrationManifest) => {
        // Navigate to the setup page for this connection
        navigate(`/connections/${integration.id}/setup`);
    };

    const handleDisconnect = async (provider: string) => {
        const integration = registryIntegrations.find(i => i.id === provider);
        const displayName = integration?.name || provider;

        if (!window.confirm(`Are you sure you want to disconnect ${displayName}?`)) {
            return;
        }

        setDisconnecting(provider);
        try {
            await api.delete(`/users/me/integrations/${provider}`);
            await refreshIntegrations();
        } catch (error) {
            console.error(`Failed to disconnect ${provider}:`, error);
        } finally {
            setDisconnecting(null);
        }
    };

    if (loading || registryLoading) {
        return (
            <PageLayout title="Connections" backTo="/" backLabel="Dashboard">
                <p className="connections-intro">
                    Connect your fitness apps and devices to sync your data with FitGlue.
                </p>
                <div className="connections-grid">
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Connections"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={refreshIntegrations}
        >
            <p className="connections-intro">
                Connect your fitness apps and devices to sync your data with FitGlue.
            </p>

            <div className="connections-grid">
                {registryIntegrations.map(integration => {
                    const status = integrations?.[integration.id as keyof IntegrationsSummary];
                    return (
                        <ConnectionCard
                            key={integration.id}
                            integration={integration}
                            status={status}
                            onConnect={() => handleConnect(integration)}
                            onDisconnect={() => handleDisconnect(integration.id)}
                            disconnecting={disconnecting === integration.id}
                        />
                    );
                })}
            </div>
        </PageLayout>
    );
};

export default ConnectionsPage;
