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
type ListActivitiesResponse = components['schemas']['ListSourceActivitiesGatewayResponse'];
type BackfillResponse = components['schemas']['BackfillActivitiesGatewayResponse'];

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
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [hideAlreadySynced, setHideAlreadySynced] = useState(false);

    const loadActivities = useCallback(async (pageToken?: string) => {
        setLoadingPage(true);
        setSyncError(null);
        try {
            const { data, error } = await client.GET('/users/me/connections/{provider}/activities', {
                params: {
                    path: { provider },
                    query: pageToken ? { pageToken } : {},
                },
            });
            if (error || !data) {
                setSyncError('Failed to load activities');
                return;
            }
            const response = data as ListActivitiesResponse;
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
            const response = data as BackfillResponse;
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

    const visibleActivities = activities.filter(a => {
        if (hideAlreadySynced && a.alreadySynced) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!((a.title ?? '').toLowerCase().includes(q) || (a.type ?? '').toLowerCase().includes(q))) return false;
        }
        if (dateFrom && a.startTime && a.startTime < dateFrom) return false;
        if (dateTo && a.startTime && a.startTime > dateTo + 'T23:59:59Z') return false;
        return true;
    });

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

                <div className="sync-historical-filters">
                    <input
                        className="sync-historical-filters__search"
                        type="search"
                        placeholder="Search by name or type…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <div className="sync-historical-filters__dates">
                        <input
                            className="sync-historical-filters__date"
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            title="From date"
                        />
                        <span className="sync-historical-filters__date-sep">—</span>
                        <input
                            className="sync-historical-filters__date"
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            title="To date"
                        />
                    </div>
                    <label className="sync-historical-filters__toggle">
                        <input
                            type="checkbox"
                            checked={hideAlreadySynced}
                            onChange={e => setHideAlreadySynced(e.target.checked)}
                        />
                        Hide synced
                    </label>
                </div>

                <div className="sync-historical-list">
                    {visibleActivities.length === 0 && !loadingPage && (
                        <Paragraph>{activities.length === 0 ? 'No activities found.' : 'No activities match your filters.'}</Paragraph>
                    )}

                    {visibleActivities.map(activity => {
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
