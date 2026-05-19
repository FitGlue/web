import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { CardSkeleton, Badge, Button, useToast } from '../components/library/ui';
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
    } else {
        baseUrl = 'https://fitglue.tech';
    }
    return `${baseUrl}/api/webhooks/${integrationId}`;
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
    const requiresWebhookUrlOnly = id === 'intervals';
    const webhookUrl = useMemo(() => (requiresWebhookSetup || requiresWebhookUrlOnly) && id ? getWebhookUrl(id) : '', [id, requiresWebhookSetup, requiresWebhookUrlOnly]);

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
                <div className="fg-band">
                    <span className="fg-band__label">CONNECTED</span>
                    <span className="fg-band__right">✓ SUCCESS</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connected!" backTo="/connections" backLabel="Connections">
            {/* Success aurora band */}
            <div className="fg-band">
                <span className="fg-band__label">CONNECTED · {displayName.toUpperCase()}</span>
                <span className="fg-band__right">✓ SUCCESS</span>
            </div>

            {/* Success hero */}
            <div style={{
                padding: '2.5rem 2rem',
                background: 'var(--fg-ink-2)',
                borderBottom: 'var(--fg-rule-thin)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '3rem' }}>{icon}</div>
                <h1 style={{
                    fontFamily: 'var(--fg-font-display)',
                    fontSize: '2.5rem',
                    letterSpacing: '-0.025em',
                    textTransform: 'uppercase',
                    margin: 0,
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                }}>
                    SUCCESS!
                </h1>
                <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '1.0625rem', color: 'var(--color-text-muted)', maxWidth: '480px', margin: 0 }}>
                    Your <strong style={{ color: 'var(--fg-paper)' }}>{displayName}</strong> account has been successfully connected to FitGlue.
                </p>
            </div>

            {/* Webhook setup — Hevy */}
            {ingressApiKey && requiresWebhookSetup && (
                <>
                    <div className="fg-band fg-band--ink">
                        <span className="fg-band__label">🔧 COMPLETE YOUR {displayName.toUpperCase()} SETUP</span>
                    </div>
                    <div style={{ padding: '1.5rem 2rem', background: 'var(--fg-ink-2)', borderBottom: 'var(--fg-rule-thin)' }}>
                        <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                            To receive workouts from {displayName}, configure webhooks in <strong style={{ color: 'var(--fg-paper)' }}>Settings → Developer</strong>.
                        </p>

                        {/* Step 1: URL */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                1 — WEBHOOK URL
                            </div>
                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Paste into &ldquo;Url you want to get notified on&rdquo;:
                            </p>
                            <div style={{ display: 'flex', alignItems: 'stretch', boxShadow: 'inset 0 0 0 2px var(--fg-paper)' }}>
                                <span style={{ flex: 1, background: 'var(--fg-ink)', padding: '0.75rem 1rem', fontFamily: 'var(--fg-font-mono)', fontSize: '0.8125rem', color: 'var(--fg-cyan)', wordBreak: 'break-all' }}>
                                    {webhookUrl}
                                </span>
                                <Button size="sm" onClick={handleCopyUrl} style={{ flexShrink: 0 }}>
                                    {copiedUrl ? '✓ COPIED' : 'COPY'}
                                </Button>
                            </div>
                        </div>

                        {/* Step 2: Auth header */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                2 — AUTHORIZATION HEADER
                            </div>
                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Paste into &ldquo;Your authorization header&rdquo;:
                            </p>
                            <div style={{ display: 'flex', alignItems: 'stretch', boxShadow: 'inset 0 0 0 2px var(--fg-paper)' }}>
                                <span style={{ flex: 1, background: 'var(--fg-ink)', padding: '0.75rem 1rem', fontFamily: 'var(--fg-font-mono)', fontSize: '0.8125rem', color: 'var(--fg-cyan)', wordBreak: 'break-all' }}>
                                    {ingressApiKey}
                                </span>
                                <Button size="sm" onClick={handleCopyKey} style={{ flexShrink: 0 }}>
                                    {copiedKey ? '✓ COPIED' : 'COPY'}
                                </Button>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                3 — CLICK &ldquo;SUBSCRIBE&rdquo; IN {displayName.toUpperCase()}
                            </div>
                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                Once subscribed, your workouts will sync automatically!
                            </p>
                        </div>

                        {/* Warning */}
                        <div style={{
                            padding: '0.875rem 1rem',
                            background: 'rgba(255, 214, 10, 0.08)',
                            boxShadow: 'inset 0 0 0 1.5px var(--fg-gold)',
                            fontFamily: 'var(--fg-font-body)',
                            fontSize: '0.875rem',
                            color: 'var(--fg-paper)',
                        }}>
                            ⚠️ <strong>Save the authorization header now!</strong> It won&apos;t be shown again.
                        </div>
                        {ingressKeyLabel && (
                            <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', letterSpacing: '0.08em' }}>
                                LABEL: {ingressKeyLabel}
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* Ingress API key (non-hevy) */}
            {ingressApiKey && !requiresWebhookSetup && (
                <>
                    <div className="fg-band fg-band--ink">
                        <span className="fg-band__label">🔑 CONFIGURE {displayName.toUpperCase()}</span>
                    </div>
                    <div style={{ padding: '1.5rem 2rem', background: 'var(--fg-ink-2)', borderBottom: 'var(--fg-rule-thin)' }}>
                        <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Copy this <strong style={{ color: 'var(--fg-paper)' }}>FitGlue Ingress API Key</strong> and add it to your {displayName} webhook settings as the Authorization header:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'stretch', boxShadow: 'inset 0 0 0 2px var(--fg-paper)', marginBottom: '1rem' }}>
                            <span style={{ flex: 1, background: 'var(--fg-ink)', padding: '0.75rem 1rem', fontFamily: 'var(--fg-font-mono)', fontSize: '0.8125rem', color: 'var(--fg-cyan)', wordBreak: 'break-all' }}>
                                {ingressApiKey}
                            </span>
                            <button className="fg-button fg-button--sm" onClick={handleCopyKey} style={{ flexShrink: 0 }}>
                                {copiedKey ? '✓ COPIED' : 'COPY'}
                            </button>
                        </div>
                        <div style={{
                            padding: '0.875rem 1rem',
                            background: 'rgba(255, 214, 10, 0.08)',
                            boxShadow: 'inset 0 0 0 1.5px var(--fg-gold)',
                            fontFamily: 'var(--fg-font-body)',
                            fontSize: '0.875rem',
                            color: 'var(--fg-paper)',
                        }}>
                            ⚠️ <strong>Save this key now!</strong> It won&apos;t be shown again.
                        </div>
                        {ingressKeyLabel && (
                            <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', letterSpacing: '0.08em' }}>
                                LABEL: {ingressKeyLabel}
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* Intervals webhook URL */}
            {requiresWebhookUrlOnly && (
                <>
                    <div className="fg-band fg-band--ink">
                        <span className="fg-band__label">🔧 ONE MORE STEP</span>
                    </div>
                    <div style={{ padding: '1.5rem 2rem', background: 'var(--fg-ink-2)', borderBottom: 'var(--fg-rule-thin)' }}>
                        <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Register this webhook URL in your <strong style={{ color: 'var(--fg-paper)' }}>Intervals.icu account settings</strong>:
                        </p>
                        <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                            Settings → Developer → Webhook URL
                        </p>
                        <div style={{ display: 'flex', alignItems: 'stretch', boxShadow: 'inset 0 0 0 2px var(--fg-paper)', marginBottom: '1rem' }}>
                            <span style={{ flex: 1, background: 'var(--fg-ink)', padding: '0.75rem 1rem', fontFamily: 'var(--fg-font-mono)', fontSize: '0.8125rem', color: 'var(--fg-cyan)', wordBreak: 'break-all' }}>
                                {webhookUrl}
                            </span>
                            <button className="fg-button fg-button--sm" onClick={handleCopyUrl} style={{ flexShrink: 0 }}>
                                {copiedUrl ? '✓ COPIED' : 'COPY'}
                            </button>
                        </div>
                        <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                            Once saved, FitGlue will be notified whenever you log an activity in Intervals.icu.
                        </p>
                    </div>
                </>
            )}

            {/* Auto-sync notice */}
            {!ingressApiKey && !requiresWebhookUrlOnly && (
                <div style={{ padding: '1.25rem 2rem', background: 'var(--fg-ink-2)', borderBottom: 'var(--fg-rule-thin)' }}>
                    <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        Your activities will now sync automatically.
                    </p>
                </div>
            )}

            {/* Available Actions */}
            {integration?.actions && integration.actions.length > 0 && (
                <>
                    <div className="fg-band fg-band--ink">
                        <span className="fg-band__label">🚀 GET STARTED</span>
                        <span className="fg-band__right">{integration.actions.length} ACTIONS AVAILABLE</span>
                    </div>
                    <div style={{ padding: '0 2rem', background: 'var(--fg-ink-2)', borderBottom: 'var(--fg-rule-thin)' }}>
                        <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', padding: '1rem 0 0' }}>
                            You can run these now, or find them later in your connection settings.
                        </p>
                        {integration.actions.map((action: IntegrationAction) => {
                            const running = isActionRunning(action.id);
                            const completed = isActionCompleted(action.id);
                            const error = getActionError(action.id);

                            return (
                                <div key={action.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr auto',
                                    gap: '1rem',
                                    padding: '1rem 0',
                                    borderBottom: 'var(--fg-rule-thin)',
                                    alignItems: 'center',
                                }}>
                                    <span style={{ fontSize: '1.5rem', width: '40px', textAlign: 'center' }}>{action.icon}</span>
                                    <div>
                                        <div style={{ fontFamily: 'var(--fg-font-display)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '-0.005em', color: 'var(--fg-paper)' }}>
                                            {action.label}
                                        </div>
                                        <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
                                            {action.description}
                                        </p>
                                        {error && (
                                            <Badge variant="error">{error}</Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant={completed ? 'ink' : 'primary'}
                                        size="sm"
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
                                        {running ? 'RUNNING…' : completed ? '✓ DONE' : 'RUN'}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Navigation footer */}
            <div style={{
                padding: '1.25rem 2rem',
                background: 'var(--fg-ink-2)',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
            }}>
                <Button size="sm" onClick={() => navigate('/connections')}>
                    VIEW CONNECTIONS
                </Button>
                <Button variant="ink" size="sm" onClick={() => navigate('/')}>
                    GO TO DASHBOARD
                </Button>
            </div>
        </PageLayout>
    );
};

export default ConnectionSuccessPage;
