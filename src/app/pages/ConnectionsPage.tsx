import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { SmartNudge } from '../components/SmartNudge';
import { CardSkeleton } from '../components/library/ui';
import { PluginIcon } from '../components/library/ui/PluginIcon';

import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useNerdMode } from '../state/NerdModeContext';
import '../components/library/ui/CardSkeleton.css';
import { IntegrationManifest } from '../types/plugin';
import './ConnectionsPage.css';

interface IntegrationStatus {
    connected: boolean;
    externalUserId?: string;
    lastUsedAt?: string;
    additionalDetails?: Record<string, string>;
}

interface ConnectionTileProps {
    integration: IntegrationManifest;
    status: IntegrationStatus | undefined;
    onConnect: () => void;
    onView: () => void;
}

const ConnectionTile: React.FC<ConnectionTileProps> = ({
    integration,
    status,
    onConnect,
    onView,
}) => {
    const isConnected = status?.connected ?? false;
    const { isNerdMode } = useNerdMode();

    const formatLastSynced = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const lastSynced = formatLastSynced(status?.lastUsedAt);

    return (
        <div className={`conn-tile${isConnected ? ' conn-tile--connected' : ''}`}>
            {/* Header: icon + name + status badge */}
            <div className="conn-tile__head">
                <div className="conn-tile__identity">
                    <div className="conn-tile__icon">
                        <PluginIcon
                            icon={integration.icon}
                            iconType={integration.iconType}
                            iconPath={integration.iconPath}
                            size="medium"
                        />
                    </div>
                    <span className="conn-tile__name">{integration.name}</span>
                </div>
                <span className={`conn-tile__status ${isConnected ? 'conn-tile__status--connected' : 'conn-tile__status--disconnected'}`}>
                    {isConnected ? '✓ CONNECTED' : 'NOT CONNECTED'}
                </span>
            </div>

            {/* Description */}
            <p className="conn-tile__desc">{integration.description}</p>

            {/* Connected metadata */}
            {isConnected && (
                <div className="conn-tile__meta">
                    {isNerdMode && status?.externalUserId && (
                        <span>ID: <b>{status.externalUserId}</b></span>
                    )}
                    {lastSynced && (
                        <span>SYNCED: <b>{lastSynced}</b></span>
                    )}
                    {isNerdMode && status?.additionalDetails && Object.entries(status.additionalDetails).map(([key, value]) => (
                        <span key={key}>{key}: <b>{value}</b></span>
                    ))}
                    {integration.actions && integration.actions.length > 0 && (
                        <span>⚡ {integration.actions.length} {integration.actions.length === 1 ? 'ACTION' : 'ACTIONS'}</span>
                    )}
                </div>
            )}

            {/* Action */}
            <div className="conn-tile__foot">
                {isConnected ? (
                    <button className="fg-button fg-button--sm fg-button--ink" onClick={onView}>
                        VIEW →
                    </button>
                ) : (
                    <button className="fg-button fg-button--sm" onClick={onConnect}>
                        CONNECT
                    </button>
                )}
            </div>
        </div>
    );
};

const ConnectionsPage: React.FC = () => {
    const navigate = useNavigate();
    const { integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations, loading, refresh: refreshIntegrations } = useRealtimeIntegrations();

    const handleConnect = (integration: IntegrationManifest) => {
        navigate(`/connections/${integration.id}/setup`);
    };

    const handleView = (integration: IntegrationManifest) => {
        navigate(`/connections/${integration.id}`);
    };

    const connectedCount = registryIntegrations.filter(i => {
        const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[i.id];
        return status?.connected;
    }).length;

    const connectedIntegrations = registryIntegrations.filter(i => {
        const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[i.id];
        return status?.connected;
    });
    const availableIntegrations = registryIntegrations.filter(i => {
        const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[i.id];
        return !status?.connected;
    });

    if (loading || registryLoading) {
        return (
            <PageLayout title="Connections" backTo="/" backLabel="Dashboard">
                <div className="fg-band">
                    <span className="fg-band__label">CONNECTIONS</span>
                    <span className="fg-band__right">LOADING…</span>
                </div>
                <div className="conn-grid">
                    <div style={{ padding: '1.5rem' }}><CardSkeleton variant="integration" /></div>
                    <div style={{ padding: '1.5rem' }}><CardSkeleton variant="integration" /></div>
                    <div style={{ padding: '1.5rem' }}><CardSkeleton variant="integration" /></div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Connections"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={refreshIntegrations}
        >
            <SmartNudge page="connections" />

            {/* Connected section */}
            {connectedIntegrations.length > 0 && (
                <>
                    <div className="fg-band">
                        <span className="fg-band__label">CONNECTED</span>
                        <span className="fg-band__right">{connectedCount} ACTIVE</span>
                    </div>
                    <div className="conn-grid">
                        {connectedIntegrations.map(integration => {
                            const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[integration.id];
                            return (
                                <ConnectionTile
                                    key={integration.id}
                                    integration={integration}
                                    status={status}
                                    onConnect={() => handleConnect(integration)}
                                    onView={() => handleView(integration)}
                                />
                            );
                        })}
                    </div>
                </>
            )}

            {/* Available section */}
            <div className="fg-band fg-band--ink">
                <span className="fg-band__label">AVAILABLE CONNECTIONS</span>
                <span className="fg-band__right">{availableIntegrations.length} SERVICES</span>
            </div>

            {availableIntegrations.length === 0 ? (
                <div className="conn-empty">
                    <div className="conn-empty__icon">🔗</div>
                    <div className="conn-empty__title">ALL CONNECTED</div>
                    <p className="conn-empty__sub">You have connected all available services.</p>
                </div>
            ) : (
                <div className="conn-grid">
                    {availableIntegrations.map(integration => {
                        const status = (integrations as Record<string, IntegrationStatus | undefined> | null)?.[integration.id];
                        return (
                            <ConnectionTile
                                key={integration.id}
                                integration={integration}
                                status={status}
                                onConnect={() => handleConnect(integration)}
                                onView={() => handleView(integration)}
                            />
                        );
                    })}
                </div>
            )}
        </PageLayout>
    );
};

export default ConnectionsPage;
