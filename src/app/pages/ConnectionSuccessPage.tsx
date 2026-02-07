import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageLayout, Stack } from '../components/library/layout';
import { Button, CardSkeleton, Heading, Paragraph, Code, Badge, Card, useToast } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useConnectionActions } from '../hooks/useConnectionActions';
import { IntegrationAction } from '../types/plugin';

interface LocationState {
    ingressApiKey?: string;
    ingressKeyLabel?: string;
    integrationName?: string;
}

const getWebhookUrl = (integrationId: string): string => {
    const hostname = window.location.hostname;
    let baseUrl: string;
    if (hostname.includes('dev.fitglue') || hostname === 'localhost') {
        baseUrl = 'https://dev.fitglue.tech';
    } else if (hostname.includes('test.fitglue')) {
        baseUrl = 'https://test.fitglue.tech';
    } else {
        baseUrl = 'https://fitglue.tech';
    }
    return `${baseUrl}/hooks/${integrationId}`;
};

const ConnectionSuccessPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { integrations, loading: registryLoading } = usePluginRegistry();
    const { refresh: refreshIntegrations } = useRealtimeIntegrations();
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const toast = useToast();

    // Connection actions
    const {
        triggerAction,
        isActionRunning,
        isActionCompleted,
        getActionError,
    } = useConnectionActions(id || '');

    const state = location.state as LocationState | null;
    const ingressApiKey = state?.ingressApiKey;
    const ingressKeyLabel = state?.ingressKeyLabel;

    const integration = integrations.find(i => i.id === id);
    const displayName = state?.integrationName || integration?.name || id || 'Service';
    const icon = integration?.icon || '✓';

    const requiresWebhookSetup = id === 'hevy';
    const webhookUrl = useMemo(() => requiresWebhookSetup && id ? getWebhookUrl(id) : '', [id, requiresWebhookSetup]);

    // Realtime hook auto-refreshes, but we can still trigger manual refresh
    useEffect(() => {
        refreshIntegrations();
    }, [refreshIntegrations]);

    const handleCopyKey = async () => {
        if (ingressApiKey) {
            await navigator.clipboard.writeText(ingressApiKey);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const handleCopyUrl = async () => {
        if (webhookUrl) {
            await navigator.clipboard.writeText(webhookUrl);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        }
    };

    if (registryLoading) {
        return (
            <PageLayout title="Connected!" backTo="/connections" backLabel="Connections">
                <Stack gap="lg" align="center">
                    <CardSkeleton variant="integration" />
                </Stack>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connected!" backTo="/connections" backLabel="Connections">
            <Stack gap="lg" align="center">
                <Paragraph size="lg">
                    {icon}
                </Paragraph>

                <Heading level={1} centered>Success!</Heading>

                <Paragraph centered>
                    Your <strong>{displayName}</strong> account has been successfully connected to FitGlue.
                </Paragraph>

                {ingressApiKey && requiresWebhookSetup && (
                    <Stack gap="md">
                        <Stack gap="md">
                            <Heading level={2}>🔧 Complete Your {displayName} Setup</Heading>
                            <Paragraph>
                                To receive workouts from {displayName}, you need to configure webhooks in the <strong>{displayName} app</strong>.
                                Open <strong>Settings → Developer</strong> in {displayName} and configure the following:
                            </Paragraph>

                            <Stack gap="sm">
                                <Paragraph bold>
                                    1️⃣ Webhook URL
                                </Paragraph>
                                <Paragraph muted size="sm">
                                    Paste this into &quot;Url you want to get notified on&quot;:
                                </Paragraph>
                                <Stack direction="horizontal" align="center" gap="sm">
                                    <Code>{webhookUrl}</Code>
                                    <Button variant="secondary" onClick={handleCopyUrl}>
                                        {copiedUrl ? '✓ Copied!' : '📋 Copy'}
                                    </Button>
                                </Stack>
                            </Stack>

                            <Stack gap="sm">
                                <Paragraph bold>
                                    2️⃣ Authorization Header
                                </Paragraph>
                                <Paragraph muted size="sm">
                                    Paste this into &quot;Your authorization header&quot;:
                                </Paragraph>
                                <Stack direction="horizontal" align="center" gap="sm">
                                    <Code>{ingressApiKey}</Code>
                                    <Button variant="secondary" onClick={handleCopyKey}>
                                        {copiedKey ? '✓ Copied!' : '📋 Copy'}
                                    </Button>
                                </Stack>
                            </Stack>

                            <Stack gap="sm">
                                <Paragraph bold>
                                    3️⃣ Click &quot;Subscribe&quot; in {displayName}
                                </Paragraph>
                                <Paragraph muted size="sm">
                                    Once subscribed, your workouts will sync automatically!
                                </Paragraph>
                            </Stack>

                            <Paragraph>
                                ⚠️ <strong>Save the authorization header now!</strong> It won&apos;t be shown again.
                            </Paragraph>
                            {ingressKeyLabel && (
                                <Paragraph muted size="sm">
                                    Label: {ingressKeyLabel}
                                </Paragraph>
                            )}
                        </Stack>
                    </Stack>
                )}

                {ingressApiKey && !requiresWebhookSetup && (
                    <Stack gap="md">
                        <Stack gap="md">
                            <Heading level={2}>🔑 Important: Configure {displayName}</Heading>
                            <Paragraph>
                                Copy this <strong>FitGlue Ingress API Key</strong> and add it to your {displayName} webhook settings
                                as the Authorization header:
                            </Paragraph>
                            <Stack direction="horizontal" align="center" gap="sm">
                                <Code>{ingressApiKey}</Code>
                                <Button variant="secondary" onClick={handleCopyKey}>
                                    {copiedKey ? '✓ Copied!' : '📋 Copy'}
                                </Button>
                            </Stack>
                            <Paragraph>
                                ⚠️ <strong>Save this key now!</strong> It won&apos;t be shown again.
                            </Paragraph>
                            {ingressKeyLabel && (
                                <Paragraph muted size="sm">
                                    Label: {ingressKeyLabel}
                                </Paragraph>
                            )}
                        </Stack>
                    </Stack>
                )}

                {!ingressApiKey && (
                    <Paragraph muted centered>
                        Your activities will now sync automatically.
                    </Paragraph>
                )}

                {/* Available Actions */}
                {integration?.actions && integration.actions.length > 0 && (
                    <Card variant="elevated">
                        <Stack gap="md">
                            <Stack gap="xs">
                                <Heading level={3}>🚀 Get Started</Heading>
                                <Paragraph size="sm" muted>
                                    You can run these now, or find them later in your connection settings.
                                </Paragraph>
                            </Stack>
                            {integration.actions.map((action: IntegrationAction) => {
                                const running = isActionRunning(action.id);
                                const completed = isActionCompleted(action.id);
                                const error = getActionError(action.id);

                                return (
                                    <Stack
                                        key={action.id}
                                        direction="horizontal"
                                        justify="between"
                                        align="center"
                                        gap="md"
                                    >
                                        <Stack direction="horizontal" gap="md" align="center">
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {action.icon}
                                            </span>
                                            <Stack gap="xs">
                                                <Paragraph bold>{action.label}</Paragraph>
                                                <Paragraph size="sm" muted>
                                                    {action.description}
                                                </Paragraph>
                                                {error && (
                                                    <Badge variant="error">{error}</Badge>
                                                )}
                                            </Stack>
                                        </Stack>
                                        <Button
                                            variant={completed ? 'secondary' : 'primary'}
                                            size="small"
                                            disabled={running}
                                            onClick={async () => {
                                                try {
                                                    await triggerAction(action.id);
                                                    toast.success(
                                                        'Action Started',
                                                        `${action.label} is running in the background. You'll be notified when it completes.`
                                                    );
                                                } catch {
                                                    toast.error('Failed', 'Could not start the action. Please try again.');
                                                }
                                            }}
                                        >
                                            {running ? 'Running...' : completed ? '✓ Done' : 'Run'}
                                        </Button>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Card>
                )}

                <Stack direction="horizontal" gap="md">
                    <Button variant="primary" onClick={() => navigate('/connections')}>
                        View Connections
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        Go to Dashboard
                    </Button>
                </Stack>
            </Stack>
        </PageLayout>
    );
};

export default ConnectionSuccessPage;
