import React, { useState } from 'react';
import { Stack, Grid } from '../library/layout';
import { Card, Button, Heading, Paragraph, Badge } from '../library/ui';
import { Input, FormField, Select } from '../library/forms';
import { useApi } from '../../hooks/useApi';
import { BoosterDataEntry } from './types';
import { getBoosterLabel, formatDate } from './helpers';

interface GoalTrackersSectionProps {
    entries: BoosterDataEntry[];
    loading: boolean;
    onRefresh: () => void;
}

const GoalTrackersSection: React.FC<GoalTrackersSectionProps> = ({ entries, loading, onRefresh }) => {
    const api = useApi();
    const [editingBooster, setEditingBooster] = useState<BoosterDataEntry | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [newPeriod, setNewPeriod] = useState('month');
    const [newMetric, setNewMetric] = useState('distance');
    const [newAccumulated, setNewAccumulated] = useState(0);

    const handleSave = async (entry: BoosterDataEntry) => {
        try {
            await api.post(`/users/me/booster-data/${encodeURIComponent(entry.id)}`, entry.data);
            setEditingBooster(null);
            onRefresh();
        } catch (err) {
            console.error('Failed to save booster data:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Delete booster data "${id}"? This will reset this booster's progress.`)) return;
        try {
            await api.delete(`/users/me/booster-data/${encodeURIComponent(id)}`);
            onRefresh();
        } catch (err) {
            console.error('Failed to delete booster data:', err);
        }
    };

    const handleCreate = async () => {
        const id = `goal_tracker_${newPeriod}_${newMetric}`;
        try {
            await api.post(`/users/me/booster-data/${encodeURIComponent(id)}`, {
                accumulated: newAccumulated,
                period_key: '',
                last_update: new Date().toISOString(),
            });
            setShowNew(false);
            setNewPeriod('month');
            setNewMetric('distance');
            setNewAccumulated(0);
            onRefresh();
        } catch (err) {
            console.error('Failed to create goal tracker:', err);
        }
    };

    return (
        <Card>
            <Stack gap="md">
                <Stack direction="horizontal" justify="between" align="center">
                    <Stack direction="horizontal" gap="sm" align="center">
                        <Heading level={3}>🎯 Goal Trackers</Heading>
                        <Badge variant="default">{entries.length}</Badge>
                    </Stack>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setShowNew(!showNew)}
                    >
                        {showNew ? 'Cancel' : '+ Add Goal'}
                    </Button>
                </Stack>

                {showNew && (
                    <Card>
                        <Stack gap="sm">
                            <Heading level={4}>New Goal Tracker</Heading>
                            <Grid cols={3} gap="md">
                                <FormField label="Period" htmlFor="new-goal-period">
                                    <Select
                                        id="new-goal-period"
                                        value={newPeriod}
                                        onChange={(e) => setNewPeriod(e.target.value)}
                                        options={[
                                            { value: 'week', label: 'Weekly' },
                                            { value: 'month', label: 'Monthly' },
                                            { value: 'year', label: 'Yearly' },
                                        ]}
                                    />
                                </FormField>
                                <FormField label="Metric" htmlFor="new-goal-metric">
                                    <Select
                                        id="new-goal-metric"
                                        value={newMetric}
                                        onChange={(e) => setNewMetric(e.target.value)}
                                        options={[
                                            { value: 'distance', label: 'Distance (km)' },
                                            { value: 'duration', label: 'Duration (hours)' },
                                            { value: 'activities', label: 'Activities (count)' },
                                            { value: 'elevation', label: 'Elevation (m)' },
                                        ]}
                                    />
                                </FormField>
                                <FormField label="Initial Progress" htmlFor="new-goal-accumulated">
                                    <Input
                                        id="new-goal-accumulated"
                                        type="number"
                                        step={0.1}
                                        min={0}
                                        value={newAccumulated}
                                        onChange={(e) => setNewAccumulated(parseFloat(e.target.value) || 0)}
                                    />
                                </FormField>
                            </Grid>
                            <Button variant="primary" onClick={handleCreate}>
                                Create Goal Tracker
                            </Button>
                        </Stack>
                    </Card>
                )}

                {loading ? (
                    <Paragraph muted>Loading goal trackers...</Paragraph>
                ) : entries.length === 0 ? (
                    <Paragraph muted>No goal trackers yet. Add the Goal Tracker booster to a pipeline to start tracking.</Paragraph>
                ) : (
                    <Stack gap="sm">
                        {entries.map((entry) => (
                            <Card key={entry.id} variant="elevated">
                                {editingBooster?.id === entry.id ? (
                                    <Stack gap="sm">
                                        <Paragraph size="sm" muted>
                                            Editing: <strong>{getBoosterLabel(entry.id)}</strong>
                                        </Paragraph>
                                        <FormField label="Accumulated Progress" htmlFor={`edit-${entry.id}-accumulated`}>
                                            <Input
                                                id={`edit-${entry.id}-accumulated`}
                                                type="number"
                                                step={0.1}
                                                min={0}
                                                value={(editingBooster.data.accumulated as number) ?? 0}
                                                onChange={(e) => setEditingBooster({
                                                    ...editingBooster,
                                                    data: { ...editingBooster.data, accumulated: parseFloat(e.target.value) || 0 }
                                                })}
                                                style={{ maxWidth: '150px' }}
                                            />
                                        </FormField>
                                        <Stack direction="horizontal" gap="sm">
                                            <Button size="small" variant="primary" onClick={() => handleSave(editingBooster)}>
                                                Save
                                            </Button>
                                            <Button size="small" variant="text" onClick={() => setEditingBooster(null)}>
                                                Cancel
                                            </Button>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Stack direction="horizontal" justify="between" align="center">
                                        <Stack gap="xs">
                                            <Paragraph><strong>{getBoosterLabel(entry.id)}</strong></Paragraph>
                                            <Paragraph size="sm" muted>
                                                Progress: {typeof entry.data.accumulated === 'number' ? entry.data.accumulated.toFixed(1) : '0'}
                                                {entry.data.period_key ? ` • Period: ${entry.data.period_key}` : ''}
                                                {entry.data.last_update ? ` • Updated: ${formatDate(entry.data.last_update as string)}` : ''}
                                            </Paragraph>
                                        </Stack>
                                        <Stack direction="horizontal" gap="xs">
                                            <Button size="small" variant="text" onClick={() => setEditingBooster(entry)}>
                                                Edit
                                            </Button>
                                            <Button size="small" variant="danger" onClick={() => handleDelete(entry.id)}>
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Stack>
                                )}
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Card>
    );
};

export default GoalTrackersSection;
