import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Grid } from '../library/layout';
import { Card, Button, Heading, Paragraph, Badge } from '../library/ui';
import { Input, FormField } from '../library/forms';
import { useApi } from '../../hooks/useApi';
import { Counter } from './types';
import { formatDate } from './helpers';

const CountersSection: React.FC = () => {
    const api = useApi();
    const [counters, setCounters] = useState<Counter[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
    const [newCounter, setNewCounter] = useState({ id: '', count: 0 });
    const [showNew, setShowNew] = useState(false);

    const fetchCounters = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/me/counters') as { counters: Counter[] };
            setCounters(response.counters || []);
        } catch (err) {
            console.error('Failed to fetch counters:', err);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchCounters();
    }, [fetchCounters]);

    const handleSave = async (counter: Counter) => {
        try {
            await api.post('/users/me/counters', { id: counter.id, count: counter.count });
            setEditingCounter(null);
            fetchCounters();
        } catch (err) {
            console.error('Failed to save counter:', err);
        }
    };

    const handleCreate = async () => {
        if (!newCounter.id.trim()) return;
        try {
            await api.post('/users/me/counters', newCounter);
            setNewCounter({ id: '', count: 0 });
            setShowNew(false);
            fetchCounters();
        } catch (err) {
            console.error('Failed to create counter:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Delete counter "${id}"?`)) return;
        try {
            await api.delete(`/users/me/counters/${encodeURIComponent(id)}`);
            fetchCounters();
        } catch (err) {
            console.error('Failed to delete counter:', err);
        }
    };

    return (
        <Card>
            <Stack gap="md">
                <Stack direction="horizontal" justify="between" align="center">
                    <Stack direction="horizontal" gap="sm" align="center">
                        <Heading level={3}>🔢 Auto-Increment Counters</Heading>
                        <Badge variant="default">{counters.length}</Badge>
                    </Stack>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setShowNew(!showNew)}
                    >
                        {showNew ? 'Cancel' : '+ Add Counter'}
                    </Button>
                </Stack>

                {showNew && (
                    <Card>
                        <Stack gap="sm">
                            <Heading level={4}>New Counter</Heading>
                            <Grid cols={2} gap="md">
                                <FormField label="Counter ID" htmlFor="new-counter-id">
                                    <Input
                                        id="new-counter-id"
                                        type="text"
                                        placeholder="e.g., parkrun_bushy"
                                        value={newCounter.id}
                                        onChange={(e) => setNewCounter({ ...newCounter, id: e.target.value })}
                                    />
                                </FormField>
                                <FormField label="Initial Count" htmlFor="new-counter-count">
                                    <Input
                                        id="new-counter-count"
                                        type="number"
                                        value={newCounter.count}
                                        onChange={(e) => setNewCounter({ ...newCounter, count: parseInt(e.target.value) || 0 })}
                                    />
                                    <Paragraph size="sm" muted>
                                        This is the last-used value. The next activity will be #{newCounter.count + 1}.
                                    </Paragraph>
                                </FormField>
                            </Grid>
                            <Button variant="primary" onClick={handleCreate} disabled={!newCounter.id.trim()}>
                                Create Counter
                            </Button>
                        </Stack>
                    </Card>
                )}

                {loading ? (
                    <Paragraph muted>Loading counters...</Paragraph>
                ) : counters.length === 0 ? (
                    <Paragraph muted>No counters yet. Add one with the Auto-Increment booster.</Paragraph>
                ) : (
                    <Stack gap="sm">
                        {counters.map((counter) => (
                            <Card key={counter.id} variant="elevated">
                                {editingCounter?.id === counter.id ? (
                                    <Stack direction="horizontal" gap="sm" align="center">
                                        <Input
                                            type="number"
                                            value={editingCounter.count}
                                            onChange={(e) => setEditingCounter({ ...editingCounter, count: parseInt(e.target.value) || 0 })}
                                        />
                                        <Button size="small" variant="primary" onClick={() => handleSave(editingCounter)}>
                                            Save
                                        </Button>
                                        <Button size="small" variant="text" onClick={() => setEditingCounter(null)}>
                                            Cancel
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack direction="horizontal" justify="between" align="center">
                                        <Stack gap="xs">
                                            <Paragraph><strong>{counter.id}</strong></Paragraph>
                                            <Paragraph size="sm" muted>
                                                Last used: #{counter.count} • Next will be: #{counter.count + 1} • Updated: {formatDate(counter.lastUpdated)}
                                            </Paragraph>
                                        </Stack>
                                        <Stack direction="horizontal" gap="xs">
                                            <Button size="small" variant="text" onClick={() => setEditingCounter(counter)}>
                                                Edit
                                            </Button>
                                            <Button size="small" variant="danger" onClick={() => handleDelete(counter.id)}>
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

export default CountersSection;
