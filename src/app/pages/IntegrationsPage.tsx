import React, { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { useIntegrations } from '../hooks/useIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import '../components/ui/CardSkeleton.css';
import { ApiKeySetupModal } from '../components/integrations/ApiKeySetupModal';
import { IntegrationAuthType, IntegrationManifest } from '../types/plugin';

interface IntegrationStatus {
    connected: boolean;
    externalUserId?: string;
    lastUsedAt?: string;
}

interface IntegrationsSummary {
    hevy?: IntegrationStatus;
    strava?: IntegrationStatus;
    fitbit?: IntegrationStatus;
}

interface IntegrationCardProps {
    name: string;
    displayName: string;
    description: string;
    icon: string;
    status: IntegrationStatus | undefined;
    onConnect: () => void;
    onDisconnect: () => void;
    connecting: boolean;
    disconnecting: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
    displayName,
    description,
    icon,
    status,
    onConnect,
    onDisconnect,
    connecting,
    disconnecting,
}) => {
    const isConnected = status?.connected ?? false;

    return (
        <Card className="integration-card">
            <div className="integration-header">
                <span className="integration-icon">{icon}</span>
                <div className="integration-info">
                    <h3>{displayName}</h3>
                    <p className="integration-description">{description}</p>
                </div>
            </div>
            <div className="integration-status">
                <span className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '✓ Connected' : '○ Not Connected'}
                </span>
                {isConnected && status?.externalUserId && (
                    <span className="external-id">ID: {status.externalUserId}</span>
                )}
                {isConnected && status?.lastUsedAt && (
                    <span className="last-used">
                        Last used: {new Date(status.lastUsedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
            <div className="integration-actions">
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
                        disabled={connecting}
                    >
                        {connecting ? 'Connecting...' : 'Connect'}
                    </Button>
                )}
            </div>
        </Card>
    );
};

const IntegrationsPage: React.FC = () => {
    const api = useApi();
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations, loading, refresh: refreshIntegrations, fetchIfNeeded } = useIntegrations();
    const [connecting, setConnecting] = useState<string | null>(null);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);
    const [setupModalIntegration, setSetupModalIntegration] = useState<IntegrationManifest | null>(null);

    useEffect(() => {
        fetchIfNeeded();
    }, [fetchIfNeeded]);

    const handleConnect = async (provider: 'strava' | 'fitbit') => {
        setConnecting(provider);
        try {
            const response = await api.post(`/users/me/integrations/${provider}/connect`);
            const { url } = response as { url: string };
            // Redirect to OAuth flow
            window.location.href = url;
        } catch (error) {
            console.error(`Failed to connect ${provider}:`, error);
        } finally {
            setConnecting(null);
        }
    };

    const handleApiKeyConnect = (integration: IntegrationManifest) => {
        setSetupModalIntegration(integration);
    };

    const handleSetupSuccess = async () => {
        setSetupModalIntegration(null);
        await refreshIntegrations();
    };

    const handleDisconnect = async (provider: 'strava' | 'fitbit' | 'hevy') => {
        if (!window.confirm(`Are you sure you want to disconnect ${provider}?`)) {
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
            <PageLayout title="Integrations" backTo="/" backLabel="Dashboard">
                <div className="integrations-grid">
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Integrations"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={refreshIntegrations}
        >
            <div className="integrations-grid">
                {registryIntegrations.map(integration => {
                    const status = integrations?.[integration.id as keyof IntegrationsSummary];
                    const supportsOAuth = integration.authType === IntegrationAuthType.OAUTH;
                    return (
                        <IntegrationCard
                            key={integration.id}
                            name={integration.id}
                            displayName={integration.name}
                            description={integration.description || ''}
                            icon={integration.icon || '🔌'}
                            status={status}
                            onConnect={() => supportsOAuth
                                ? handleConnect(integration.id as 'strava' | 'fitbit')
                                : handleApiKeyConnect(integration)
                            }
                            onDisconnect={() => handleDisconnect(integration.id as 'strava' | 'fitbit' | 'hevy')}
                            connecting={connecting === integration.id}
                            disconnecting={disconnecting === integration.id}
                        />
                    );
                })}
            </div>

            {setupModalIntegration && (
                <ApiKeySetupModal
                    integration={setupModalIntegration}
                    onClose={() => setSetupModalIntegration(null)}
                    onSuccess={handleSetupSuccess}
                />
            )}
        </PageLayout>
    );
};

export default IntegrationsPage;
