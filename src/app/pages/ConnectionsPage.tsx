import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Button, PluginIcon, CardSkeleton, Badge, Heading, Paragraph, Card, GlowCard } from '../components/library/ui';

import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useNerdMode } from '../state/NerdModeContext';
import '../components/library/ui/CardSkeleton.css';
import { IntegrationManifest } from '../types/plugin';

interface IntegrationStatus {
    connected: boolean;
    externalUserId?: string;
    lastUsedAt?: string;
    additionalDetails?: Record<string, string>;
}

interface ConnectionCardProps {
    integration: IntegrationManifest;
    status: IntegrationStatus | undefined;
    onConnect: () => void;
    onView: () => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
    integration,
    status,
    onConnect,
    onView,
}) => {
    const isConnected = status?.connected ?? false;
    const { isNerdMode } = useNerdMode();

    // Format last synced date nicely
    const formatLastSynced = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        // Check for invalid date
        if (isNaN(date.getTime())) return null;
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const lastSynced = formatLastSynced(status?.lastUsedAt);

    // Header content with integration name and status badge
    const headerContent = (
        <Stack direction="horizontal" align="center" justify="between">
            <Stack direction="horizontal" gap="sm" align="center">
                <PluginIcon
                    icon={integration.icon}
                    iconType={integration.iconType}
                    iconPath={integration.iconPath}
                    size="medium"
                />
                <Heading level={4}>{integration.name}</Heading>
            </Stack>
            <Badge variant={isConnected ? 'success' : 'default'} size="sm">
                <Stack direction="horizontal" gap="xs" align="center">
                    <Paragraph inline size="sm">{isConnected ? '✓' : '○'}</Paragraph>
                    <Paragraph inline size="sm">{isConnected ? 'Connected' : 'Not Connected'}</Paragraph>
                </Stack>
            </Badge>
        </Stack>
    );

    return (
        <GlowCard
            variant={isConnected ? 'success' : 'default'}
            header={headerContent}
        >
            <Stack gap="md">
                {/* Description */}
                <Paragraph muted size="sm">{integration.description}</Paragraph>

                {/* Connection metadata - only when connected */}
                {isConnected && (
                    <Stack gap="xs">
                        {isNerdMode && status?.externalUserId && (
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph size="sm" muted>ID:</Paragraph>
                                <Paragraph size="sm">{status.externalUserId}</Paragraph>
                            </Stack>
                        )}
                        {lastSynced && (
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph size="sm" muted>Last synced:</Paragraph>
                                <Paragraph size="sm">{lastSynced}</Paragraph>
                            </Stack>
                        )}
                    </Stack>
                )}

                {/* Action button */}
                <Stack direction="horizontal" justify="end">
                    {isConnected ? (
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={onView}
                        >
                            View →
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="small"
                            onClick={onConnect}
                        >
                            Connect
                        </Button>
                    )}
                </Stack>
            </Stack>
        </GlowCard>
    );
};

const ConnectionsPage: React.FC = () => {
    const navigate = useNavigate();
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations, loading, refresh: refreshIntegrations } = useRealtimeIntegrations();
    const handleConnect = (integration: IntegrationManifest) => {
        navigate(`/connections/${integration.id}/setup`);
    };

    const handleView = (integration: IntegrationManifest) => {
        navigate(`/connections/${integration.id}`);
    };



    // Count connected integrations
    const connectedCount = registryIntegrations.filter(i => {
        const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[i.id];
        return status?.connected;
    }).length;

    if (loading || registryLoading) {
        return (
            <PageLayout title="Connections" backTo="/" backLabel="Dashboard">
                <Card>
                    <Stack gap="lg">
                        {/* Header skeleton */}
                        <Stack direction="horizontal" justify="between" align="center">
                            <Stack gap="xs">
                                <Heading level={3}>🔗 Your Connections</Heading>
                                <Paragraph muted size="sm">Connect your fitness apps and devices to sync your data with FitGlue</Paragraph>
                            </Stack>
                        </Stack>

                        {/* Skeleton cards */}
                        <Grid>
                            <CardSkeleton variant="integration" />
                            <CardSkeleton variant="integration" />
                            <CardSkeleton variant="integration" />
                        </Grid>
                    </Stack>
                </Card>
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
            <Card>
                <Stack gap="lg">
                    {/* Header with title and stats */}
                    <Stack direction="horizontal" justify="between" align="center">
                        <Stack gap="xs">
                            <Heading level={3}>🔗 Your Connections</Heading>
                            <Paragraph muted size="sm">Connect your fitness apps and devices to sync your data with FitGlue</Paragraph>
                        </Stack>
                        {connectedCount > 0 && (
                            <Badge variant="success" size="sm">
                                {connectedCount} Connected
                            </Badge>
                        )}
                    </Stack>

                    {/* Connection cards grid */}
                    <Grid>
                        {registryIntegrations.map(integration => {
                            const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[integration.id];
                            return (
                                <ConnectionCard
                                    key={integration.id}
                                    integration={integration}
                                    status={status}
                                    onConnect={() => handleConnect(integration)}
                                    onView={() => handleView(integration)}
                                />
                            );
                        })}
                    </Grid>
                </Stack>
            </Card>
        </PageLayout>
    );
};

export default ConnectionsPage;
