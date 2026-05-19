import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { CardSkeleton, Button, Badge } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { PluginIcon } from '../components/library/ui/PluginIcon';
import { renderInlineMarkdown } from '../utils/markdown';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { client } from '../../shared/api/client';
import { useUser } from '../hooks/useUser';
import { IntegrationAuthType } from '../types/plugin';
import { resolveEnum } from '../utils/resolveEnum';

const ConnectionSetupPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { loading: userLoading } = useUser();
    const { integrations, loading: registryLoading } = usePluginRegistry();

    const [apiKey, setApiKey] = useState('');
    const [athleteId, setAthleteId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requiresAthleteId = id === 'intervals';

    const integration = integrations.find(i => i.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (registryLoading || userLoading) {
        return (
            <PageLayout title="Connect" backTo="/connections" backLabel="Connections">
                <div className="fg-band">
                    <span className="fg-band__label">CONNECT</span>
                    <span className="fg-band__right">LOADING…</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    if (!integration) {
        return (
            <PageLayout title="Connection Not Found" backTo="/connections" backLabel="Connections">
                <div className="fg-band fg-band--ink">
                    <span className="fg-band__label">CONNECTION NOT FOUND</span>
                </div>
                <div style={{ padding: '1.5rem 2rem' }}>
                    <p style={{ fontFamily: 'var(--fg-font-body)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        This connection type does not exist.
                    </p>
                    <Button size="sm" onClick={() => navigate('/connections')}>
                        BACK TO CONNECTIONS
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
        if (requiresAthleteId && !athleteId.trim()) {
            setError('Please enter your Athlete ID');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const authType = resolveEnum(integration.authType, IntegrationAuthType);
            let body: Record<string, unknown>;
            if (authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_PUBLIC_ID) {
                body = { athlete_id: apiKey.trim(), enabled: true, consent_given: true };
            } else if (requiresAthleteId) {
                body = { apiKey: apiKey.trim(), athleteId: athleteId.trim(), enabled: true, consent_given: true };
            } else {
                body = { apiKey: apiKey.trim(), enabled: true, consent_given: true };
            }
            const { data: response } = await client.PUT('/users/me/integrations/{provider}', {
                params: { path: { provider: integration.id } },
                body: body as never,
            });
            navigate(`/connections/${integration.id}/success`, {
                state: {
                    ingressApiKey: (response as unknown as Record<string, unknown>)?.ingressApiKey,
                    ingressKeyLabel: (response as unknown as Record<string, unknown>)?.ingressKeyLabel,
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
            const { data: response } = await client.POST('/users/me/integrations/{provider}/connect', {
                params: { path: { provider: integration.id } },
            });
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

    /* ---- API Key setup ---- */
    const renderApiKeySetup = () => {
        const steps = parseInstructions(integration.setupInstructions || '');

        return (
            <div className="wiz__body">
                <div className="wiz__body-head">
                    <div className="wiz__step-num">STEP 1 OF 1</div>
                    <h2 className="wiz__step-head">
                        <span className="fg-text-gradient">CONNECT {integration.name.toUpperCase()}.</span>
                    </h2>
                    <p className="wiz__step-help">
                        Generate an API key in your {integration.name} account, then paste it below.
                    </p>
                </div>

                <div className="wiz__content">
                    {/* Integration icon + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="wiz__source-emoji">
                            <PluginIcon
                                icon={integration.icon}
                                iconType={integration.iconType}
                                iconPath={integration.iconPath}
                                size="medium"
                            />
                        </div>
                        <div>
                            <div className="wiz__source-name">{integration.name}</div>
                            <div className="wiz__source-sub">{integration.description}</div>
                        </div>
                    </div>

                    {/* Steps */}
                    {steps.length > 0 && (
                        <div className="wiz__section">
                            <span className="wiz__section-label">Setup Steps</span>
                            <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {steps.map((step, i) => (
                                    <li key={i} style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--fg-paper)', lineHeight: 1.55 }}>
                                        {renderInlineMarkdown(step)}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* API key form */}
                    <form onSubmit={handleApiKeySubmit}>
                        <div className="wiz__section">
                            <span className="wiz__section-label">{integration.apiKeyLabel || 'API Key'}</span>
                            <div style={{ boxShadow: 'inset 0 0 0 2px rgba(245,243,235,0.2)', display: 'flex' }}>
                                <input
                                    id="apiKey"
                                    type="text"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder={`Enter your ${integration.apiKeyLabel || 'API key'}`}
                                    disabled={submitting}
                                    style={{
                                        flex: 1,
                                        background: 'var(--fg-ink)',
                                        color: 'var(--fg-paper)',
                                        border: 0,
                                        padding: '0.75rem 1rem',
                                        fontFamily: 'var(--fg-font-mono)',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {requiresAthleteId && (
                            <div className="wiz__section">
                                <span className="wiz__section-label">Athlete ID</span>
                                <div style={{ boxShadow: 'inset 0 0 0 2px rgba(245,243,235,0.2)', display: 'flex' }}>
                                    <input
                                        id="athleteId"
                                        type="text"
                                        value={athleteId}
                                        onChange={e => setAthleteId(e.target.value)}
                                        placeholder="e.g. i12345"
                                        disabled={submitting}
                                        style={{
                                            flex: 1,
                                            background: 'var(--fg-ink)',
                                            color: 'var(--fg-paper)',
                                            border: 0,
                                            padding: '0.75rem 1rem',
                                            fontFamily: 'var(--fg-font-mono)',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                padding: '0.875rem 1rem',
                                background: 'rgba(255, 93, 108, 0.1)',
                                boxShadow: 'inset 0 0 0 1.5px var(--fg-rose)',
                                marginBottom: '1rem',
                                fontFamily: 'var(--fg-font-body)',
                                fontSize: '0.875rem',
                                color: 'var(--fg-rose)',
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="wiz__actions">
                            <button
                                type="button"
                                className="wiz__back"
                                onClick={() => navigate('/connections')}
                                disabled={submitting}
                            >
                                ← CANCEL
                            </button>
                            <Button
                                type="submit"
                                disabled={submitting || !apiKey.trim() || (requiresAthleteId && !athleteId.trim())}
                            >
                                {submitting ? 'CONNECTING…' : `CONNECT ${integration.name.toUpperCase()} →`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    /* ---- OAuth setup ---- */
    const renderOAuthSetup = () => {
        return (
            <div className="wiz__body">
                <div className="wiz__body-head">
                    <div className="wiz__step-num">OAUTH CONNECTION</div>
                    <h2 className="wiz__step-head">
                        <span className="fg-text-gradient">CONNECT {integration.name.toUpperCase()}.</span>
                    </h2>
                    <p className="wiz__step-help">
                        You&apos;ll be redirected to {integration.name} to authorize FitGlue.
                    </p>
                </div>

                <div className="wiz__content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="wiz__source-emoji">
                            <PluginIcon
                                icon={integration.icon}
                                iconType={integration.iconType}
                                iconPath={integration.iconPath}
                                size="medium"
                            />
                        </div>
                        <div>
                            <div className="wiz__source-name">{integration.name}</div>
                            <div className="wiz__source-sub">{integration.description}</div>
                        </div>
                    </div>

                    <div className="wiz__section">
                        <span className="wiz__section-label">What will happen</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, boxShadow: 'inset 0 0 0 1.5px var(--fg-hairline-color)' }}>
                            {[
                                `Sign in to your ${integration.name} account`,
                                'Review the permissions FitGlue needs',
                                'Click "Authorize" to connect',
                                "You'll be redirected back here automatically",
                            ].map((step, i) => (
                                <div key={i} style={{
                                    padding: '0.875rem 1rem',
                                    borderBottom: 'var(--fg-rule-thin)',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'center',
                                    fontFamily: 'var(--fg-font-body)',
                                    fontSize: '0.9375rem',
                                    color: 'var(--fg-paper)',
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--fg-font-mono)',
                                        fontSize: '0.625rem',
                                        fontWeight: 700,
                                        color: 'var(--fg-green)',
                                        letterSpacing: '0.1em',
                                        flexShrink: 0,
                                    }}>✓</span>
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security note */}
                    <div style={{
                        padding: '0.875rem 1rem',
                        background: 'rgba(34, 211, 238, 0.06)',
                        boxShadow: 'inset 0 0 0 1.5px rgba(34, 211, 238, 0.2)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                    }}>
                        <span>🔒</span>
                        <div>
                            <div style={{ fontFamily: 'var(--fg-font-display)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '-0.005em', marginBottom: '0.25rem' }}>
                                SECURE OAUTH CONNECTION
                            </div>
                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                Your {integration.name} password is never shared with FitGlue.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.875rem 1rem',
                            background: 'rgba(255, 93, 108, 0.1)',
                            boxShadow: 'inset 0 0 0 1.5px var(--fg-rose)',
                            marginBottom: '1rem',
                            fontFamily: 'var(--fg-font-body)',
                            fontSize: '0.875rem',
                            color: 'var(--fg-rose)',
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                <div className="wiz__actions">
                    <button
                        className="wiz__back"
                        onClick={() => navigate('/connections')}
                        disabled={submitting}
                    >
                        ← CANCEL
                    </button>
                    <Button
                        onClick={handleOAuthConnect}
                        disabled={submitting}
                    >
                        {submitting ? 'REDIRECTING…' : `CONTINUE TO ${integration.name.toUpperCase()} →`}
                    </Button>
                </div>
            </div>
        );
    };

    /* ---- App Sync setup ---- */
    const renderAppSyncSetup = () => {
        const isApple = integration.id === 'apple-health';
        const storeName = isApple ? 'App Store' : 'Google Play Store';
        const healthName = isApple ? 'Apple HealthKit' : 'Health Connect';

        return (
            <div className="wiz__body">
                <div className="wiz__body-head">
                    <div className="wiz__step-num">MOBILE SYNC</div>
                    <h2 className="wiz__step-head">
                        <span className="fg-text-gradient">CONNECT {integration.name.toUpperCase()}.</span>
                    </h2>
                    <p className="wiz__step-help">
                        {integration.name} data syncs through the FitGlue mobile app.
                    </p>
                </div>

                <div className="wiz__content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="wiz__source-emoji">
                            <PluginIcon
                                icon={integration.icon}
                                iconType={integration.iconType}
                                iconPath={integration.iconPath}
                                size="medium"
                            />
                        </div>
                        <div>
                            <div className="wiz__source-name">{integration.name}</div>
                            <div className="wiz__source-sub">{integration.description}</div>
                        </div>
                    </div>

                    <div className="wiz__section">
                        <span className="wiz__section-label">📱 Get the FitGlue App</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, boxShadow: 'inset 0 0 0 1.5px var(--fg-hairline-color)' }}>
                            {[
                                `Download FitGlue from the ${storeName}`,
                                'Sign in with your FitGlue account',
                                `Grant ${healthName} permissions`,
                                'Workouts sync automatically!',
                            ].map((step, i) => (
                                <div key={i} style={{
                                    padding: '0.875rem 1rem',
                                    borderBottom: 'var(--fg-rule-thin)',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'center',
                                    fontFamily: 'var(--fg-font-body)',
                                    fontSize: '0.9375rem',
                                    color: 'var(--fg-paper)',
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--fg-font-display)',
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-muted)',
                                        width: '20px',
                                        flexShrink: 0,
                                    }}>{i + 1}</span>
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button size="sm" disabled>
                            DOWNLOAD ON {storeName.toUpperCase()}
                        </Button>
                        <Badge variant="warning">COMING SOON</Badge>
                    </div>

                    <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                        <strong>Note:</strong> {integration.name} data can only be accessed from your {isApple ? 'iOS' : 'Android'} device.
                    </p>
                </div>

                <div className="wiz__actions">
                    <button className="wiz__back" onClick={() => navigate('/connections')}>
                        ← BACK TO CONNECTIONS
                    </button>
                    <span />
                </div>
            </div>
        );
    };

    /* ---- Public ID setup ---- */
    const renderPublicIdSetup = () => {
        const steps = parseInstructions(integration.setupInstructions || '');

        return (
            <div className="wiz__body">
                <div className="wiz__body-head">
                    <div className="wiz__step-num">STEP 1 OF 1</div>
                    <h2 className="wiz__step-head">
                        <span className="fg-text-gradient">CONNECT {integration.name.toUpperCase()}.</span>
                    </h2>
                    <p className="wiz__step-help">
                        Enter your {integration.name} details below.
                    </p>
                </div>

                <div className="wiz__content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="wiz__source-emoji">
                            <PluginIcon
                                icon={integration.icon}
                                iconType={integration.iconType}
                                iconPath={integration.iconPath}
                                size="medium"
                            />
                        </div>
                        <div>
                            <div className="wiz__source-name">{integration.name}</div>
                            <div className="wiz__source-sub">{integration.description}</div>
                        </div>
                    </div>

                    {steps.length > 0 && (
                        <div className="wiz__section">
                            <span className="wiz__section-label">Setup Steps</span>
                            <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {steps.map((step, i) => (
                                    <li key={i} style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--fg-paper)', lineHeight: 1.55 }}>
                                        {renderInlineMarkdown(step)}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <form onSubmit={handleApiKeySubmit}>
                        <div className="wiz__section">
                            <span className="wiz__section-label">{integration.apiKeyLabel || 'ID'}</span>
                            <div style={{ boxShadow: 'inset 0 0 0 2px rgba(245,243,235,0.2)', display: 'flex' }}>
                                <input
                                    id="apiKey"
                                    type="text"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder={`Enter your ${integration.apiKeyLabel || 'ID'}`}
                                    disabled={submitting}
                                    style={{
                                        flex: 1,
                                        background: 'var(--fg-ink)',
                                        color: 'var(--fg-paper)',
                                        border: 0,
                                        padding: '0.75rem 1rem',
                                        fontFamily: 'var(--fg-font-mono)',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: '0.875rem 1rem',
                                background: 'rgba(255, 93, 108, 0.1)',
                                boxShadow: 'inset 0 0 0 1.5px var(--fg-rose)',
                                marginBottom: '1rem',
                                fontFamily: 'var(--fg-font-body)',
                                fontSize: '0.875rem',
                                color: 'var(--fg-rose)',
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="wiz__actions">
                            <button
                                type="button"
                                className="wiz__back"
                                onClick={() => navigate('/connections')}
                                disabled={submitting}
                            >
                                ← CANCEL
                            </button>
                            <Button
                                type="submit"
                                disabled={submitting || !apiKey.trim()}
                            >
                                {submitting ? 'CONNECTING…' : `CONNECT ${integration.name.toUpperCase()} →`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const authType = resolveEnum(integration.authType, IntegrationAuthType);

    return (
        <PageLayout
            title={`Connect ${integration.name}`}
            backTo="/connections"
            backLabel="Connections"
        >
            {/* Aurora band header */}
            <div className="fg-band">
                <span className="fg-band__label">CONNECT · {integration.name.toUpperCase()}</span>
            </div>

            {/* Wizard body using wiz classes from app-components.css */}
            <div className="wiz" style={{ gridTemplateColumns: '1fr' }}>
                {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_API_KEY && renderApiKeySetup()}
                {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_OAUTH && renderOAuthSetup()}
                {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_APP_SYNC && renderAppSyncSetup()}
                {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_PUBLIC_ID && renderPublicIdSetup()}
                {authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_UNSPECIFIED && (
                    <div className="wiz__body">
                        <div className="wiz__content">
                            <p style={{ fontFamily: 'var(--fg-font-body)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                This connection type is not configured correctly.
                            </p>
                            <Button size="sm" onClick={() => navigate('/connections')}>
                                BACK TO CONNECTIONS
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default ConnectionSetupPage;
