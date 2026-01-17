import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { usePluginRegistry } from '../hooks/usePluginRegistry';

const ConnectionErrorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { integrations, loading: registryLoading } = usePluginRegistry();

    const reason = searchParams.get('reason') || 'unknown';
    const integration = integrations.find(i => i.id === id);
    const displayName = integration?.name || id || 'Service';

    // Map error reasons to user-friendly messages
    const getErrorMessage = (reason: string): string => {
        switch (reason) {
            case 'denied':
                return `It looks like you denied the authorization request. We can't connect your ${displayName} account without your permission.`;
            case 'server_error':
                return 'We encountered a server error while processing your request. Please try again in a few moments.';
            case 'invalid_state':
            case 'missing_params':
                return 'The connection request was invalid or expired. Please start the connection process again.';
            default:
                return `Something went wrong while connecting your ${displayName} account. Please try again.`;
        }
    };

    if (registryLoading) {
        return (
            <PageLayout title="Connection Failed" backTo="/connections" backLabel="Connections">
                <LoadingState />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connection Failed" backTo="/connections" backLabel="Connections">
            <div className="connection-result">
                <div className="connection-result__icon connection-result__icon--error">
                    ⚠️
                </div>

                <h1 className="connection-result__title">Connection Failed</h1>

                <p className="connection-result__message">
                    {getErrorMessage(reason)}
                </p>

                <p className="connection-result__submessage">
                    Please try again or contact support if the issue persists.
                </p>

                <div className="connection-result__actions">
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/connections/${id}/setup`)}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/connections')}
                    >
                        Back to Connections
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
};

export default ConnectionErrorPage;
