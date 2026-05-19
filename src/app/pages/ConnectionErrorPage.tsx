import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { CardSkeleton } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { usePluginRegistry } from '../hooks/usePluginRegistry';

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
            <PageLayout title="Connection Failed" backTo="/connections" backLabel="Connections">
                <div className="fg-band">
                    <span className="fg-band__label">CONNECTION FAILED</span>
                    <span className="fg-band__right">✕ ERROR</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connection Failed" backTo="/connections" backLabel="Connections">
            {/* Error band — rose accent */}
            <div className="fg-band" style={{ background: 'var(--fg-rose)' }}>
                <span className="fg-band__label">CONNECTION · {displayName.toUpperCase()}</span>
                <span className="fg-band__right">✕ FAILED</span>
            </div>

            {/* Error state hero */}
            <div style={{
                padding: '3rem 2rem',
                background: 'var(--fg-ink-2)',
                borderBottom: 'var(--fg-rule-thin)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
            }}>
                {/* Error icon */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(255, 93, 108, 0.12)',
                    boxShadow: 'inset 0 0 0 2px var(--fg-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                }}>
                    ✕
                </div>

                <h1 style={{
                    fontFamily: 'var(--fg-font-display)',
                    fontSize: '2.5rem',
                    letterSpacing: '-0.025em',
                    textTransform: 'uppercase',
                    margin: 0,
                    color: 'var(--fg-rose)',
                }}>
                    CONNECTION FAILED
                </h1>

                {/* Error reason stamp */}
                <span className="fg-stamp fg-stamp--rose">
                    {reason.replace(/_/g, ' ').toUpperCase()}
                </span>

                {/* Error message */}
                <p style={{
                    fontFamily: 'var(--fg-font-body)',
                    fontSize: '1.0625rem',
                    color: 'var(--color-text-muted)',
                    maxWidth: '520px',
                    margin: 0,
                    lineHeight: 1.6,
                }}>
                    {getErrorMessage(reason)}
                </p>

                <p style={{
                    fontFamily: 'var(--fg-font-mono)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    margin: 0,
                }}>
                    PLEASE TRY AGAIN OR CONTACT SUPPORT IF THE ISSUE PERSISTS
                </p>
            </div>

            {/* Actions */}
            <div style={{
                padding: '1.25rem 2rem',
                background: 'var(--fg-ink-2)',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
            }}>
                <button
                    className="fg-button fg-button--sm"
                    onClick={() => navigate(`/connections/${id}/setup`)}
                >
                    TRY AGAIN →
                </button>
                <button
                    className="fg-button fg-button--sm fg-button--ink"
                    onClick={() => navigate('/connections')}
                >
                    BACK TO CONNECTIONS
                </button>
            </div>
        </PageLayout>
    );
};

export default ConnectionErrorPage;
