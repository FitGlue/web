import React, { useState, useEffect, useCallback } from 'react';
import './SyncHistoricalModal.css';
import { Modal } from './library/ui/Modal';
import { Button } from './library/ui/Button';
import { Stack } from './library/layout/Stack';
import { Heading } from './library/ui/Heading';
import { Paragraph } from './library/ui/Paragraph';
import { TabButton } from './library/ui/TabButton';
import { PluginIcon } from './library/ui/PluginIcon';
import { client } from '../../shared/api/client';
import { components } from '../../shared/api/schema-client';
import { PluginManifest } from '../types/plugin';

type SourceActivityItem = components['schemas']['SourceActivityItemGateway'];

const SUPPORTED_SOURCE_IDS = ['hevy', 'strava', 'fitbit', 'intervals'] as const;
type SupportedSourceId = typeof SUPPORTED_SOURCE_IDS[number];

const SOURCE_PROTO_ID: Record<SupportedSourceId, string> = {
    hevy: 'SOURCE_HEVY',
    strava: 'SOURCE_STRAVA',
    fitbit: 'SOURCE_FITBIT',
    intervals: 'SOURCE_INTERVALS',
};

interface Props {
    pipelineId: string;
    selectedSources: string[];
    sourceManifests: PluginManifest[];
    onClose: () => void;
}

function formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export const SyncHistoricalModal: React.FC<Props> = ({
    pipelineId,
    selectedSources,
    sourceManifests,
    onClose,
}) => {
    const supportedSources = selectedSources.filter((s): s is SupportedSourceId =>
        SUPPORTED_SOURCE_IDS.includes(s as SupportedSourceId)
    );

    const [activeSource, setActiveSource] = useState<SupportedSourceId>(supportedSources[0]);
    const [activities, setActivities] = useState<SourceActivityItem[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
    const [loadingPage, setLoadingPage] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncedCount, setSyncedCount] = useState<number | null>(null);

    const loadActivities = useCallback(async (source: SupportedSourceId, pageToken?: string) => {
        setLoadingPage(true);
        setSyncError(null);
        try {
            const { data, error } = await client.GET('/users/me/pipelines/{id}/source-activities', {
                params: {
                    path: { id: pipelineId },
                    query: {
                        source: SOURCE_PROTO_ID[source],
                        ...(pageToken ? { page_token: pageToken } : {}),
                    },
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
    }, [pipelineId]);

    useEffect(() => {
        setActivities([]);
        setNextPageToken(undefined);
        setSelectedIds(new Set());
        setSyncError(null);
        setSyncedCount(null);
        loadActivities(activeSource);
    }, [activeSource, loadActivities]);

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
            const { data, error } = await client.POST('/users/me/pipelines/{id}/backfill', {
                params: { path: { id: pipelineId } },
                body: {
                    source: SOURCE_PROTO_ID[activeSource],
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
            // Refresh to show updated already_synced flags
            setActivities([]);
            setNextPageToken(undefined);
            loadActivities(activeSource);
        } catch {
            setSyncError('Failed to queue activities');
        } finally {
            setSyncing(false);
        }
    };

    const sourceManifest = (id: SupportedSourceId) =>
        sourceManifests.find(m => m.id === id);

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
        <Modal isOpen={true} onClose={onClose} title="Sync Historical Activities" size="lg" footer={footer}>
            <Stack gap="md">
                {syncedCount !== null && (
                    <Paragraph>
                        {syncedCount} {syncedCount === 1 ? 'activity' : 'activities'} queued for processing.
                    </Paragraph>
                )}

                {syncError && <Paragraph>{syncError}</Paragraph>}

                {supportedSources.length > 1 && (
                    <Stack direction="horizontal" gap="xs">
                        {supportedSources.map(srcId => {
                            const manifest = sourceManifest(srcId);
                            return (
                                <TabButton
                                    key={srcId}
                                    label={manifest?.name ?? srcId}
                                    active={activeSource === srcId}
                                    onClick={() => setActiveSource(srcId)}
                                    icon={manifest?.icon}
                                />
                            );
                        })}
                    </Stack>
                )}

                {supportedSources.length === 1 && (
                    <Stack direction="horizontal" gap="sm" align="center">
                        {(() => {
                            const manifest = sourceManifest(activeSource);
                            return manifest ? (
                                <PluginIcon icon={manifest.icon} iconType={manifest.iconType} iconPath={manifest.iconPath} size="small" />
                            ) : null;
                        })()}
                        <Heading level={3}>{sourceManifest(activeSource)?.name ?? activeSource}</Heading>
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
                        <Button variant="secondary" onClick={() => loadActivities(activeSource, nextPageToken)}>
                            Load more
                        </Button>
                    )}
                </div>
            </Stack>
        </Modal>
    );
};

export default SyncHistoricalModal;
