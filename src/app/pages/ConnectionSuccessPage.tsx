import React, { useEffect, useState } from 'react';
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

const ConnectionSuccessPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { integrations, loading: registryLoading } = usePluginRegistry();
    const { refresh: refreshIntegrations } = useIntegrations();
    const [copied, setCopied] = useState(false);

    // Get data passed from API key setup flow
    const state = location.state as LocationState | null;
    const ingressApiKey = state?.ingressApiKey;
    const ingressKeyLabel = state?.ingressKeyLabel;

    const integration = integrations.find(i => i.id === id);
    const displayName = state?.integrationName || integration?.name || id || 'Service';
    const icon = integration?.icon || '✓';

    useEffect(() => {
        // Refresh integrations to update connection status
        refreshIntegrations();
    }, [refreshIntegrations]);

    const handleCopyKey = async () => {
        if (ingressApiKey) {
            await navigator.clipboard.writeText(ingressApiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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

                {/* Show ingress key section for API key integrations */}
                {ingressApiKey && (
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
                                    {copied ? '✓ Copied!' : '📋 Copy'}
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

