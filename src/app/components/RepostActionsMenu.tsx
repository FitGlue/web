import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SynchronizedActivity, ActivitiesService, RepostResponse } from '../services/ActivitiesService';
import { Destination } from '../../types/pb/events';
import { formatDestination } from '../../types/pb/enum-formatters';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useUser } from '../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE, HOBBYIST_TIER_LIMITS } from '../utils/tier';
import { PluginManifest } from '../types/plugin';
import { Modal, Button, Card, Heading, Paragraph } from './library/ui';
import { Stack } from './library/layout';

interface AvailableDestination {
    key: string;
    name: string;
    icon: string;
    enumValue: Destination;
}

const getAvailableDestinations = (
    registryDestinations: PluginManifest[],
    userIntegrations: Record<string, { connected?: boolean } | undefined> | null
): AvailableDestination[] => {
    const destinations: AvailableDestination[] = [];

    for (const destPlugin of registryDestinations) {
        const hasRequiredIntegrations = !destPlugin.requiredIntegrations?.length ||
            destPlugin.requiredIntegrations.every(integrationId => {
                const integration = userIntegrations?.[integrationId];
                return integration?.connected ?? false;
            });

        if (!hasRequiredIntegrations) continue;

        const enumKey = `DESTINATION_${destPlugin.id.toUpperCase()}`;
        const enumValue = Destination[enumKey as keyof typeof Destination];

        if (typeof enumValue === 'number' && enumValue !== Destination.DESTINATION_UNSPECIFIED) {
            destinations.push({
                key: destPlugin.id,
                name: formatDestination(enumValue),
                icon: destPlugin.icon || '📤',
                enumValue: enumValue,
            });
        }
    }

    return destinations;
};

interface RepostActionsMenuProps {
    activity: SynchronizedActivity;
    onSuccess: () => void;
    isPro?: boolean;
    /** If true, renders buttons inline without a dropdown toggle */
    inline?: boolean;
}

type ModalType = 'missed' | 'retry' | 'full' | null;

