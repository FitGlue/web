import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import {
    CardSkeleton, Badge, ConfirmDialog, useToast
} from '../components/library/ui';
import { PluginIcon } from '../components/library/ui/PluginIcon';
import { client } from '../../shared/api/client';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useConnectionActions } from '../hooks/useConnectionActions';
import { IntegrationAuthType } from '../types/plugin';
import { resolveEnum } from '../utils/resolveEnum';
import '../components/library/ui/CardSkeleton.css';
import './ConnectionDetailPage.css';

const getWebhookUrl = (integrationId: string): string => {
    const hostname = window.location.hostname;
    const baseUrl = (hostname.includes('dev.fitglue') || hostname === 'localhost')
        ? 'https://dev.fitglue.tech'
        : 'https://fitglue.tech';
    return `${baseUrl}/api/webhooks/${integrationId}`;
};

interface IntegrationStatus {
    connected: boolean;
    externalUserId?: string;
    lastUsedAt?: string;
    additionalDetails?: Record<string, string>;
}

const ConnectionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations, loading: integrationsLoading, refresh } = useRealtimeIntegrations();

    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    const requiresWebhookUrlOnly = id === 'intervals';
    const webhookUrl = useMemo(() => requiresWebhookUrlOnly && id ? getWebhookUrl(id) : '', [id, requiresWebhookUrlOnly]);

    const integration = registryIntegrations.find(i => i.id === id);
    const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[id || ''];
    const isConnected = status?.connected ?? false;

    const {
        triggerAction,
        isActionRunning,
        isActionCompleted,
        getActionError,
    } = useConnectionActions(id || '');

    const formatLastSynced = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const handleCopyId = async () => {
        if (!status?.externalUserId) return;
        try {
            await navigator.clipboard.writeText(status.externalUserId);
            setCopied(true);
            toast.success('Copied', 'ID copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed', 'Could not copy to clipboard');
        }
    };

    const handleCopyWebhookUrl = async () => {
        if (!webhookUrl) return;
        await navigator.clipboard.writeText(webhookUrl);
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
    };

    const handleReconnect = () => {
        navigate(`/connections/${id}/setup`);
    };

    const handleDisconnect = async () => {
        setShowDisconnectConfirm(false);
        setDisconnecting(true);
        try {
            await client.DELETE('/users/me/integrations/{provider}', { params: { path: { provider: id! } } });
            await refresh();
            toast.success('Disconnected', `${integration?.name} has been disconnected`);
            navigate('/connections');
        } catch (error) {
            console.error('Failed to disconnect:', error);
            toast.error('Failed', 'Could not disconnect. Please try again.');
        } finally {
            setDisconnecting(false);
        }
    };

    // Loading state
    if (registryLoading || integrationsLoading) {
        return (
            <PageLayout title="Connection" backTo="/connections" backLabel="Connections">
                <div className="fg-band">
                    <span className="fg-band__label">CONNECTION</span>
                    <span className="fg-band__right">LOADING…</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <CardSkeleton variant="integration" />
                </div>
            </PageLayout>
        );
    }

    // Integration not found
    if (!integration) {
        return (
            <PageLayout title="Connection Not Found" backTo="/connections" backLabel="Connections">
                <div className="fg-band fg-band--ink">
                    <span className="fg-band__label">CONNECTION NOT FOUND</span>
                </div>
                <div className="conn-detail__section-body">
                    <p style={{ fontFamily: 'var(--fg-font-body)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        This connection type does not exist.
                    </p>
                    <button className="fg-button fg-button--sm" onClick={() => navigate('/connections')}>
                        BACK TO CONNECTIONS
                    </button>
                </div>
            </PageLayout>
        );
    }

    // Not connected — prompt to set up
    if (!isConnected) {
        return (
            <PageLayout title={integration.name} backTo="/connections" backLabel="Connections">
                <div className="fg-band fg-band--ink">
                    <span className="fg-band__label">CONNECTION · {integration.name.toUpperCase()}</span>
                    <span className="fg-band__right">○ NOT CONNECTED</span>
                </div>
                <div className="conn-detail">
                    <div className="conn-detail__hero">
                        <div className="conn-detail__icon">
                            <PluginIcon
                                icon={integration.icon}
                                iconType={integration.iconType}
                                iconPath={integration.iconPath}
                                size="large"
                            />
                        </div>
                        <div>
                            <div className="conn-detail__hero-name">{integration.name}</div>
                            <div className="conn-detail__hero-sub">{integration.description}</div>
                        </div>
                        <span className="fg-stamp fg-stamp--ink">NOT CONNECTED</span>
                    </div>
                    <div className="conn-detail__actions">
                        <button className="fg-button fg-button--sm fg-button--ink" onClick={() => navigate('/connections')}>
                            ← BACK
                        </button>
                        <button className="fg-button fg-button--sm" onClick={() => navigate(`/connections/${id}/setup`)}>
                            CONNECT {integration.name.toUpperCase()} →
                        </button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    const authType = resolveEnum(integration.authType, IntegrationAuthType);
    const isOAuth = authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_OAUTH;
    const isAppSync = authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_APP_SYNC;

    return (
        <PageLayout
            title={integration.name}
            backTo="/connections"
            backLabel="Connections"
        >
            {/* Aurora band header */}
            <div className="fg-band">
                <span className="fg-band__label">CONNECTION · {integration.name.toUpperCase()}</span>
                <span className="fg-band__right">● ACTIVE</span>
            </div>

            <div className="conn-detail">
                {/* Hero */}
                <div className="conn-detail__hero">
                    <div className="conn-detail__icon">
                        <PluginIcon
                            icon={integration.icon}
                            iconType={integration.iconType}
                            iconPath={integration.iconPath}
                            size="large"
                        />
                    </div>
                    <div>
                        <div className="conn-detail__hero-name">{integration.name}</div>
                        <div className="conn-detail__hero-sub">{integration.description}</div>
                    </div>
                    <span className="fg-stamp fg-stamp--green">✓ CONNECTED</span>
                </div>

                {/* Connection Details section */}
                <div className="conn-detail__section">
                    <div className="conn-detail__section-head">
                        CONNECTION DETAILS
                    </div>
                    <div className="conn-detail__section-body">
                        {status?.externalUserId && (
                            <div className="conn-detail__field">
                                <span className="conn-detail__field-label">
                                    {integration.apiKeyLabel || 'ID'}
                                </span>
                                <span className="conn-detail__field-value">{status.externalUserId}</span>
                                <button
                                    className="fg-button fg-button--sm fg-button--ghost"
                                    onClick={handleCopyId}
                                >
                                    {copied ? '✓ COPIED' : 'COPY'}
                                </button>
                            </div>
                        )}

                        {status?.additionalDetails && Object.entries(status.additionalDetails).map(([label, value]) => (
                            <div className="conn-detail__field" key={label}>
                                <span className="conn-detail__field-label">{label}</span>
                                <span className="conn-detail__field-value">{value}</span>
                                <span />
                            </div>
                        ))}

                        {status?.lastUsedAt && (
                            <div className="conn-detail__field">
                                <span className="conn-detail__field-label">Last Synced</span>
                                <span className="conn-detail__field-value--plain">
                                    {formatLastSynced(status.lastUsedAt)}
                                </span>
                                <span />
                            </div>
                        )}
                    </div>
                </div>

                {/* App Sync notice */}
                {isAppSync && (
                    <div className="conn-detail__section">
                        <div className="conn-detail__section-head">SYNC METHOD</div>
                        <div className="conn-detail__section-body">
                            <div className="conn-detail__notice">
                                <span className="conn-detail__notice-icon">📱</span>
                                <div>
                                    <div className="conn-detail__notice-title">Syncs via Mobile App</div>
                                    <p className="conn-detail__notice-sub">
                                        Activities from {integration.name} are synced through the FitGlue mobile app.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Intervals webhook URL reminder */}
                {requiresWebhookUrlOnly && (
                    <div className="conn-detail__section">
                        <div className="conn-detail__section-head">WEBHOOK SETUP</div>
                        <div className="conn-detail__section-body">
                            <div className="conn-detail__notice" style={{ marginBottom: '1rem' }}>
                                <span className="conn-detail__notice-icon">🔗</span>
                                <div>
                                    <div className="conn-detail__notice-title">Webhook Setup Required</div>
                                    <p className="conn-detail__notice-sub">
                                        Register this URL in <strong>Intervals.icu → Settings → Developer → Webhook URL</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="conn-detail__field">
                                <span className="conn-detail__field-label">Webhook URL</span>
                                <span className="conn-detail__field-value">{webhookUrl}</span>
                                <button className="fg-button fg-button--sm fg-button--ghost" onClick={handleCopyWebhookUrl}>
                                    {copiedWebhook ? '✓ COPIED' : 'COPY'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Available Actions */}
                {integration.actions && integration.actions.length > 0 && (
                    <div className="conn-detail__section">
                        <div className="conn-detail__section-head">
                            AVAILABLE ACTIONS
                            <span>{integration.actions.length} ACTION{integration.actions.length !== 1 ? 'S' : ''}</span>
                        </div>
                        <div className="conn-detail__section-body">
                            {integration.actions.map((action: { id: string; label: string; description: string; icon: string }) => {
                                const running = isActionRunning(action.id);
                                const completed = isActionCompleted(action.id);
                                const error = getActionError(action.id);

                                return (
                                    <div key={action.id} className="conn-detail__action-row">
                                        <span className="conn-detail__action-icon">{action.icon}</span>
                                        <div>
                                            <div className="conn-detail__action-name">{action.label}</div>
                                            <p className="conn-detail__action-sub">{action.description}</p>
                                            {error && (
                                                <Badge variant="error">{error}</Badge>
                                            )}
                                        </div>
                                        <button
                                            className={`fg-button fg-button--sm${completed ? ' fg-button--ink' : ''}`}
                                            disabled={running}
                                            onClick={async () => {
                                                try {
                                                    await triggerAction(action.id);
                                                    toast.success(
                                                        'Action Started',
                                                        `${action.label} is running in the background.`
                                                    );
                                                } catch {
                                                    toast.error('Failed', 'Could not start the action. Please try again.');
                                                }
                                            }}
                                        >
                                            {running ? 'RUNNING…' : completed ? 'RUN AGAIN' : 'RUN'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions footer */}
                <div className="conn-detail__actions">
                    {isOAuth && (
                        <button className="fg-button fg-button--sm fg-button--ink" onClick={handleReconnect}>
                            RECONNECT
                        </button>
                    )}
                    <button
                        className="fg-button fg-button--sm"
                        style={{ background: 'var(--fg-rose)', color: 'var(--fg-paper)' }}
                        onClick={() => setShowDisconnectConfirm(true)}
                        disabled={disconnecting}
                    >
                        {disconnecting ? 'DISCONNECTING…' : 'DISCONNECT'}
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDisconnectConfirm}
                title="Disconnect Integration"
                message={`Are you sure you want to disconnect ${integration.name}? You'll need to reconnect to sync activities again.`}
                confirmLabel="Disconnect"
                isDestructive={true}
                onConfirm={handleDisconnect}
                onCancel={() => setShowDisconnectConfirm(false)}
                isLoading={disconnecting}
            />
        </PageLayout>
    );
};

export default ConnectionDetailPage;
