import React, { useState, useEffect, useCallback } from 'react';
import './SyncHistoricalModal.css';
import { Modal } from './library/ui/Modal';
import { Button } from './library/ui/Button';
import { Stack } from './library/layout/Stack';
import { Paragraph } from './library/ui/Paragraph';
import { PluginIcon } from './library/ui/PluginIcon';
import { client } from '../../shared/api/client';
import { components } from '../../shared/api/schema-client';

type SourceActivityItem = components['schemas']['SourceActivityItemGateway'];

interface ProviderInfo {
    name: string;
    icon?: string;
    iconType?: string;
    iconPath?: string;
}

export const SUPPORTED_HISTORICAL_IMPORT_PROVIDERS = ['hevy', 'strava', 'fitbit', 'intervals'] as const;
export type SupportedHistoricalImportProvider = typeof SUPPORTED_HISTORICAL_IMPORT_PROVIDERS[number];

interface Props {
    provider: SupportedHistoricalImportProvider;
    providerManifest: ProviderInfo | undefined;
    onClose: () => void;
}

function formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export const SyncHistoricalModal: React.FC<Props> = ({
    provider,
    providerManifest,
    onClose,
}) => {
    const [activities, setActivities] = useState<SourceActivityItem[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
    const [loadingPage, setLoadingPage] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncedCount, setSyncedCount] = useState<number | null>(null);

    const loadActivities = useCallback(async (pageToken?: string) => {
        setLoadingPage(true);
        setSyncError(null);
        try {
            const { data, error } = await client.GET('/users/me/connections/{provider}/activities', {
                params: {
                    path: { provider },
                    query: pageToken ? { page_token: pageToken } : {},
                },
            });
            if (error || !data) {
                setSyncError('Failed to load activities');
                return;
            }
            const response = data as { activities?: SourceActivityItem[]; nextPageToken?: string };
            setActivities(prev => pageToken ? [...prev, ...(response.activities ?? [])] : (response.activities ?? []));
            setNextPageToken(response.nextPageToken ?? undefined);
        } catch {
            setSyncError('Failed to load activities');
        } finally {
            setLoadingPage(false);
        }
    }, [provider]);

    useEffect(() => {
        setActivities([]);
        setNextPageToken(undefined);
        setSelectedIds(new Set());
        setSyncError(null);
        setSyncedCount(null);
        loadActivities();
    }, [loadActivities]);

    const toggleActivity = (id: string, alreadySynced?: boolean) => {
        if (alreadySynced) return;
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSync = async () => {
        if (selectedIds.size === 0) return;
        setSyncing(true);
        setSyncError(null);
        try {
            const { data, error } = await client.POST('/users/me/connections/{provider}/backfill', {
                params: { path: { provider } },
                body: {
                    sourceActivityIds: Array.from(selectedIds),
                } as never,
            });
            if (error || !data) {
                setSyncError('Failed to queue activities');
                return;
            }
            const response = data as { queuedCount?: number };
            setSyncedCount(response.queuedCount ?? selectedIds.size);
            setSelectedIds(new Set());
            setActivities([]);
            setNextPageToken(undefined);
            loadActivities();
        } catch {
            setSyncError('Failed to queue activities');
        } finally {
            setSyncing(false);
        }
    };

    const footer = (
        <Stack direction="horizontal" justify="between" align="center">
            <Paragraph inline>
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select activities to sync'}
            </Paragraph>
            <Stack direction="horizontal" gap="sm">
                <Button variant="secondary" onClick={onClose}>Close</Button>
                <Button
                    variant="primary"
                    onClick={handleSync}
                    disabled={selectedIds.size === 0 || syncing}
                >
                    {syncing ? 'Queuing...' : `Sync ${selectedIds.size > 0 ? selectedIds.size : ''} Selected`}
                </Button>
            </Stack>
        </Stack>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title="Import Historical Activities" size="lg" footer={footer}>
            <Stack gap="md">
                {syncedCount !== null && (
                    <Paragraph>
                        {syncedCount} {syncedCount === 1 ? 'activity' : 'activities'} queued for processing.
                    </Paragraph>
                )}

                {syncError && <Paragraph>{syncError}</Paragraph>}

                {providerManifest && (
                    <Stack direction="horizontal" gap="sm" align="center">
                        <PluginIcon icon={providerManifest.icon} iconType={providerManifest.iconType} iconPath={providerManifest.iconPath} size="small" />
                        <Paragraph inline bold>{providerManifest.name}</Paragraph>
                    </Stack>
                )}

                <div className="sync-historical-list">
                    {activities.length === 0 && !loadingPage && (
                        <Paragraph>No activities found.</Paragraph>
                    )}

                    {activities.map(activity => {
                        const id = activity.sourceActivityId ?? '';
                        const checked = selectedIds.has(id);
                        const disabled = activity.alreadySynced ?? false;
                        return (
                            <div
                                key={id}
                                className={`sync-historical-item${disabled ? ' sync-historical-item--synced' : ''}${checked ? ' sync-historical-item--selected' : ''}`}
                                onClick={() => toggleActivity(id, disabled)}
                                role="checkbox"
                                aria-checked={checked}
                                aria-disabled={disabled}
                                tabIndex={disabled ? -1 : 0}
                                onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') toggleActivity(id, disabled); }}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() => toggleActivity(id, disabled)}
                                    onClick={e => e.stopPropagation()}
                                    className="sync-historical-item__checkbox"
                                />
                                <div className="sync-historical-item__info">
                                    <span className="sync-historical-item__title">{activity.title || activity.type || 'Activity'}</span>
                                    <span className="sync-historical-item__meta">
                                        {activity.type && <span>{activity.type}</span>}
                                        <span>{formatDate(activity.startTime)}</span>
                                        {disabled && <span className="sync-historical-item__badge">Already synced</span>}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {loadingPage && <Paragraph>Loading...</Paragraph>}

                    {nextPageToken && !loadingPage && (
                        <Button variant="secondary" onClick={() => loadActivities(nextPageToken)}>
                            Load more
                        </Button>
                    )}
                </div>
            </Stack>
        </Modal>
    );
};

export default SyncHistoricalModal;