export const RepostActionsMenu: React.FC<RepostActionsMenuProps> = ({
    activity,
    onSuccess,
    isPro = true,
    inline = false,
}) => {
    const [isOpen, setIsOpen] = useState(inline); // Start open if inline
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RepostResponse | null>(null);

    const { destinations: registryDestinations } = usePluginRegistry();
    const { integrations: userIntegrations } = useRealtimeIntegrations();
    const { user } = useUser();
    const navigate = useNavigate();

    // Check if hobbyist is at the monthly sync limit
    const isAtLimit = user && getEffectiveTier(user) !== TIER_ATHLETE && (user.syncCountThisMonth || 0) >= HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH;

    const availableDestinations = useMemo(
        () => getAvailableDestinations(
            registryDestinations,
            userIntegrations as Record<string, { connected?: boolean } | undefined> | null
        ),
        [registryDestinations, userIntegrations]
    );

    // Extract the source key from the activity source (e.g., 'SOURCE_HEVY' -> 'hevy')
    // This is used to filter out the source from destination options
    const sourceKey = activity.source
        ? activity.source.replace(/^SOURCE_/, '').toLowerCase()
        : null;

    const syncedDestinations = activity.destinations ? Object.keys(activity.destinations) : [];
    // Normalize to lowercase for comparison
    const syncedDestinationsLower = syncedDestinations.map(k => k.toLowerCase());

    // Filter out destinations that have already been synced AND the source platform
    // (you shouldn't send an activity back to its origin platform)
    const missedDestinations = availableDestinations.filter(
        d => !syncedDestinationsLower.includes(d.key.toLowerCase()) && d.key !== sourceKey
    );

    // Also filter out the source from synced destinations for retry
    // (in case the source was somehow also a destination, don't show it for retry)
    const retryDestinations = syncedDestinations.filter(destKey => destKey.toLowerCase() !== sourceKey);

    const handleAction = async () => {
        if (!modalType) return;

        setLoading(true);
        try {
            let response: RepostResponse;

            if (modalType === 'missed' && selectedDestination) {
                response = await ActivitiesService.repostToMissedDestination(
                    activity.activityId!,
                    selectedDestination
                );
            } else if (modalType === 'retry' && selectedDestination) {
                response = await ActivitiesService.retryDestination(
                    activity.activityId!,
                    selectedDestination
                );
            } else if (modalType === 'full') {
                response = await ActivitiesService.fullPipelineRerun(activity.activityId!);
            } else {
                return;
            }

            setResult(response);
            if (response.success) {
                setTimeout(() => {
                    onSuccess();
                    closeModal();
                }, 2000);
            }
        } catch (error) {
            setResult({ success: false, message: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type: ModalType, destination?: string) => {
        setModalType(type);
        setSelectedDestination(destination || null);
        setResult(null);
        if (!inline) setIsOpen(false);
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedDestination(null);
        setResult(null);
    };

    if (!isPro) {
        return null;
    }

    // Show upgrade prompt if at tier limit
    if (isAtLimit) {
        return (
            <Card>
                <Stack gap="sm" align="center">
                    <Paragraph muted>
                        🔒 Magic actions unavailable - monthly sync limit reached.
                    </Paragraph>
                    <Button variant="primary" size="small" onClick={() => navigate('/settings/subscription')}>
                        Upgrade for Unlimited Actions →
                    </Button>
                </Stack>
            </Card>
        );
    }

    // Inline content - rendered as buttons in a grid/stack
    const actionsContent = (
        <Stack gap="lg">
            {/* Send to Another Destination */}
            {missedDestinations.length > 0 && (
                <Stack gap="sm">
                    <Heading level={5}>📤 Send to another destination</Heading>
                    <Paragraph size="sm" muted>
                        Send this activity to a platform it hasn&apos;t been synced to yet. Uses the existing enrichments.
                    </Paragraph>
                    <Stack direction="horizontal" gap="sm" wrap>
                        {missedDestinations.map(dest => (
                            <Button
                                key={dest.key}
                                variant="secondary"
                                onClick={() => openModal('missed', dest.key)}
                            >
                                <Stack direction="horizontal" gap="sm" align="center">
                                    <Paragraph inline>{dest.icon}</Paragraph>
                                    <Paragraph inline>{dest.name}</Paragraph>
                                </Stack>
                            </Button>
                        ))}
                    </Stack>
                </Stack>
            )}

            {/* Retry Destinations */}
            {retryDestinations.length > 0 && (
                <Stack gap="sm">
                    <Heading level={5}>🔄 Retry destination</Heading>
                    <Paragraph size="sm" muted>
                        Re-send this activity to a platform it&apos;s already synced to. Useful if the previous sync had issues.
                    </Paragraph>
                    <Stack direction="horizontal" gap="sm" wrap>
                        {retryDestinations.map(destKey => {
                            const dest = availableDestinations.find(d => d.key.toLowerCase() === destKey.toLowerCase());
                            return (
                                <Button
                                    key={destKey}
                                    variant="secondary"
                                    onClick={() => openModal('retry', destKey)}
                                >
                                    <Stack direction="horizontal" gap="sm" align="center">
                                        <Paragraph inline>{dest?.icon || '📱'}</Paragraph>
                                        <Paragraph inline>{dest?.name || destKey}</Paragraph>
                                    </Stack>
                                </Button>
                            );
                        })}
                    </Stack>
                </Stack>
            )}

            {/* Full Re-execution */}
            <Stack gap="sm">
                <Heading level={5}>✨ Advanced</Heading>
                <Paragraph size="sm" muted>
                    Re-process through the full pipeline with current boosters. May create duplicates on some platforms.
                </Paragraph>
                <Button
                    variant="secondary"
                    onClick={() => openModal('full')}
                >
                    <Stack direction="horizontal" gap="sm" align="center">
                        <Paragraph inline>🔄</Paragraph>
                        <Paragraph inline>Re-run entire pipeline</Paragraph>
                    </Stack>
                </Button>
            </Stack>
        </Stack>
    );

    return (
        <Stack gap="sm">
            {/* Dropdown Toggle - only when not inline */}
            {!inline && (
                <Button
                    variant="secondary"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                >
                    <Stack direction="horizontal" gap="sm" align="center">
                        <Paragraph inline>⚡</Paragraph>
                        <Paragraph inline>Magic Actions</Paragraph>
                        <Paragraph inline>{isOpen ? '▲' : '▼'}</Paragraph>
                    </Stack>
                </Button>
            )}

            {/* Actions Content */}
            {(inline || isOpen) && (
                inline ? actionsContent : <Card>{actionsContent}</Card>
            )}

            {/* Confirmation Modal */}
            <Modal
                isOpen={!!modalType}
                onClose={closeModal}
                title={
                    modalType === 'missed' ? `📤 Send to ${selectedDestination}` :
                        modalType === 'retry' ? `🔄 Retry ${selectedDestination}` :
                            '✨ Re-run Pipeline'
                }
                size="sm"
                footer={
                    <Stack direction="horizontal" gap="sm" justify="end">
                        <Button
                            variant="secondary"
                            onClick={closeModal}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={modalType === 'full' ? 'danger' : 'primary'}
                            onClick={handleAction}
                            disabled={loading || (result?.success === true)}
                        >
                            {loading ? 'Processing...' : modalType === 'full' ? 'Re-run Pipeline' : 'Confirm'}
                        </Button>
                    </Stack>
                }
            >
                <Stack gap="md">
                    {modalType === 'missed' && (
                        <Paragraph>
                            This will send the activity to {selectedDestination}. The original enrichments will be preserved.
                        </Paragraph>
                    )}

                    {modalType === 'retry' && (
                        <Paragraph>
                            This will re-send the activity to {selectedDestination}.
                            If the activity already exists, it will be updated.
                        </Paragraph>
                    )}

                    {modalType === 'full' && (
                        <Stack gap="sm">
                            <Card variant="elevated">
                                <Paragraph>
                                    ⚠️ <Paragraph inline bold>Warning:</Paragraph> This will re-process the activity through the entire pipeline.
                                    This may create <Paragraph inline bold>duplicate activities</Paragraph> in destination platforms like Strava.
                                </Paragraph>
                            </Card>
                            <Paragraph>
                                Use this only if you need to apply new enrichers or fix processing issues.
                            </Paragraph>
                        </Stack>
                    )}

                    {result && (
                        <Card variant={result.success ? 'elevated' : 'default'}>
                            <Paragraph>
                                {result.success ? '✓' : '✗'} {result.message}
                            </Paragraph>
                        </Card>
                    )}
                </Stack>
            </Modal>
        </Stack>
    );
};
