import React, { useEffect, useState } from 'react';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, Button, CardSkeleton, ConfirmDialog, Pill, Heading, Paragraph } from '../components/library/ui';
import { useApi } from '../hooks/useApi';
import { useIntegrations } from '../hooks/useIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import '../components/library/ui/CardSkeleton.css';
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
        <Card>
            <Stack direction="horizontal" align="center" gap="md">
                <Paragraph size="lg">{icon}</Paragraph>
                <Stack gap="xs">
                    <Heading level={3} size="md">{displayName}</Heading>
                    <Paragraph size="sm" muted>{description}</Paragraph>
                </Stack>
            </Stack>
            <Stack direction="horizontal" align="center" gap="sm" wrap>
                <Pill variant={isConnected ? 'success' : 'default'}>
                    {isConnected ? '✓ Connected' : '○ Not Connected'}
                </Pill>
                {isConnected && status?.externalUserId && (
                    <Paragraph size="sm" muted>ID: {status.externalUserId}</Paragraph>
                )}
                {isConnected && status?.lastUsedAt && (
                    <Paragraph size="sm" muted>
                        Last used: {new Date(status.lastUsedAt).toLocaleDateString()}
                    </Paragraph>
                )}
            </Stack>
            <Stack>
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
            </Stack>
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
    const [disconnectConfirm, setDisconnectConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchIfNeeded();
    }, [fetchIfNeeded]);

    const handleConnect = async (provider: 'strava' | 'fitbit') => {
        setConnecting(provider);
        try {
            const response = await api.post(`/users/me/integrations/${provider}/connect`);
            const { url } = response as { url: string };
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

    const handleDisconnectConfirm = async () => {
        if (!disconnectConfirm) return;
        const provider = disconnectConfirm;
        setDisconnectConfirm(null);
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
                <Grid>
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                </Grid>
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
            <Grid>
                {registryIntegrations.map(integration => {
                    const status = integrations?.[integration.id as keyof IntegrationsSummary];
                    const supportsOAuth = integration.authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_OAUTH;
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
                            onDisconnect={() => setDisconnectConfirm(integration.id)}
                            connecting={connecting === integration.id}
                            disconnecting={disconnecting === integration.id}
                        />
                    );
                })}
            </Grid>

            {setupModalIntegration && (
                <ApiKeySetupModal
                    integration={setupModalIntegration}
                    onClose={() => setSetupModalIntegration(null)}
                    onSuccess={handleSetupSuccess}
                />
            )}

            <ConfirmDialog
                isOpen={!!disconnectConfirm}
                title="Disconnect Integration"
                message={`Are you sure you want to disconnect ${disconnectConfirm}? You'll need to reconnect to sync activities again.`}
                confirmLabel="Disconnect"
                isDestructive={true}
                onConfirm={handleDisconnectConfirm}
                onCancel={() => setDisconnectConfirm(null)}
                isLoading={!!disconnecting}
            />
        </PageLayout>
    );
};

export default IntegrationsPage;
