import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { PageLayout } from '../components/library/layout';
import { CardSkeleton, Badge, Button, ConfirmDialog, RunRow, useToast } from '../components/library/ui';
import { PluginIcon } from '../components/library/ui/PluginIcon';
import { client } from '../../shared/api/client';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { useConnectionActions } from '../hooks/useConnectionActions';
import { pipelineRunsAtom } from '../state/activitiesState';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
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
    const { pipelines } = useRealtimePipelines();

    useRealtimePipelineRuns(true, 50);
    const [pipelineRuns] = useAtom(pipelineRunsAtom);

    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);

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

    // Filter pipeline runs by this connection (source match)
    const connectionRuns = useMemo(() => {
        const connId = id?.toLowerCase() || '';
        return pipelineRuns.filter(r => r.source?.toLowerCase() === connId).slice(0, 10);
    }, [pipelineRuns, id]);

    // Pipeline name lookup for RunRow
    const pipelineNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        pipelines.forEach(p => { map[p.id] = p.name || p.id; });
        return map;
    }, [pipelines]);

    const formatLastSynced = (dateStr?: string): string | null => {
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

    const formatConnectedSince = (dateStr?: string): string | null => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
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

    const handleReconnect = () => navigate(`/connections/${id}/setup`);

    const handleDisconnect = async () => {
        setShowDisconnectConfirm(false);
        setDisconnecting(true);
        try {
            await client.DELETE('/users/me/integrations/{provider}', { params: { path: { provider: id! } } });
            refresh();
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
                    <Button size="sm" onClick={() => navigate('/connections')}>
                        BACK TO CONNECTIONS
                    </Button>
                </div>
            </PageLayout>
        );
    }

    // Not connected
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
                            <PluginIcon icon={integration.icon} iconType={integration.iconType} iconPath={integration.iconPath} size="large" />
                        </div>
                        <div>
                            <div className="conn-detail__hero-name">{integration.name}</div>
                            <div className="conn-detail__hero-sub">{integration.description}</div>
                        </div>
                        <Badge>NOT CONNECTED</Badge>
                    </div>
                    <div className="conn-detail__actions">
                        <Button variant="ink" size="sm" onClick={() => navigate('/connections')}>← BACK</Button>
                        <Button size="sm" onClick={() => navigate(`/connections/${id}/setup`)}>
                            CONNECT {integration.name.toUpperCase()} →
                        </Button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    const authType = resolveEnum(integration.authType, IntegrationAuthType);
    const isOAuth = authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_OAUTH;
    const isAppSync = authType === IntegrationAuthType.INTEGRATION_AUTH_TYPE_APP_SYNC;
    const lastSynced = formatLastSynced(status?.lastUsedAt);
    const connectedSince = formatConnectedSince(status?.lastUsedAt);

    const hasConfig = !!(status?.externalUserId || (status?.additionalDetails && Object.keys(status.additionalDetails).length > 0) || requiresWebhookUrlOnly);

    return (
        <PageLayout
            title={integration.name}
            backTo="/connections"
            backLabel="Connections"
        >
            {/* Hero */}
            <div className="cd-hero">
                <div className="cd-hero__icon">
                    <PluginIcon
                        icon={integration.icon}
                        iconType={integration.iconType}
                        iconPath={integration.iconPath}
                        size="large"
                    />
                </div>
                <div>
                    <div className="cd-hero__name">{integration.name}</div>
                    <div className="cd-hero__meta">
                        {connectedSince && <>CONNECTED SINCE <b>{connectedSince}</b></>}
                        {status?.externalUserId && <> · ID <b>{status.externalUserId}</b></>}
                    </div>
                </div>
                <div className="cd-hero__status">
                    <span className="cd-hero__status-pill">✓ HEALTHY</span>
                    {lastSynced && (
                        <span className="cd-hero__status-last">SYNCED {lastSynced}</span>
                    )}
                </div>
            </div>

            {/* Actions strip */}
            <div className="cd-actions">
                {isOAuth && (
                    <button className="cd-actions__btn" onClick={handleReconnect}>
                        🔄 RECONNECT
                    </button>
                )}
                {integration.actions?.map((action: { id: string; label: string; icon: string }) => {
                    const running = isActionRunning(action.id);
                    const completed = isActionCompleted(action.id);
                    const error = getActionError(action.id);
                    return (
                        <button
                            key={action.id}
                            className="cd-actions__btn"
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
                            {action.icon} {running ? 'RUNNING…' : completed ? `${action.label} AGAIN` : action.label.toUpperCase()}
                            {error && <span style={{ marginLeft: 4, color: 'var(--fg-rose)', fontSize: '.625rem' }}>⚠</span>}
                        </button>
                    );
                })}
                <div className="cd-actions__spacer" />
                <button
                    className="cd-actions__btn cd-actions__btn--danger"
                    onClick={() => setShowDisconnectConfirm(true)}
                    disabled={disconnecting}
                >
                    ⊗ {disconnecting ? 'DISCONNECTING…' : 'DISCONNECT'}
                </button>
                {lastSynced && (
                    <span className="cd-actions__meta">LAST SYNC <b>{lastSynced}</b></span>
                )}
            </div>

            {/* Body: status sidebar + feed */}
            <div className="cd-body">

                {/* Left: status sidebar */}
                <aside className="cd-status">
                    {/* Status rows */}
                    <div className="cd-status__group">
                        <div className="cd-status__label">⚡ STATUS</div>
                        {status?.lastUsedAt && (
                            <div className="cd-status__row">
                                <span className="cd-status__row-l">Last sync</span>
                                <span className="cd-status__row-v cd-status__row-v--gr">{lastSynced}</span>
                            </div>
                        )}
                        <div className="cd-status__row">
                            <span className="cd-status__row-l">Recent runs</span>
                            <span className="cd-status__row-v">{connectionRuns.length}</span>
                        </div>
                        {isAppSync && (
                            <div className="cd-status__row">
                                <span className="cd-status__row-l">Sync method</span>
                                <span className="cd-status__row-v">📱 Mobile app</span>
                            </div>
                        )}
                    </div>

                    {/* App Sync notice */}
                    {isAppSync && (
                        <div className="cd-status__group">
                            <div className="cd-status__label">📱 SYNC METHOD</div>
                            <div className="cd-status__notice">
                                Activities from {integration.name} are synced through the FitGlue mobile app.
                            </div>
                        </div>
                    )}

                    {/* Webhook URL */}
                    {requiresWebhookUrlOnly && (
                        <div className="cd-status__group">
                            <div className="cd-status__label">🔗 WEBHOOK</div>
                            <div className="cd-status__notice">
                                Register this URL in Intervals.icu → Settings → Developer.
                            </div>
                            <button className="cd-status__copy-btn" onClick={handleCopyWebhookUrl}>
                                {copiedWebhook ? '✓ COPIED' : 'COPY WEBHOOK URL'}
                            </button>
                        </div>
                    )}

                    {/* External ID */}
                    {status?.externalUserId && (
                        <div className="cd-status__group">
                            <div className="cd-status__label">🔑 {integration.apiKeyLabel?.toUpperCase() || 'ACCOUNT ID'}</div>
                            <div className="cd-status__row">
                                <span className="cd-status__row-l cd-status__row-l--mono">{status.externalUserId}</span>
                                <button className="cd-status__copy-btn" onClick={handleCopyId}>
                                    {copied ? '✓' : 'COPY'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Additional details */}
                    {status?.additionalDetails && Object.keys(status.additionalDetails).length > 0 && (
                        <div className="cd-status__group">
                            <div className="cd-status__label">ℹ DETAILS</div>
                            {Object.entries(status.additionalDetails).map(([label, value]) => (
                                <div className="cd-status__row" key={label}>
                                    <span className="cd-status__row-l">{label}</span>
                                    <span className="cd-status__row-v">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Integration actions in sidebar */}
                    {integration.actions && integration.actions.length > 0 && (
                        <div className="cd-status__group">
                            <div className="cd-status__label">
                                ⚡ ACTIONS · {integration.actions.length}
                            </div>
                            {integration.actions.map((action: { id: string; label: string; description: string; icon: string }) => (
                                <div key={action.id} className="cd-status__action">
                                    <span className="cd-status__action-icon">{action.icon}</span>
                                    <div className="cd-status__action-body">
                                        <div className="cd-status__action-name">{action.label}</div>
                                        {getActionError(action.id) && (
                                            <div className="cd-status__action-err">{getActionError(action.id)}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                {/* Right: recent runs + config */}
                <div className="cd-feed">
                    <div className="fg-band fg-band--ink">
                        <span className="fg-band__label">✨ RECENT RUNS · THROUGH {integration.name.toUpperCase()}</span>
                        <span className="fg-band__right">{connectionRuns.length} RUNS</span>
                    </div>

                    {connectionRuns.length === 0 ? (
                        <div className="cd-feed__empty">
                            <span>No runs through this connection yet</span>
                        </div>
                    ) : (
                        connectionRuns.map(run => (
                            <RunRow
                                key={run.id}
                                run={run}
                                variant="feed"
                                pipelineName={pipelineNameMap[run.pipelineId]}
                                onClick={() => {
                                    if (run.activityId) navigate(`/activities/${run.activityId}`);
                                    else navigate(`/activities/unsynchronized/${run.id}`);
                                }}
                            />
                        ))
                    )}

                    {/* Collapsible config */}
                    {hasConfig && (
                        <div className="cd-config">
                            <button className="cd-config__head" onClick={() => setConfigOpen(o => !o)}>
                                <span className="cd-config__title">⚙ CONFIGURATION</span>
                                <span className="cd-config__chev">{configOpen ? '−' : '+'}</span>
                            </button>
                            {configOpen && (
                                <div className="cd-config__grid">
                                    {status?.externalUserId && (
                                        <div className="cd-config__kv">
                                            <span className="cd-config__k">{integration.apiKeyLabel || 'ID'}</span>
                                            <span className="cd-config__v">{status.externalUserId}</span>
                                        </div>
                                    )}
                                    {requiresWebhookUrlOnly && (
                                        <div className="cd-config__kv">
                                            <span className="cd-config__k">WEBHOOK URL</span>
                                            <span className="cd-config__v">{webhookUrl}</span>
                                        </div>
                                    )}
                                    {status?.additionalDetails && Object.entries(status.additionalDetails).map(([k, v]) => (
                                        <div className="cd-config__kv" key={k}>
                                            <span className="cd-config__k">{k}</span>
                                            <span className="cd-config__v">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
