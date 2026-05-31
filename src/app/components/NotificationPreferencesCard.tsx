import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from './library/ui';
import { SettingsSection } from './library/layout/SettingsSection';
import { LoadingState } from './library/ui/LoadingState';
import { client } from '../../shared/api/client';
import type { components } from '../../shared/api/schema-client';
import './NotificationPreferencesCard.css';

type NotificationTypePreference = components['schemas']['NotificationTypePreference'];
type NotificationPreferences = components['schemas']['NotificationPreferences'];

const PUSH = 'NOTIFICATION_CHANNEL_PUSH';

const NOTIFICATION_TYPES = [
    { key: 'pendingInput',    label: 'Action Required',     description: 'When a pipeline needs your input' },
    { key: 'pipelineSuccess', label: 'Activity Synced',     description: 'When activities finish syncing to all destinations' },
    { key: 'pipelineFailure', label: 'Pipeline Failures',   description: 'When a pipeline fails to process an activity' },
    { key: 'connectionAction',label: 'Connection Issues',   description: 'When a destination needs to be re-authorised' },
    { key: 'showcaseRoundup', label: 'Showcase Roundup',    description: 'Weekly/monthly training summary' },
] as const;

type NotificationTypeKey = typeof NOTIFICATION_TYPES[number]['key'];

function hasChannel(pref: NotificationTypePreference | undefined, channel: string): boolean {
    return pref?.channels?.includes(channel as never) ?? true; // default: push enabled
}

function toggleChannel(pref: NotificationTypePreference | undefined, channel: string, enabled: boolean): NotificationTypePreference {
    const current = pref?.channels ?? [PUSH];
    const next = enabled
        ? [...new Set([...current, channel])]
        : current.filter(c => c !== channel);
    return { channels: next as never[] };
}

export const NotificationPreferencesCard: React.FC = () => {
    const toast = useToast();
    const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        client.GET('/users/me/notification-prefs')
            .then(({ data }) => setPrefs(data ?? {}))
            .catch(err => console.error('Failed to fetch notification preferences:', err))
            .finally(() => setLoading(false));
    }, []);

    const updateChannel = useCallback(async (
        typeKey: NotificationTypeKey,
        channel: string,
        enabled: boolean,
    ) => {
        const updateKey = `${typeKey}.${channel}`;
        setUpdating(updateKey);

        const updated: NotificationTypePreference = toggleChannel(
            prefs?.[typeKey],
            channel,
            enabled,
        );

        const optimistic = { ...prefs, [typeKey]: updated };
        setPrefs(optimistic);

        try {
            await client.PUT('/users/me/notification-prefs', {
                body: { [typeKey]: updated } as never,
            });
        } catch (err) {
            console.error('Failed to update preference:', err);
            setPrefs(prefs); // rollback
            toast.error('Update Failed', 'Failed to save notification preference');
        } finally {
            setUpdating(null);
        }
    }, [prefs, toast]);

    if (loading) {
        return (
            <SettingsSection title="🔔 Notifications">
                <LoadingState message="Loading preferences…" />
            </SettingsSection>
        );
    }

    return (
        <SettingsSection title="🔔 Notifications" description="Choose how you'd like to be notified for each event type">
            {/* Column headers */}
            <div className="notif-matrix-cols">
                <div className="notif-matrix-cols__spacer" />
                <div className="notif-matrix-cols__label">Push</div>
                <div className="notif-matrix-cols__label notif-matrix-cols__label--disabled">Email</div>
            </div>

            {NOTIFICATION_TYPES.map(({ key, label, description }) => {
                const pref = prefs?.[key];
                const pushEnabled = hasChannel(pref, PUSH);
                const pushUpdating = updating === `${key}.${PUSH}`;

                return (
                    <div key={key} className="notif-matrix-row">
                        <div className="notif-matrix-row__info">
                            <div className="notif-matrix-row__label">{label}</div>
                            <div className="notif-matrix-row__desc">{description}</div>
                        </div>
                        <div className="notif-matrix-row__cell">
                            <input
                                type="checkbox"
                                checked={pushEnabled}
                                disabled={pushUpdating}
                                onChange={e => updateChannel(key, PUSH, e.target.checked)}
                                aria-label={`${label} push notifications`}
                            />
                        </div>
                        <div className="notif-matrix-row__cell notif-matrix-row__cell--disabled">
                            <input
                                type="checkbox"
                                checked={false}
                                disabled
                                title="Email notifications coming soon"
                                aria-label={`${label} email notifications (coming soon)`}
                            />
                        </div>
                    </div>
                );
            })}
        </SettingsSection>
    );
};

export default NotificationPreferencesCard;
