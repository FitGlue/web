import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { CardSkeleton, Button, useToast } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useConnectionActions } from '../hooks/useConnectionActions';
import { IntegrationAction } from '../types/plugin';
import './ConnectionSuccessPage.css';

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
            <PageLayout title="Connected!">
                <div style={{ padding: '1.5rem' }}>
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connected!">
            <div className="success-scene">
                <div className="state">
                    <span className="state__stamp state__stamp--green">✓ CONNECTED</span>
                    <div className="state__icon">{icon}</div>
                    <h2 className="state__h">
                        {displayName} is{' '}
                        <span className="state__h-gr">live.</span>
                    </h2>
                    <p className="state__body">
                        Your <strong>{displayName}</strong> account has been successfully connected to FitGlue.
                        Your activities will start flowing in automatically.
                    </p>

                    <div className="state__detail" style={{ textAlign: 'left' }}>
                        <div className="state__detail-l">WHAT HAPPENS NEXT</div>
                        <div>
                            1 · Build a pipeline with {displayName} as source or destination.<br />
                            2 · Upload an activity (or use any source pointing at it).<br />
                            3 · Watch the run trace appear in /app/activities within ~5s.
                        </div>
                    </div>

                    {/* Webhook setup — Hevy */}
                    {ingressApiKey && requiresWebhookSetup && (
                        <div className="state__detail" style={{ textAlign: 'left', width: '100%' }}>
                            <div className="state__detail-l">🔧 COMPLETE YOUR {displayName.toUpperCase()} SETUP</div>
                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Configure webhooks in <strong style={{ color: 'var(--fg-paper)' }}>Settings → Developer</strong>.
                            </p>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div className="state__detail-l">1 — WEBHOOK URL</div>
                                <div className="success-copy-row">
                                    <span className="success-copy-value">{webhookUrl}</span>
                                    <Button size="sm" onClick={handleCopyUrl}>
                                        {copiedUrl ? '✓ COPIED' : 'COPY'}
                                    </Button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div className="state__detail-l">2 — AUTHORIZATION HEADER</div>
                                <div className="success-copy-row">
                                    <span className="success-copy-value">{ingressApiKey}</span>
                                    <Button size="sm" onClick={handleCopyKey}>
                                        {copiedKey ? '✓ COPIED' : 'COPY'}
                                    </Button>
                                </div>
                            </div>
                            <div className="success-warning">
                                ⚠️ <strong>Save the authorization header now!</strong> It won&apos;t be shown again.
                            </div>
                            {ingressKeyLabel && (
                                <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    LABEL: {ingressKeyLabel}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Ingress API key (non-hevy) */}
                    {ingressApiKey && !requiresWebhookSetup && (
                        <div className="state__detail" style={{ textAlign: 'left', width: '100%' }}>
                            <div className="state__detail-l">🔑 CONFIGURE {displayName.toUpperCase()}</div>
                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                                Copy this <strong style={{ color: 'var(--fg-paper)' }}>FitGlue Ingress API Key</strong> and add it as the Authorization header in {displayName} webhook settings:
                            </p>
                            <div className="success-copy-row" style={{ marginBottom: '0.75rem' }}>
                                <span className="success-copy-value">{ingressApiKey}</span>
                                <Button size="sm" onClick={handleCopyKey}>
                                    {copiedKey ? '✓ COPIED' : 'COPY'}
                                </Button>
                            </div>
                            <div className="success-warning">
                                ⚠️ <strong>Save this key now!</strong> It won&apos;t be shown again.
                            </div>
                            {ingressKeyLabel && (
                                <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    LABEL: {ingressKeyLabel}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Intervals webhook URL */}
                    {requiresWebhookUrlOnly && (
                        <div className="state__detail" style={{ textAlign: 'left', width: '100%' }}>
                            <div className="state__detail-l">🔧 ONE MORE STEP</div>
                            <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                                Settings → Developer → Webhook URL
                            </p>
                            <div className="success-copy-row" style={{ marginBottom: '0.75rem' }}>
                                <span className="success-copy-value">{webhookUrl}</span>
                                <Button size="sm" onClick={handleCopyUrl}>
                                    {copiedUrl ? '✓ COPIED' : 'COPY'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Available Actions */}
                    {integration?.actions && integration.actions.length > 0 && (
                        <div className="state__detail" style={{ textAlign: 'left', width: '100%' }}>
                            <div className="state__detail-l">🚀 GET STARTED — {integration.actions.length} ACTIONS AVAILABLE</div>
                            {integration.actions.map((action: IntegrationAction) => {
                                const running = isActionRunning(action.id);
                                const completed = isActionCompleted(action.id);
                                const actionError = getActionError(action.id);
                                return (
                                    <div key={action.id} className="success-action-row">
                                        <span className="success-action-icon">{action.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontFamily: 'var(--fg-font-display)', fontSize: '0.9375rem', textTransform: 'uppercase', letterSpacing: '-0.005em' }}>
                                                {action.label}
                                            </div>
                                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
                                                {action.description}
                                            </p>
                                            {actionError && (
                                                <p style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', color: 'var(--fg-rose)', marginTop: '0.25rem' }}>{actionError}</p>
                                            )}
                                        </div>
                                        <Button
                                            variant={completed ? 'ink' : 'primary'}
                                            size="sm"
                                            disabled={running}
                                            onClick={async () => {
                                                try {
                                                    await triggerAction(action.id);
                                                    toast.success('Action Started', `${action.label} is running in the background.`);
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
                    )}

                    <div className="state__cta">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/connections/${id}`)}>
                            VIEW CONNECTION
                        </Button>
                        <Button size="sm" onClick={() => navigate('/settings/pipelines/new')}>
                            BUILD A PIPELINE →
                        </Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ConnectionSuccessPage;
