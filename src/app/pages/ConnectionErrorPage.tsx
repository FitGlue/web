import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { CardSkeleton, Button } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import './ConnectionSuccessPage.css';

const ConnectionErrorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { integrations, loading: registryLoading } = usePluginRegistry();

    const reason = searchParams.get('reason') || 'unknown';
    const integration = integrations.find(i => i.id === id);
    const displayName = integration?.name || id || 'Service';

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
            <PageLayout title="Connection Failed">
                <div style={{ padding: '1.5rem' }}>
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connection Failed">
            <div className="success-scene">
                <div className="state">
                    <span className="state__stamp state__stamp--rose">✕ AUTHORISATION FAILED</span>
                    <div className="state__icon">⚠</div>
                    <h2 className="state__h">
                        {displayName} said{' '}
                        <span className="state__h-gr">no.</span>
                    </h2>
                    <p className="state__body">
                        {getErrorMessage(reason)}
                    </p>
                    <div className="state__detail" style={{ textAlign: 'left' }}>
                        <div className="state__detail-l">ERROR DETAIL</div>
                        <div>
                            Code:{' '}
                            <code style={{ fontFamily: 'var(--fg-font-mono)', color: 'var(--fg-rose)', background: 'var(--fg-ink)', padding: '1px 4px' }}>
                                {reason.replace(/_/g, ' ')}
                            </code>{' '}
                            · Check your credentials and try again. If the issue persists, contact support.
                        </div>
                    </div>
                    <div className="state__cta">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/connections')}>
                            ← CONNECTIONS
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/connections/${id}/setup`)}>
                            ⟲ TRY AGAIN →
                        </Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ConnectionErrorPage;
