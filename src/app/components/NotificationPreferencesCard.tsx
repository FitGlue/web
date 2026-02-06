import React, { useState, useEffect, useCallback } from 'react';
import { Card, Heading, Paragraph, useToast } from './library/ui';
import { Stack } from './library/layout';
import { Checkbox } from './library/forms';
import { useApi } from '../hooks/useApi';

interface NotificationPreferences {
    notifyPendingInput: boolean;
    notifyPipelineSuccess: boolean;
    notifyPipelineFailure: boolean;
}

/**
 * NotificationPreferencesCard - Toggle controls for push notification preferences
 */
export const NotificationPreferencesCard: React.FC = () => {
    const api = useApi();
    const toast = useToast();
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        notifyPendingInput: true,
        notifyPipelineSuccess: true,
        notifyPipelineFailure: true,
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // Fetch current preferences on mount
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const data = await api.get('/users/me/notification-preferences');
                setPreferences({
                    notifyPendingInput: data.notifyPendingInput ?? true,
                    notifyPipelineSuccess: data.notifyPipelineSuccess ?? true,
                    notifyPipelineFailure: data.notifyPipelineFailure ?? true,
                });
            } catch (err) {
                console.error('Failed to fetch notification preferences:', err);
                // Use defaults on error
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, [api]);

    const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: boolean) => {
        setUpdating(key);
        const oldValue = preferences[key];

        // Optimistic update
        setPreferences(prev => ({ ...prev, [key]: value }));

        try {
            await api.patch('/users/me/notification-preferences', { [key]: value });
        } catch (err) {
            console.error('Failed to update preference:', err);
            // Revert on error
            setPreferences(prev => ({ ...prev, [key]: oldValue }));
            toast.error('Update Failed', 'Failed to save notification preference');
        } finally {
            setUpdating(null);
        }
    }, [api, preferences, toast]);

    if (loading) {
        return (
            <Card>
                <Stack gap="md">
                    <Heading level={3}>🔔 Notifications</Heading>
                    <Paragraph muted>Loading preferences...</Paragraph>
                </Stack>
            </Card>
        );
    }

    return (
        <Card>
            <Stack gap="md">
                <Heading level={3}>🔔 Notifications</Heading>
                <Paragraph size="sm" muted>
                    Control which push notifications you receive from FitGlue.
                </Paragraph>

                <Stack gap="sm">
                    <PreferenceToggle
                        label="Action Required"
                        description="When a pipeline needs your input (e.g., file upload)"
                        checked={preferences.notifyPendingInput}
                        disabled={updating === 'notifyPendingInput'}
                        onChange={(checked) => updatePreference('notifyPendingInput', checked)}
                    />

                    <PreferenceToggle
                        label="Activity Synced"
                        description="When activities are successfully processed and synced"
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
                </Stack>
            </Stack>
        </Card>
    );
};

// Helper component for consistent toggle styling
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
        <Card variant="elevated">
            <Stack direction="horizontal" justify="between" align="center">
                <Stack gap="xs">
                    <Paragraph bold>{label}</Paragraph>
                    <Paragraph size="sm" muted>{description}</Paragraph>
                </Stack>
                <Checkbox
                    id={id}
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </Stack>
        </Card>
    );
};

export default NotificationPreferencesCard;
