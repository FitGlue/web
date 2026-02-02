import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Button, PluginIcon, CardSkeleton, ConfirmDialog, Pill, Heading, Paragraph, Card, useToast } from '../components/library/ui';
import { useApi } from '../hooks/useApi';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import '../components/library/ui/CardSkeleton.css';
import { IntegrationManifest } from '../types/plugin';

interface IntegrationStatus {
    connected: boolean;
    externalUserId?: string;
    lastUsedAt?: string;
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
        <Card variant={isConnected ? 'elevated' : 'default'}>
            <Stack gap="md">
                <Stack direction="horizontal" align="center" gap="md">
                    <PluginIcon
                        icon={integration.icon}
                        iconType={integration.iconType}
                        iconPath={integration.iconPath}
                        size="medium"

                    />
                    <Stack gap="xs">
                        <Heading level={3} size="md">{integration.name}</Heading>
                        <Paragraph muted size="sm">{integration.description}</Paragraph>
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
                            Last synced: {new Date(status.lastUsedAt).toLocaleDateString()}
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
                        >
                            Connect
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Card>
    );
};

const ConnectionsPage: React.FC = () => {
    const navigate = useNavigate();
    const api = useApi();
    const toast = useToast();
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations, loading, refresh: refreshIntegrations } = useRealtimeIntegrations();
    const [disconnecting, setDisconnecting] = useState<string | null>(null);
    const [disconnectConfirm, setDisconnectConfirm] = useState<{ id: string, name: string } | null>(null);

    const handleConnect = (integration: IntegrationManifest) => {
        navigate(`/connections/${integration.id}/setup`);
    };

    const handleRequestDisconnect = (provider: string) => {
        const integration = registryIntegrations.find(i => i.id === provider);
        const displayName = integration?.name || provider;
        setDisconnectConfirm({ id: provider, name: displayName });
    };

    const handleDisconnectConfirm = async () => {
        if (!disconnectConfirm) return;
        const provider = disconnectConfirm.id;
        const displayName = disconnectConfirm.name;
        setDisconnectConfirm(null);
        setDisconnecting(provider);
        try {
            await api.delete(`/users/me/integrations/${provider}`);
            await refreshIntegrations();
            toast.success('Disconnected', `${displayName} has been disconnected`);
        } catch (error) {
            console.error(`Failed to disconnect ${provider}:`, error);
            toast.error('Disconnect Failed', `Failed to disconnect ${displayName}. Please try again.`);
        } finally {
            setDisconnecting(null);
        }
    };

    if (loading || registryLoading) {
        return (
            <PageLayout title="Connections" backTo="/" backLabel="Dashboard">
                <Paragraph>
                    Connect your fitness apps and devices to sync your data with FitGlue.
                </Paragraph>
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
            title="Connections"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={refreshIntegrations}
        >
            <Paragraph>
                Connect your fitness apps and devices to sync your data with FitGlue.
            </Paragraph>

            <Grid>
                {registryIntegrations.map(integration => {
                    const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[integration.id];
                    return (
                        <ConnectionCard
                            key={integration.id}
                            integration={integration}
                            status={status}
                            onConnect={() => handleConnect(integration)}
                            onDisconnect={() => handleRequestDisconnect(integration.id)}
                            disconnecting={disconnecting === integration.id}
                        />
                    );
                })}
            </Grid>

            <ConfirmDialog
                isOpen={!!disconnectConfirm}
                title="Disconnect Integration"
                message={`Are you sure you want to disconnect ${disconnectConfirm?.name}? You'll need to reconnect to sync activities again.`}
                confirmLabel="Disconnect"
                isDestructive={true}
                onConfirm={handleDisconnectConfirm}
                onCancel={() => setDisconnectConfirm(null)}
                isLoading={!!disconnecting}
            />
        </PageLayout>
    );
};

export default ConnectionsPage;
