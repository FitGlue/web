import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout, Stack } from '../components/library/layout';
import { Button, Heading, Paragraph, LoadingState, List, ListItem } from '../components/library/ui';
import { PluginIcon } from '../components/library/ui/PluginIcon';
import { Input, FormField } from '../components/library/forms';
import { renderInlineMarkdown } from '../utils/markdown';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { IntegrationAuthType } from '../types/plugin';

const ConnectionSetupPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const api = useApi();
    const { loading: userLoading } = useUser();
    const { integrations, loading: registryLoading } = usePluginRegistry();

    const [apiKey, setApiKey] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const integration = integrations.find(i => i.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (registryLoading || userLoading) {
        return (
            <PageLayout title="Connect" backTo="/connections" backLabel="Connections">
                <LoadingState />
            </PageLayout>
        );
    }

    if (!integration) {
        return (
            <PageLayout title="Connection Not Found" backTo="/connections" backLabel="Connections">
                <Stack gap="md">
                    <Paragraph>This connection type does not exist.</Paragraph>
                    <Button variant="primary" onClick={() => navigate('/connections')}>
                        Back to Connections
                    </Button>
                </Stack>
            </PageLayout>
        );
    }

    const handleApiKeySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!apiKey.trim()) {
            setError('Please enter your API key');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const response = await api.put(`/users/me/integrations/${integration.id}`, { apiKey: apiKey.trim() }) as {
                message: string;
                ingressApiKey?: string;
                ingressKeyLabel?: string;
            };
            navigate(`/connections/${integration.id}/success`, {
                state: {
                    ingressApiKey: response.ingressApiKey,
                    ingressKeyLabel: response.ingressKeyLabel,
                    integrationName: integration.name,
                }
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to connect. Please check your API key.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOAuthConnect = async () => {
        setError(null);
        setSubmitting(true);

        try {
            const response = await api.post(`/users/me/integrations/${integration.id}/connect`);
            const { url } = response as { url: string };
            window.location.href = url;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start connection. Please try again.';
            setError(message);
            setSubmitting(false);
        }
    };

    const parseInstructions = (text: string): string[] => {
        if (!text) return [];
        return text
            .split('\n')
            .filter(line => /^\d+\./.test(line.trim()))
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
    };

    const renderApiKeySetup = () => {
        const steps = parseInstructions(integration.setupInstructions || '');

        return (
            <Stack gap="lg">
                <Stack direction="horizontal" align="center" gap="md">
                    <PluginIcon
                        icon={integration.icon}
                        iconType={integration.iconType}
                        iconPath={integration.iconPath}
                        size="large"

                    />
                    <Heading level={1}>Connect {integration.name}</Heading>
                </Stack>

                <form onSubmit={handleApiKeySubmit}>
                    <Stack gap="lg">
                        <Heading level={2}>Step 1: Generate your {integration.name} API Key</Heading>
                        <List variant="ordered">
                            {steps.map((step, i) => (
                                <ListItem key={i}>{renderInlineMarkdown(step)}</ListItem>
                            ))}
                        </List>

                        <FormField label={integration.apiKeyLabel || 'API Key'} htmlFor="apiKey">
                            <Input
                                id="apiKey"
                                type="text"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={`Enter your ${integration.apiKeyLabel || 'API key'}`}
                                disabled={submitting}
                            />
                        </FormField>
                    </Stack>

                    {error && (
                        <Paragraph>{error}</Paragraph>
                    )}

                    <Stack direction="horizontal" gap="sm" justify="end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/connections')}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting || !apiKey.trim()}
                        >
                            {submitting ? 'Connecting...' : `Connect ${integration.name}`}
                        </Button>
                    </Stack>
                </form>
            </Stack>
        );
    };

    const renderOAuthSetup = () => {
        return (
            <Stack gap="lg">
                <Stack direction="horizontal" align="center" gap="md">
                    <PluginIcon
                        icon={integration.icon}
                        iconType={integration.iconType}
                        iconPath={integration.iconPath}
                        size="large"

                    />
                    <Heading level={1}>Connect to {integration.name}</Heading>
                </Stack>

                <Stack gap="md">
                    <Paragraph>
                        You&apos;ll be redirected to {integration.name} to authorize FitGlue. Here&apos;s what will happen:
                    </Paragraph>

                    <List>
                        <ListItem>✓ Sign in to your {integration.name} account</ListItem>
                        <ListItem>✓ Review the permissions FitGlue needs</ListItem>
                        <ListItem>✓ Click &quot;Authorize&quot; to connect</ListItem>
                        <ListItem>✓ You&apos;ll be redirected back here automatically</ListItem>
                    </List>

                    <Stack direction="horizontal" gap="md" align="start">
                        <Paragraph inline>🔒</Paragraph>
                        <Stack gap="xs">
                            <Paragraph bold>Secure OAuth Connection</Paragraph>
                            <Paragraph size="sm">Your {integration.name} password is never shared with FitGlue.</Paragraph>
                        </Stack>
                    </Stack>
                </Stack>

                {error && (
                    <Paragraph>{error}</Paragraph>
                )}

                <Stack direction="horizontal" gap="sm" justify="end">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/connections')}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleOAuthConnect}
                        disabled={submitting}
                    >
                        {submitting ? 'Redirecting...' : `Continue to ${integration.name} →`}
                    </Button>
                </Stack>
            </Stack>
        );
    };

    const renderAppSyncSetup = () => {
        const isApple = integration.id === 'apple-health';
        const storeName = isApple ? 'App Store' : 'Google Play Store';
        const healthName = isApple ? 'Apple Health' : 'Health Connect';

        return (
            <Stack gap="lg">
                <Stack direction="horizontal" align="center" gap="md">
                    <PluginIcon
                        icon={integration.icon}
                        iconType={integration.iconType}
                        iconPath={integration.iconPath}
                        size="large"

                    />
                    <Heading level={1}>Connect {integration.name}</Heading>
                </Stack>

                <Stack gap="md">
                    <Paragraph>
                        {integration.name} data syncs through our mobile app.
                    </Paragraph>

                    <Stack direction="horizontal" gap="md" align="start">
                        <Paragraph inline>📱</Paragraph>
                        <Stack gap="sm">
                            <Paragraph bold>Get the FitGlue App</Paragraph>
                            <List variant="ordered">
                                <ListItem>Download <strong>FitGlue</strong> from the {storeName}</ListItem>
                                <ListItem>Sign in with your FitGlue account</ListItem>
                                <ListItem>Grant <strong>{healthName}</strong> permissions</ListItem>
                                <ListItem>Workouts sync automatically!</ListItem>
                            </List>
                            <Button variant="primary" disabled>
                                Download on the {storeName}
                            </Button>
                        </Stack>
                    </Stack>

                    <Paragraph size="sm">
                        <strong>Note:</strong> {integration.name} data can only be accessed from your {isApple ? 'iOS' : 'Android'} device.
                    </Paragraph>
                </Stack>

                <Stack direction="horizontal" gap="sm">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/connections')}
                    >
                        ← Back to Connections
                    </Button>
                </Stack>
            </Stack>
        );
    };

    const renderPublicIdSetup = () => {
        const steps = parseInstructions(integration.setupInstructions || '');

        return (
            <Stack gap="lg">
                <Stack direction="horizontal" align="center" gap="md">
                    <PluginIcon
                        icon={integration.icon}
                        iconType={integration.iconType}
                        iconPath={integration.iconPath}
                        size="large"

                    />
                    <Heading level={1}>Connect {integration.name}</Heading>
                </Stack>

                <form onSubmit={handleApiKeySubmit}>
                    <Stack gap="lg">
                        <Heading level={2}>Enter your {integration.name} Details</Heading>
                        <List variant="ordered">
                            {steps.map((step, i) => (
                                <ListItem key={i}>{renderInlineMarkdown(step)}</ListItem>
                            ))}
                        </List>

                        <FormField label={integration.apiKeyLabel || 'ID'} htmlFor="apiKey">
                            <Input
                                id="apiKey"
                                type="text"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={`Enter your ${integration.apiKeyLabel || 'ID'}`}
                                disabled={submitting}
                            />
                        </FormField>
                    </Stack>

                    {error && (
                        <Paragraph>{error}</Paragraph>
                    )}

                    <Stack direction="horizontal" gap="sm" justify="end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/connections')}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting || !apiKey.trim()}
                        >
                            {submitting ? 'Connecting...' : `Connect ${integration.name}`}
                        </Button>
                    </Stack>
                </form>
            </Stack>
        );
    };

    const authType = integration.authType as number;

    return (
        <PageLayout
            title={`Connect ${integration.name}`}
            backTo="/connections"
            backLabel="Connections"
        >
            {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_API_KEY && renderApiKeySetup()}
            {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_OAUTH && renderOAuthSetup()}
            {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_APP_SYNC && renderAppSyncSetup()}
            {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_PUBLIC_ID && renderPublicIdSetup()}
            {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_UNSPECIFIED && (
                <Stack gap="md">
                    <Paragraph>This connection type is not configured correctly.</Paragraph>
                    <Button variant="primary" onClick={() => navigate('/connections')}>
                        Back to Connections
                    </Button>
                </Stack>
            )}
        </PageLayout>
    );
};

export default ConnectionSetupPage;
