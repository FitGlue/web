import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useIntegrations } from '../hooks/useIntegrations';

interface LocationState {
    ingressApiKey?: string;
    ingressKeyLabel?: string;
    integrationName?: string;
}

/**
 * Get the webhook URL based on the current environment
 */
const getWebhookUrl = (integrationId: string): string => {
    const hostname = window.location.hostname;

    // Determine environment from hostname
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
    const { refresh: refreshIntegrations } = useIntegrations();
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Get data passed from API key setup flow
    const state = location.state as LocationState | null;
    const ingressApiKey = state?.ingressApiKey;
    const ingressKeyLabel = state?.ingressKeyLabel;

    const integration = integrations.find(i => i.id === id);
    const displayName = state?.integrationName || integration?.name || id || 'Service';
    const icon = integration?.icon || '✓';

    // Determine if this integration requires webhook configuration (currently only Hevy)
    const requiresWebhookSetup = id === 'hevy';
    const webhookUrl = useMemo(() => requiresWebhookSetup && id ? getWebhookUrl(id) : '', [id, requiresWebhookSetup]);

    useEffect(() => {
        // Refresh integrations to update connection status
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
                <LoadingState />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connected!" backTo="/connections" backLabel="Connections">
            <div className="connection-result">
                <div className="connection-result__icon connection-result__icon--success">
                    {icon}
                </div>

                <h1 className="connection-result__title">Success!</h1>

                <p className="connection-result__message">
                    Your <strong>{displayName}</strong> account has been successfully connected to FitGlue.
                </p>

                {/* Show webhook configuration section for integrations that need it */}
                {ingressApiKey && requiresWebhookSetup && (
                    <div className="connection-result__ingress-section">
                        <div className="connection-result__ingress-card">
                            <h2>🔧 Complete Your {displayName} Setup</h2>
                            <p>
                                To receive workouts from {displayName}, you need to configure webhooks in the <strong>{displayName} app</strong>.
                                Open <strong>Settings → Developer</strong> in {displayName} and configure the following:
                            </p>

                            {/* Step 1: Webhook URL */}
                            <div className="connection-result__config-step">
                                <label className="connection-result__config-label">
                                    1️⃣ Webhook URL
                                </label>
                                <p className="connection-result__config-hint">
                                    Paste this into &quot;Url you want to get notified on&quot;:
                                </p>
                                <div className="connection-result__key-container">
                                    <code className="connection-result__key">{webhookUrl}</code>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCopyUrl}
                                    >
                                        {copiedUrl ? '✓ Copied!' : '📋 Copy'}
                                    </Button>
                                </div>
                            </div>

                            {/* Step 2: Authorization Header */}
                            <div className="connection-result__config-step">
                                <label className="connection-result__config-label">
                                    2️⃣ Authorization Header
                                </label>
                                <p className="connection-result__config-hint">
                                    Paste this into &quot;Your authorization header&quot;:
                                </p>
                                <div className="connection-result__key-container">
                                    <code className="connection-result__key">{ingressApiKey}</code>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCopyKey}
                                    >
                                        {copiedKey ? '✓ Copied!' : '📋 Copy'}
                                    </Button>
                                </div>
                            </div>

                            {/* Step 3: Subscribe */}
                            <div className="connection-result__config-step">
                                <label className="connection-result__config-label">
                                    3️⃣ Click &quot;Subscribe&quot; in {displayName}
                                </label>
                                <p className="connection-result__config-hint">
                                    Once subscribed, your workouts will sync automatically!
                                </p>
                            </div>

                            <p className="connection-result__key-warning">
                                ⚠️ <strong>Save the authorization header now!</strong> It won&apos;t be shown again.
                            </p>
                            {ingressKeyLabel && (
                                <p className="connection-result__key-label">
                                    Label: {ingressKeyLabel}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Standard ingress key display for non-webhook integrations */}
                {ingressApiKey && !requiresWebhookSetup && (
                    <div className="connection-result__ingress-section">
                        <div className="connection-result__ingress-card">
                            <h2>🔑 Important: Configure {displayName}</h2>
                            <p>
                                Copy this <strong>FitGlue Ingress API Key</strong> and add it to your {displayName} webhook settings
                                as the Authorization header:
                            </p>
                            <div className="connection-result__key-container">
                                <code className="connection-result__key">{ingressApiKey}</code>
                                <Button
                                    variant="secondary"
                                    onClick={handleCopyKey}
                                >
                                    {copiedKey ? '✓ Copied!' : '📋 Copy'}
                                </Button>
                            </div>
                            <p className="connection-result__key-warning">
                                ⚠️ <strong>Save this key now!</strong> It won&apos;t be shown again.
                            </p>
                            {ingressKeyLabel && (
                                <p className="connection-result__key-label">
                                    Label: {ingressKeyLabel}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {!ingressApiKey && (
                    <p className="connection-result__submessage">
                        Your activities will now sync automatically.
                    </p>
                )}

                <div className="connection-result__actions">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/connections')}
                    >
                        View Connections
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/')}
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
};

export default ConnectionSuccessPage;

