import React, { useState } from 'react';
import { Stack, Grid } from '../library/layout';
import { Card, Button, Heading, Paragraph, Badge, AccordionTrigger } from '../library/ui';
import { Input, FormField, Select } from '../library/forms';
import { useApi } from '../../hooks/useApi';
import { BoosterDataEntry } from './types';
import { getBoosterLabel, formatDate } from './helpers';

interface DistanceMilestonesSectionProps {
    entries: BoosterDataEntry[];
    loading: boolean;
    onRefresh: () => void;
}

const DistanceMilestonesSection: React.FC<DistanceMilestonesSectionProps> = ({ entries, loading, onRefresh }) => {
    const api = useApi();
    const [editingBooster, setEditingBooster] = useState<BoosterDataEntry | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSport, setNewSport] = useState('any');
    const [newDistance, setNewDistance] = useState(0);

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
        const id = `distance_milestones_${newSport}`;
        try {
            await api.put(`/users/me/booster-data/${encodeURIComponent(id)}`, {
                lifetime_distance: newDistance,
                last_update: new Date().toISOString(),
            });
            setShowNew(false);
            setNewSport('any');
            setNewDistance(0);
            onRefresh();
        } catch (err) {
            console.error('Failed to create distance milestone:', err);
        }
    };

    return (
        <Card>
            <Stack gap="md">
                <Stack direction="horizontal" justify="between" align="center">
                    <AccordionTrigger isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
                        <Heading level={3}>📊 Distance Milestones</Heading>
                        <Badge variant="default">{loading ? '...' : entries.length}</Badge>
                    </AccordionTrigger>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => { if (!showNew) setIsExpanded(true); setShowNew(!showNew); }}
                    >
                        {showNew ? 'Cancel' : '+ Add Milestone'}
                    </Button>
                </Stack>

                {isExpanded && (
                    <>
                        {showNew && (
                            <Card>
                                <Stack gap="sm">
                                    <Heading level={4}>New Distance Milestone Tracker</Heading>
                                    <Grid cols={2} gap="md">
                                        <FormField label="Sport" htmlFor="new-milestone-sport">
                                            <Select
                                                id="new-milestone-sport"
                                                value={newSport}
                                                onChange={(e) => setNewSport(e.target.value)}
                                                options={[
                                                    { value: 'any', label: 'All Sports' },
                                                    { value: 'running', label: 'Running' },
                                                    { value: 'cycling', label: 'Cycling' },
                                                    { value: 'swimming', label: 'Swimming' },
                                                ]}
                                            />
                                        </FormField>
                                        <FormField label="Lifetime Distance (km)" htmlFor="new-milestone-distance">
                                            <Input
                                                id="new-milestone-distance"
                                                type="number"
                                                step={0.1}
                                                min={0}
                                                value={newDistance}
                                                onChange={(e) => setNewDistance(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormField>
                                    </Grid>
                                    <Button variant="primary" onClick={handleCreate}>
                                        Create Milestone Tracker
                                    </Button>
                                </Stack>
                            </Card>
                        )}

                        {loading ? (
                            <Paragraph muted>Loading distance milestones...</Paragraph>
                        ) : entries.length === 0 ? (
                            <Paragraph muted>No distance milestones yet. Add the Distance Milestones booster to a pipeline to start tracking.</Paragraph>
                        ) : (
                            <Stack gap="sm">
                                {entries.map((entry) => (
                                    <Card key={entry.id} variant="elevated">
                                        {editingBooster?.id === entry.id ? (
                                            <Stack gap="sm">
                                                <Paragraph size="sm" muted>
                                                    Editing: <strong>{getBoosterLabel(entry.id)}</strong>
                                                </Paragraph>
                                                <FormField label="Lifetime Distance (km)" htmlFor={`edit-${entry.id}-distance`}>
                                                    <Input
                                                        id={`edit-${entry.id}-distance`}
                                                        type="number"
                                                        step={0.1}
                                                        min={0}
                                                        value={(editingBooster.data.lifetime_distance as number) ?? 0}
                                                        onChange={(e) => setEditingBooster({
                                                            ...editingBooster,
                                                            data: { ...editingBooster.data, lifetime_distance: parseFloat(e.target.value) || 0 }
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
                                                        Lifetime: {typeof entry.data.lifetime_distance === 'number' ? entry.data.lifetime_distance.toFixed(1) : '0'} km
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

export default DistanceMilestonesSection;
