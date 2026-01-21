import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
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
        // Scroll to top on mount
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
                <div className="connection-setup__error">
                    <p>This connection type does not exist.</p>
                    <Button variant="primary" onClick={() => navigate('/connections')}>
                        Back to Connections
                    </Button>
                </div>
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
            // Navigate to success page with the ingress key data
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
            // Redirect to OAuth provider
            window.location.href = url;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start connection. Please try again.';
            setError(message);
            setSubmitting(false);
        }
    };

    // Parse instructions into steps
    const parseInstructions = (text: string): string[] => {
        if (!text) return [];
        return text
            .split('\n')
            .filter(line => /^\d+\./.test(line.trim()))
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
    };

    // Render markdown-like bold text
    const renderText = (text: string) => {
        const parts = text.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
    };

    const renderApiKeySetup = () => {
        const steps = parseInstructions(integration.setupInstructions || '');

        return (
            <div className="connection-setup">
                <div className="connection-setup__header">
                    <span className="connection-setup__icon">{integration.icon}</span>
                    <h1>Connect {integration.name}</h1>
                </div>

                <form onSubmit={handleApiKeySubmit}>
                    <div className="connection-setup__section">
                        <h2>Step 1: Generate your {integration.name} API Key</h2>
                        <div className="connection-setup__instructions">
                            <ol>
                                {steps.map((step, i) => (
                                    <li key={i}>{renderText(step)}</li>
                                ))}
                            </ol>
                        </div>

                        <div className="connection-setup__input">
                            <label htmlFor="apiKey">{integration.apiKeyLabel || 'API Key'}</label>
                            <input
                                id="apiKey"
                                type="text"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={`Enter your ${integration.apiKeyLabel || 'API key'}`}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="connection-setup__error-message">{error}</div>
                    )}

                    <div className="connection-setup__actions">
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
                    </div>
                </form>
            </div>
        );
    };

    const renderOAuthSetup = () => {
        return (
            <div className="connection-setup">
                <div className="connection-setup__header">
                    <span className="connection-setup__icon">{integration.icon}</span>
                    <h1>Connect to {integration.name}</h1>
                </div>

                <div className="connection-setup__section">
                    <p className="connection-setup__intro">
                        You&apos;ll be redirected to {integration.name} to authorize FitGlue. Here&apos;s what will happen:
                    </p>

                    <ul className="connection-setup__checklist">
                        <li>✓ Sign in to your {integration.name} account</li>
                        <li>✓ Review the permissions FitGlue needs</li>
                        <li>✓ Click &quot;Authorize&quot; to connect</li>
                        <li>✓ You&apos;ll be redirected back here automatically</li>
                    </ul>

                    <div className="connection-setup__info-box connection-setup__info-box--security">
                        <span className="connection-setup__info-icon">🔒</span>
                        <div>
                            <strong>Secure OAuth Connection</strong>
                            <p>Your {integration.name} password is never shared with FitGlue.</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="connection-setup__error-message">{error}</div>
                )}

                <div className="connection-setup__actions">
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
                </div>
            </div>
        );
    };

    const renderAppSyncSetup = () => {
        const isApple = integration.id === 'apple-health';
        const storeName = isApple ? 'App Store' : 'Google Play Store';
        const healthName = isApple ? 'Apple Health' : 'Health Connect';

        return (
            <div className="connection-setup">
                <div className="connection-setup__header">
                    <span className="connection-setup__icon">{integration.icon}</span>
                    <h1>Connect {integration.name}</h1>
                </div>

                <div className="connection-setup__section">
                    <p className="connection-setup__intro">
                        {integration.name} data syncs through our mobile app.
                    </p>

                    <div className="connection-setup__info-box connection-setup__info-box--app">
                        <span className="connection-setup__info-icon">📱</span>
                        <div>
                            <strong>Get the FitGlue App</strong>
                            <ol className="connection-setup__app-steps">
                                <li>Download <strong>FitGlue</strong> from the {storeName}</li>
                                <li>Sign in with your FitGlue account</li>
                                <li>Grant <strong>{healthName}</strong> permissions</li>
                                <li>Workouts sync automatically!</li>
                            </ol>
                            {/* TODO: Add actual app store links when available */}
                            <Button variant="primary" disabled>
                                Download on the {storeName}
                            </Button>
                        </div>
                    </div>

                    <p className="connection-setup__note">
                        <strong>Note:</strong> {integration.name} data can only be accessed from your {isApple ? 'iOS' : 'Android'} device.
                    </p>
                </div>

                <div className="connection-setup__actions">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/connections')}
                    >
                        ← Back to Connections
                    </Button>
                </div>
            </div>
        );
    };

    const renderPublicIdSetup = () => {
        const steps = parseInstructions(integration.setupInstructions || '');

        return (
            <div className="connection-setup">
                <div className="connection-setup__header">
                    <span className="connection-setup__icon">{integration.icon}</span>
                    <h1>Connect {integration.name}</h1>
                </div>

                <form onSubmit={handleApiKeySubmit}>
                    <div className="connection-setup__section">
                        <h2>Enter your {integration.name} Details</h2>
                        <div className="connection-setup__instructions">
                            <ol>
                                {steps.map((step, i) => (
                                    <li key={i}>{renderText(step)}</li>
                                ))}
                            </ol>
                        </div>

                        <div className="connection-setup__input">
                            <label htmlFor="apiKey">{integration.apiKeyLabel || 'ID'}</label>
                            <input
                                id="apiKey"
                                type="text"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={`Enter your ${integration.apiKeyLabel || 'ID'}`}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="connection-setup__error-message">{error}</div>
                    )}

                    <div className="connection-setup__actions">
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
                    </div>
                </form>
            </div>
        );
    };

    // Render based on auth type
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
                <div className="connection-setup__error">
                    <p>This connection type is not configured correctly.</p>
                    <Button variant="primary" onClick={() => navigate('/connections')}>
                        Back to Connections
                    </Button>
                </div>
            )}
        </PageLayout>
    );
};

export default ConnectionSetupPage;
