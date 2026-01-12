import React, { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { LoadingState } from '../components/ui/LoadingState';

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
    supportsOAuth: boolean;
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
    supportsOAuth
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
                ) : supportsOAuth ? (
                    <Button
                        variant="primary"
                        onClick={onConnect}
                        disabled={connecting}
                    >
                        {connecting ? 'Connecting...' : 'Connect'}
                    </Button>
                ) : (
                    <span className="api-key-note">Configure via admin CLI</span>
                )}
            </div>
        </Card>
    );
};

const IntegrationsPage: React.FC = () => {
    const api = useApi();
    const [integrations, setIntegrations] = useState<IntegrationsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<string | null>(null);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    const fetchIntegrations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/me/integrations');
            setIntegrations(response as IntegrationsSummary);
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleDisconnect = async (provider: 'strava' | 'fitbit' | 'hevy') => {
        if (!window.confirm(`Are you sure you want to disconnect ${provider}?`)) {
            return;
        }

        setDisconnecting(provider);
        try {
            await api.delete(`/users/me/integrations/${provider}`);
            await fetchIntegrations();
        } catch (error) {
            console.error(`Failed to disconnect ${provider}:`, error);
        } finally {
            setDisconnecting(null);
        }
    };

    if (loading) {
        return (
            <PageLayout title="Integrations" backTo="/settings" backLabel="Settings">
                <LoadingState />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Integrations"
            backTo="/settings"
            backLabel="Settings"
            onRefresh={fetchIntegrations}
        >
            <div className="integrations-grid">
                <IntegrationCard
                    name="hevy"
                    displayName="Hevy"
                    description="Strength training workout tracker"
                    icon="🏋️"
                    status={integrations?.hevy}
                    onConnect={() => {}}
                    onDisconnect={() => handleDisconnect('hevy')}
                    connecting={false}
                    disconnecting={disconnecting === 'hevy'}
                    supportsOAuth={false}
                />
                <IntegrationCard
                    name="strava"
                    displayName="Strava"
                    description="Upload activities to your Strava profile"
                    icon="🚴"
                    status={integrations?.strava}
                    onConnect={() => handleConnect('strava')}
                    onDisconnect={() => handleDisconnect('strava')}
                    connecting={connecting === 'strava'}
                    disconnecting={disconnecting === 'strava'}
                    supportsOAuth={true}
                />
                <IntegrationCard
                    name="fitbit"
                    displayName="Fitbit"
                    description="Sync activities from your Fitbit device"
                    icon="⌚"
                    status={integrations?.fitbit}
                    onConnect={() => handleConnect('fitbit')}
                    onDisconnect={() => handleDisconnect('fitbit')}
                    connecting={connecting === 'fitbit'}
                    disconnecting={disconnecting === 'fitbit'}
                    supportsOAuth={true}
                />
            </div>
        </PageLayout>
    );
};

export default IntegrationsPage;
