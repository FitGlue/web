import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout, Stack } from '../components/library/layout';
import {
    Button, Heading, Paragraph, CardSkeleton, Card, Badge, ConfirmDialog, useToast
} from '../components/library/ui';
import { PluginIcon } from '../components/library/ui/PluginIcon';
import { useApi } from '../hooks/useApi';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { IntegrationAuthType } from '../types/plugin';
import '../components/library/ui/CardSkeleton.css';

interface IntegrationStatus {
    connected: boolean;
    externalUserId?: string;
    lastUsedAt?: string;
}

const ConnectionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const api = useApi();
    const toast = useToast();
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations, loading: integrationsLoading, refresh } = useRealtimeIntegrations();

    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [copied, setCopied] = useState(false);

    const integration = registryIntegrations.find(i => i.id === id);
    const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[id || ''];
    const isConnected = status?.connected ?? false;

    // Format last synced date
    const formatLastSynced = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const handleCopyId = async () => {
        if (!status?.externalUserId) return;
        try {
            await navigator.clipboard.writeText(status.externalUserId);
            setCopied(true);
            toast.success('Copied', 'ID copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed', 'Could not copy to clipboard');
        }
    };

    const handleReconnect = () => {
        navigate(`/connections/${id}/setup`);
    };

    const handleDisconnect = async () => {
        setShowDisconnectConfirm(false);
        setDisconnecting(true);
        try {
            await api.delete(`/users/me/integrations/${id}`);
            await refresh();
            toast.success('Disconnected', `${integration?.name} has been disconnected`);
            navigate('/connections');
        } catch (error) {
            console.error('Failed to disconnect:', error);
            toast.error('Failed', 'Could not disconnect. Please try again.');
        } finally {
            setDisconnecting(false);
        }
    };

    // Loading state
    if (registryLoading || integrationsLoading) {
        return (
            <PageLayout title="Connection" backTo="/connections" backLabel="Connections">
                <Stack gap="lg">
                    <CardSkeleton variant="integration" />
                </Stack>
            </PageLayout>
        );
    }

    // Integration not found
    if (!integration) {
        return (
            <PageLayout title="Connection Not Found" backTo="/connections" backLabel="Connections">
                <Card>
                    <Stack gap="md">
                        <Paragraph>This connection type does not exist.</Paragraph>
                        <Button variant="primary" onClick={() => navigate('/connections')}>
                            Back to Connections
                        </Button>
                    </Stack>
                </Card>
            </PageLayout>
        );
    }

    // Not connected - redirect to setup
    if (!isConnected) {
        return (
            <PageLayout title={integration.name} backTo="/connections" backLabel="Connections">
                <Card variant="elevated">
                    <Stack gap="lg">
                        <Stack direction="horizontal" align="center" gap="md">
                            <PluginIcon
                                icon={integration.icon}
                                iconType={integration.iconType}
                                iconPath={integration.iconPath}
                                size="large"
                            />
                            <Stack gap="xs">
                                <Heading level={2}>{integration.name}</Heading>
                                <Badge variant="default">Not Connected</Badge>
                            </Stack>
                        </Stack>

                        <Paragraph>{integration.description}</Paragraph>

                        <Stack direction="horizontal" gap="sm" justify="end">
                            <Button variant="secondary" onClick={() => navigate('/connections')}>
                                Back
                            </Button>
                            <Button variant="primary" onClick={() => navigate(`/connections/${id}/setup`)}>
                                Connect {integration.name}
                            </Button>
                        </Stack>
                    </Stack>
                </Card>
            </PageLayout>
        );
    }

    const authType = integration.authType as number;
    const isOAuth = authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_OAUTH;
    const isAppSync = authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_APP_SYNC;

    return (
        <PageLayout
            title={integration.name}
            backTo="/connections"
            backLabel="Connections"
        >
            <Card variant="elevated">
                <Stack gap="lg">
                    {/* Header with icon and status */}
                    <Stack direction="horizontal" align="center" gap="md">
                        <PluginIcon
                            icon={integration.icon}
                            iconType={integration.iconType}
                            iconPath={integration.iconPath}
                            size="large"
                        />
                        <Stack gap="xs">
                            <Heading level={2}>{integration.name}</Heading>
                            <Badge variant="success">
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline size="sm">✓</Paragraph>
                                    <Paragraph inline size="sm">Connected</Paragraph>
                                </Stack>
                            </Badge>
                        </Stack>
                    </Stack>

                    {/* Connection Details */}
                    <Card variant="default">
                        <Stack gap="md">
                            <Heading level={4}>Connection Details</Heading>

                            {status?.externalUserId && (
                                <Stack direction="horizontal" justify="between" align="center">
                                    <Stack gap="xs">
                                        <Paragraph size="sm" muted>
                                            {integration.apiKeyLabel || 'ID'}
                                        </Paragraph>
                                        <Paragraph>
                                            <code>{status.externalUserId}</code>
                                        </Paragraph>
                                    </Stack>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={handleCopyId}
                                    >
                                        {copied ? '✓ Copied' : 'Copy'}
                                    </Button>
                                </Stack>
                            )}

                            {status?.lastUsedAt && (
                                <Stack gap="xs">
                                    <Paragraph size="sm" muted>Last Synced</Paragraph>
                                    <Paragraph>{formatLastSynced(status.lastUsedAt)}</Paragraph>
                                </Stack>
                            )}
                        </Stack>
                    </Card>

                    {/* App Sync notice */}
                    {isAppSync && (
                        <Card variant="default">
                            <Stack direction="horizontal" gap="md" align="start">
                                <Paragraph inline>📱</Paragraph>
                                <Stack gap="xs">
                                    <Paragraph bold>Syncs via Mobile App</Paragraph>
                                    <Paragraph size="sm" muted>
                                        Activities from {integration.name} are synced through the FitGlue mobile app.
                                    </Paragraph>
                                </Stack>
                            </Stack>
                        </Card>
                    )}

                    {/* Actions */}
                    <Stack direction="horizontal" gap="sm" justify="end">
                        {isOAuth && (
                            <Button
                                variant="secondary"
                                onClick={handleReconnect}
                            >
                                Reconnect
                            </Button>
                        )}
                        <Button
                            variant="danger"
                            onClick={() => setShowDisconnectConfirm(true)}
                            disabled={disconnecting}
                        >
                            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                    </Stack>
                </Stack>
            </Card>

            <ConfirmDialog
                isOpen={showDisconnectConfirm}
                title="Disconnect Integration"
                message={`Are you sure you want to disconnect ${integration.name}? You'll need to reconnect to sync activities again.`}
                confirmLabel="Disconnect"
                isDestructive={true}
                onConfirm={handleDisconnect}
                onCancel={() => setShowDisconnectConfirm(false)}
                isLoading={disconnecting}
            />
        </PageLayout>
    );
};

export default ConnectionDetailPage;
