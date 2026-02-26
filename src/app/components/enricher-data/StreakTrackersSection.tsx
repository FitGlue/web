import React, { useState } from 'react';
import { Stack, Grid } from '../library/layout';
import { Card, Button, Heading, Paragraph, Badge, AccordionTrigger } from '../library/ui';
import { Input, FormField, Select } from '../library/forms';
import { useApi } from '../../hooks/useApi';
import { BoosterDataEntry } from './types';
import { getBoosterLabel, formatDate } from './helpers';

interface StreakTrackersSectionProps {
    entries: BoosterDataEntry[];
    loading: boolean;
    onRefresh: () => void;
}

const StreakTrackersSection: React.FC<StreakTrackersSectionProps> = ({ entries, loading, onRefresh }) => {
    const api = useApi();
    const [editingBooster, setEditingBooster] = useState<BoosterDataEntry | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newActivityTypes, setNewActivityTypes] = useState('any');
    const [newCurrent, setNewCurrent] = useState(0);
    const [newLongest, setNewLongest] = useState(0);

    const handleSave = async (entry: BoosterDataEntry) => {
        try {
            await api.put(`/users/me/booster-data/${encodeURIComponent(entry.id)}`, entry.data);
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
        const id = `streak_tracker_${newActivityTypes}`;
        try {
            await api.put(`/users/me/booster-data/${encodeURIComponent(id)}`, {
                current_streak: newCurrent,
                longest_streak: newLongest,
                last_activity_date: '',
                last_update: new Date().toISOString(),
            });
            setShowNew(false);
            setNewActivityTypes('any');
            setNewCurrent(0);
            setNewLongest(0);
            onRefresh();
        } catch (err) {
            console.error('Failed to create streak tracker:', err);
        }
    };

    return (
        <Card>
            <Stack gap="md">
                <Stack direction="horizontal" justify="between" align="center">
                    <AccordionTrigger isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
                        <Heading level={3}>🔥 Streak Trackers</Heading>
                        <Badge variant="default">{loading ? '...' : entries.length}</Badge>
                    </AccordionTrigger>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => { if (!showNew) setIsExpanded(true); setShowNew(!showNew); }}
                    >
                        {showNew ? 'Cancel' : '+ Add Streak'}
                    </Button>
                </Stack>

                {isExpanded && (
                    <>
                        {showNew && (
                            <Card>
                                <Stack gap="sm">
                                    <Heading level={4}>New Streak Tracker</Heading>
                                    <Grid cols={3} gap="md">
                                        <FormField label="Activity Type" htmlFor="new-streak-type">
                                            <Select
                                                id="new-streak-type"
                                                value={newActivityTypes}
                                                onChange={(e) => setNewActivityTypes(e.target.value)}
                                                options={[
                                                    { value: 'any', label: 'Any Activity' },
                                                    { value: 'running', label: 'Running' },
                                                    { value: 'cycling', label: 'Cycling' },
                                                    { value: 'swimming', label: 'Swimming' },
                                                    { value: 'strength', label: 'Strength Training' },
                                                ]}
                                            />
                                        </FormField>
                                        <FormField label="Current Streak" htmlFor="new-streak-current">
                                            <Input
                                                id="new-streak-current"
                                                type="number"
                                                min={0}
                                                value={newCurrent}
                                                onChange={(e) => setNewCurrent(parseInt(e.target.value) || 0)}
                                            />
                                        </FormField>
                                        <FormField label="Longest Streak" htmlFor="new-streak-longest">
                                            <Input
                                                id="new-streak-longest"
                                                type="number"
                                                min={0}
                                                value={newLongest}
                                                onChange={(e) => setNewLongest(parseInt(e.target.value) || 0)}
                                            />
                                        </FormField>
                                    </Grid>
                                    <Button variant="primary" onClick={handleCreate}>
                                        Create Streak Tracker
                                    </Button>
                                </Stack>
                            </Card>
                        )}

                        {loading ? (
                            <Paragraph muted>Loading streak trackers...</Paragraph>
                        ) : entries.length === 0 ? (
                            <Paragraph muted>No streak trackers yet. Add the Streak Tracker booster to a pipeline to start tracking.</Paragraph>
                        ) : (
                            <Stack gap="sm">
                                {entries.map((entry) => (
                                    <Card key={entry.id} variant="elevated">
                                        {editingBooster?.id === entry.id ? (
                                            <Stack gap="sm">
                                                <Paragraph size="sm" muted>
                                                    Editing: <strong>{getBoosterLabel(entry.id)}</strong>
                                                </Paragraph>
                                                <Grid cols={2} gap="md">
                                                    <FormField label="Current Streak" htmlFor={`edit-${entry.id}-current`}>
                                                        <Input
                                                            id={`edit-${entry.id}-current`}
                                                            type="number"
                                                            min={0}
                                                            value={(editingBooster.data.current_streak as number) ?? 0}
                                                            onChange={(e) => setEditingBooster({
                                                                ...editingBooster,
                                                                data: { ...editingBooster.data, current_streak: parseInt(e.target.value) || 0 }
                                                            })}
                                                        />
                                                    </FormField>
                                                    <FormField label="Longest Streak" htmlFor={`edit-${entry.id}-longest`}>
                                                        <Input
                                                            id={`edit-${entry.id}-longest`}
                                                            type="number"
                                                            min={0}
                                                            value={(editingBooster.data.longest_streak as number) ?? 0}
                                                            onChange={(e) => setEditingBooster({
                                                                ...editingBooster,
                                                                data: { ...editingBooster.data, longest_streak: parseInt(e.target.value) || 0 }
                                                            })}
                                                        />
                                                    </FormField>
                                                </Grid>
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
                                                        Current: {entry.data.current_streak as number ?? 0} days
                                                        {' • '}Best: {entry.data.longest_streak as number ?? 0} days
                                                        {entry.data.last_activity_date ? ` • Last: ${entry.data.last_activity_date}` : ''}
                                                        {entry.data.last_update ? ` • Updated: ${formatDate(entry.data.last_update as string)}` : ''}
                                                    </Paragraph>
                                                    {typeof entry.data.last_external_id === 'string' && entry.data.last_external_id && (
                                                        <Paragraph size="sm" muted>
                                                            Last source activity: {entry.data.last_external_id}
                                                        </Paragraph>
                                                    )}
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
                    </>
                )}
            </Stack>
        </Card>
    );
};

export default StreakTrackersSection;
