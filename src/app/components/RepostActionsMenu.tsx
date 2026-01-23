import React, { useState, useMemo, useEffect } from 'react';
import { SynchronizedActivity, ActivitiesService, RepostResponse } from '../services/ActivitiesService';
import { Destination } from '../../types/pb/events';
import { formatDestination } from '../../types/pb/enum-formatters';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useIntegrations } from '../hooks/useIntegrations';
import { PluginManifest } from '../types/plugin';
import './RepostActionsMenu.css';

interface AvailableDestination {
    key: string;
    name: string;
    icon: string;
    enumValue: Destination;
}

// Generate available destinations from registry plugins
// Only includes destinations where user has the required integration connected
const getAvailableDestinations = (
    registryDestinations: PluginManifest[],
    userIntegrations: Record<string, { connected?: boolean } | undefined> | null
): AvailableDestination[] => {
    const destinations: AvailableDestination[] = [];

    // Use registry destinations instead of enum iteration
    // Registry already filters out isTemporarilyUnavailable plugins
    for (const destPlugin of registryDestinations) {
        // Check if user has the required integrations connected
        const hasRequiredIntegrations = !destPlugin.requiredIntegrations?.length ||
            destPlugin.requiredIntegrations.every(integrationId => {
                const integration = userIntegrations?.[integrationId];
                return integration?.connected ?? false;
            });

        if (!hasRequiredIntegrations) continue;

        // Find the matching enum value
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
}

type ModalType = 'missed' | 'retry' | 'full' | null;

export const RepostActionsMenu: React.FC<RepostActionsMenuProps> = ({
    activity,
    onSuccess,
    isPro = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RepostResponse | null>(null);

    // Get registry destinations for icon lookup and filtering
    const { destinations: registryDestinations } = usePluginRegistry();
    // Get user's connected integrations to filter available destinations
    const { integrations: userIntegrations, fetchIfNeeded: fetchIntegrations } = useIntegrations();

    // Fetch user integrations on mount
    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    // Compute available destinations from registry (memoized)
    // Only includes destinations where user has the required integration connected
    const availableDestinations = useMemo(
        () => getAvailableDestinations(
            registryDestinations,
            userIntegrations as Record<string, { connected?: boolean } | undefined> | null
        ),
        [registryDestinations, userIntegrations]
    );

    // Get destinations that are already synced
    const syncedDestinations = activity.destinations ? Object.keys(activity.destinations) : [];

    // Get available destinations (not yet synced)
    const missedDestinations = availableDestinations.filter(
        d => !syncedDestinations.includes(d.key)
    );

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
        setIsOpen(false);
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedDestination(null);
        setResult(null);
    };

    if (!isPro) {
        return null;
    }

    return (
        <div className="repost-actions">
            {/* Dropdown Toggle */}
            <button
                className="repost-actions__toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="repost-actions__toggle-icon">⚡</span>
                <span className="repost-actions__toggle-label">Magic Actions</span>
                <span className="repost-actions__toggle-chevron">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="repost-actions__menu">
                    {/* Missed Destination */}
                    {missedDestinations.length > 0 && (
                        <div className="repost-actions__section">
                            <div className="repost-actions__section-header">
                                📤 Send to another destination
                            </div>
                            {missedDestinations.map(dest => (
                                <button
                                    key={dest.key}
                                    className="repost-actions__item"
                                    onClick={() => openModal('missed', dest.key)}
                                >
                                    <span className="repost-actions__item-icon">{dest.icon}</span>
                                    <span className="repost-actions__item-label">Send to {dest.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Retry Destination */}
                    {syncedDestinations.length > 0 && (
                        <div className="repost-actions__section">
                            <div className="repost-actions__section-header">
                                🔄 Retry destination
                            </div>
                            {syncedDestinations.map(destKey => {
                                const dest = availableDestinations.find(d => d.key === destKey);
                                return (
                                    <button
                                        key={destKey}
                                        className="repost-actions__item"
                                        onClick={() => openModal('retry', destKey)}
                                    >
                                        <span className="repost-actions__item-icon">{dest?.icon || '📱'}</span>
                                        <span className="repost-actions__item-label">Retry {dest?.name || destKey}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Full Re-execution */}
                    <div className="repost-actions__section repost-actions__section--danger">
                        <button
                            className="repost-actions__item repost-actions__item--danger"
                            onClick={() => openModal('full')}
                        >
                            <span className="repost-actions__item-icon">✨</span>
                            <span className="repost-actions__item-label">Re-run entire pipeline</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {modalType && (
                <div className="repost-modal-overlay" onClick={closeModal}>
                    <div className="repost-modal" onClick={e => e.stopPropagation()}>
                        <button className="repost-modal__close" onClick={closeModal}>×</button>

                        {modalType === 'missed' && (
                            <>
                                <h3 className="repost-modal__title">📤 Send to {selectedDestination}</h3>
                                <p className="repost-modal__description">
                                    This will send the activity to {selectedDestination}. The original enrichments will be preserved.
                                </p>
                            </>
                        )}

                        {modalType === 'retry' && (
                            <>
                                <h3 className="repost-modal__title">🔄 Retry {selectedDestination}</h3>
                                <p className="repost-modal__description">
                                    This will re-send the activity to {selectedDestination}.
                                    If the activity already exists, it will be updated.
                                </p>
                            </>
                        )}

                        {modalType === 'full' && (
                            <>
                                <h3 className="repost-modal__title">✨ Re-run Pipeline</h3>
                                <div className="repost-modal__warning">
                                    ⚠️ <strong>Warning:</strong> This will re-process the activity through the entire pipeline.
                                    This may create <strong>duplicate activities</strong> in destination platforms like Strava.
                                </div>
                                <p className="repost-modal__description">
                                    Use this only if you need to apply new enrichers or fix processing issues.
                                </p>
                            </>
                        )}

                        {result && (
                            <div className={`repost-modal__result ${result.success ? 'repost-modal__result--success' : 'repost-modal__result--error'}`}>
                                {result.success ? '✓' : '✗'} {result.message}
                            </div>
                        )}

                        <div className="repost-modal__actions">
                            <button
                                className="repost-modal__btn repost-modal__btn--secondary"
                                onClick={closeModal}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className={`repost-modal__btn repost-modal__btn--primary ${modalType === 'full' ? 'repost-modal__btn--danger' : ''}`}
                                onClick={handleAction}
                                disabled={loading || (result?.success === true)}
                            >
                                {loading ? 'Processing...' : modalType === 'full' ? 'Re-run Pipeline' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
