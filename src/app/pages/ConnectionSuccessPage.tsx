import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useIntegrations } from '../hooks/useIntegrations';

const ConnectionSuccessPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { integrations, loading: registryLoading } = usePluginRegistry();
    const { refresh: refreshIntegrations } = useIntegrations();

    const integration = integrations.find(i => i.id === id);
    const displayName = integration?.name || id || 'Service';
    const icon = integration?.icon || '✓';

    useEffect(() => {
        // Refresh integrations to update connection status
        refreshIntegrations();
    }, [refreshIntegrations]);

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

                <p className="connection-result__submessage">
                    Your activities will now sync automatically.
                </p>

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
