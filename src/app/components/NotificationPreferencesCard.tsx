import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from './library/ui';
import { Checkbox } from './library/forms';
import { client } from '../../shared/api/client';
import './NotificationPreferencesCard.css';

interface NotificationPreferences {
    notifyPendingInput: boolean;
    notifyPipelineSuccess: boolean;
    notifyPipelineFailure: boolean;
}

/**
 * NotificationPreferencesCard - Toggle controls for push notification preferences
 */
export const NotificationPreferencesCard: React.FC = () => {
    const toast = useToast();
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        notifyPendingInput: true,
        notifyPipelineSuccess: true,
        notifyPipelineFailure: true,
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const { data } = await client.GET('/users/me/notification-prefs');
                setPreferences({
                    notifyPendingInput: data?.notifyPendingInput ?? true,
                    notifyPipelineSuccess: data?.notifyPipelineSuccess ?? true,
                    notifyPipelineFailure: data?.notifyPipelineFailure ?? true,
                });
            } catch (err) {
                console.error('Failed to fetch notification preferences:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);

    const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: boolean) => {
        setUpdating(key);
        const oldValue = preferences[key];
        setPreferences(prev => ({ ...prev, [key]: value }));
        try {
            await client.PUT('/users/me/notification-prefs', { body: { [key]: value } as never });
        } catch (err) {
            console.error('Failed to update preference:', err);
            setPreferences(prev => ({ ...prev, [key]: oldValue }));
            toast.error('Update Failed', 'Failed to save notification preference');
        } finally {
            setUpdating(null);
        }
    }, [preferences, toast]);

    if (loading) {
        return (
            <div className="notification-prefs-card">
                <div className="notification-prefs-card__header">
                    <span className="notification-prefs-card__heading">🔔 Notifications</span>
                </div>
                <div style={{ padding: '0.875rem', fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', color: 'var(--fg-paper-dim)' }}>
                    Loading preferences…
                </div>
            </div>
        );
    }

    return (
        <div className="notification-prefs-card">
            <div className="notification-prefs-card__header">
                <span className="notification-prefs-card__heading">🔔 Notifications</span>
            </div>
            <div className="notification-prefs-card__sub">
                Push notification preferences
            </div>

            <PreferenceToggle
                label="Action Required"
                description="When a pipeline needs your input (e.g., file upload)"
                checked={preferences.notifyPendingInput}
                disabled={updating === 'notifyPendingInput'}
                onChange={(checked) => updatePreference('notifyPendingInput', checked)}
            />

            <PreferenceToggle
                label="Activity Synced"
                description="When activities have finished syncing to all destinations"
                checked={preferences.notifyPipelineSuccess}
                disabled={updating === 'notifyPipelineSuccess'}
                onChange={(checked) => updatePreference('notifyPipelineSuccess', checked)}
            />

            <PreferenceToggle
                label="Pipeline Failures"
                description="When a pipeline fails to process an activity"
                checked={preferences.notifyPipelineFailure}
                disabled={updating === 'notifyPipelineFailure'}
                onChange={(checked) => updatePreference('notifyPipelineFailure', checked)}
            />
        </div>
    );
};

// Helper — toggle row
interface PreferenceToggleProps {
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
    label,
    description,
    checked,
    disabled,
    onChange
}) => {
    const id = `pref-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="notification-prefs-row">
            <div className="notification-prefs-row__info">
                <span className="notification-prefs-row__label">{label}</span>
                <span className="notification-prefs-row__desc">{description}</span>
            </div>
            <Checkbox
                id={id}
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
        </div>
    );
};

export default NotificationPreferencesCard;
