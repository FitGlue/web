import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, Badge } from '../components/library/ui';
import { Input, FormField } from '../components/library/forms';
import { useApi } from '../hooks/useApi';

interface Counter {
    id: string;
    count: number;
    lastUpdated: string;
}

interface PersonalRecord {
    recordType: string;
    value: number;
    unit: string;
    activityId?: string;
    achievedAt?: string;
    activityType?: string;
    previousValue?: number;
    improvement?: number;
}

const EnricherDataPage: React.FC = () => {
    const api = useApi();

    // Counters state
    const [counters, setCounters] = useState<Counter[]>([]);
    const [countersLoading, setCountersLoading] = useState(true);
    const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
    const [newCounter, setNewCounter] = useState({ id: '', count: 0 });
    const [showNewCounter, setShowNewCounter] = useState(false);

    // Personal Records state
    const [records, setRecords] = useState<PersonalRecord[]>([]);
    const [recordsLoading, setRecordsLoading] = useState(true);
    const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
    const [newRecord, setNewRecord] = useState({ recordType: '', value: 0, unit: '' });
    const [showNewRecord, setShowNewRecord] = useState(false);

    // Fetch counters
    const fetchCounters = useCallback(async () => {
        setCountersLoading(true);
        try {
            const response = await api.get('/users/me/counters') as { counters: Counter[] };
            setCounters(response.counters || []);
        } catch (err) {
            console.error('Failed to fetch counters:', err);
        } finally {
            setCountersLoading(false);
        }
    }, [api]);

    // Fetch personal records
    const fetchRecords = useCallback(async () => {
        setRecordsLoading(true);
        try {
            const response = await api.get('/users/me/personal-records') as { records: PersonalRecord[] };
            setRecords(response.records || []);
        } catch (err) {
            console.error('Failed to fetch personal records:', err);
        } finally {
            setRecordsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchCounters();
        fetchRecords();
    }, [fetchCounters, fetchRecords]);

    // Counter handlers
    const handleSaveCounter = async (counter: Counter) => {
        try {
            await api.post('/users/me/counters', { id: counter.id, count: counter.count });
            setEditingCounter(null);
            fetchCounters();
        } catch (err) {
            console.error('Failed to save counter:', err);
        }
    };

    const handleCreateCounter = async () => {
        if (!newCounter.id.trim()) return;
        try {
            await api.post('/users/me/counters', newCounter);
            setNewCounter({ id: '', count: 0 });
            setShowNewCounter(false);
            fetchCounters();
        } catch (err) {
            console.error('Failed to create counter:', err);
        }
    };

    const handleDeleteCounter = async (id: string) => {
        if (!confirm(`Delete counter "${id}"?`)) return;
        try {
            await api.delete(`/users/me/counters/${encodeURIComponent(id)}`);
            fetchCounters();
        } catch (err) {
            console.error('Failed to delete counter:', err);
        }
    };

    // Personal Record handlers
    const handleSaveRecord = async (record: PersonalRecord) => {
        try {
            await api.post('/users/me/personal-records', record);
            setEditingRecord(null);
            fetchRecords();
        } catch (err) {
            console.error('Failed to save personal record:', err);
        }
    };

    const handleCreateRecord = async () => {
        if (!newRecord.recordType.trim() || !newRecord.unit.trim()) return;
        try {
            await api.post('/users/me/personal-records', newRecord);
            setNewRecord({ recordType: '', value: 0, unit: '' });
            setShowNewRecord(false);
            fetchRecords();
        } catch (err) {
            console.error('Failed to create personal record:', err);
        }
    };

    const handleDeleteRecord = async (recordType: string) => {
        if (!confirm(`Delete personal record "${recordType}"?`)) return;
        try {
            await api.delete(`/users/me/personal-records/${encodeURIComponent(recordType)}`);
            fetchRecords();
        } catch (err) {
            console.error('Failed to delete personal record:', err);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <PageLayout
            title="Booster Data"
            backTo="/app/settings"
            backLabel="Settings"
        >
            <Stack gap="lg">
                {/* Info Banner */}
                <Card>
                    <Stack direction="horizontal" gap="sm" align="center">
                        <Paragraph inline>ℹ️</Paragraph>
                        <Paragraph size="sm">
                            This page allows you to view and modify data stored by boosters.
                            <strong> Be careful when editing</strong> — manual changes may cause inconsistencies
                            with your actual activity data.
                        </Paragraph>
                    </Stack>
                </Card>

                {/* Counters Section */}
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
                                onClick={() => setShowNewCounter(!showNewCounter)}
                            >
                                {showNewCounter ? 'Cancel' : '+ Add Counter'}
                            </Button>
                        </Stack>

                        {showNewCounter && (
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
                                        </FormField>
                                    </Grid>
                                    <Button variant="primary" onClick={handleCreateCounter} disabled={!newCounter.id.trim()}>
                                        Create Counter
                                    </Button>
                                </Stack>
                            </Card>
                        )}

                        {countersLoading ? (
                            <Paragraph muted>Loading counters...</Paragraph>
                        ) : counters.length === 0 ? (
                            <Paragraph muted>No counters yet. Add one with the Auto-Increment booster.</Paragraph>
                        ) : (
                            <Stack gap="sm">
                                {counters.map((counter) => (
                                    <div key={counter.id} className="enricher-data-item">
                                        {editingCounter?.id === counter.id ? (
                                            <Stack direction="horizontal" gap="sm" align="center">
                                                <Input
                                                    type="number"
                                                    value={editingCounter.count}
                                                    onChange={(e) => setEditingCounter({ ...editingCounter, count: parseInt(e.target.value) || 0 })}
                                                />
                                                <Button size="small" variant="primary" onClick={() => handleSaveCounter(editingCounter)}>
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
                                                        Count: {counter.count} • Updated: {formatDate(counter.lastUpdated)}
                                                    </Paragraph>
                                                </Stack>
                                                <Stack direction="horizontal" gap="xs">
                                                    <Button size="small" variant="text" onClick={() => setEditingCounter(counter)}>
                                                        Edit
                                                    </Button>
                                                    <Button size="small" variant="danger" onClick={() => handleDeleteCounter(counter.id)}>
                                                        Delete
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        )}
                                    </div>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Card>

                {/* Personal Records Section */}
                <Card>
                    <Stack gap="md">
                        <Stack direction="horizontal" justify="between" align="center">
                            <Stack direction="horizontal" gap="sm" align="center">
                                <Heading level={3}>🏆 Personal Records</Heading>
                                <Badge variant="default">{records.length}</Badge>
                            </Stack>
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setShowNewRecord(!showNewRecord)}
                            >
                                {showNewRecord ? 'Cancel' : '+ Add Record'}
                            </Button>
                        </Stack>

                        {showNewRecord && (
                            <Card>
                                <Stack gap="sm">
                                    <Heading level={4}>New Personal Record</Heading>
                                    <Grid cols={3} gap="md">
                                        <FormField label="Record Type" htmlFor="new-record-type">
                                            <Input
                                                id="new-record-type"
                                                type="text"
                                                placeholder="e.g., fastest_5k"
                                                value={newRecord.recordType}
                                                onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
                                            />
                                        </FormField>
                                        <FormField label="Value" htmlFor="new-record-value">
                                            <Input
                                                id="new-record-value"
                                                type="number"
                                                step="0.01"
                                                value={newRecord.value}
                                                onChange={(e) => setNewRecord({ ...newRecord, value: parseFloat(e.target.value) || 0 })}
                                            />
                                        </FormField>
                                        <FormField label="Unit" htmlFor="new-record-unit">
                                            <Input
                                                id="new-record-unit"
                                                type="text"
                                                placeholder="e.g., seconds, kg"
                                                value={newRecord.unit}
                                                onChange={(e) => setNewRecord({ ...newRecord, unit: e.target.value })}
                                            />
                                        </FormField>
                                    </Grid>
                                    <Button
                                        variant="primary"
                                        onClick={handleCreateRecord}
                                        disabled={!newRecord.recordType.trim() || !newRecord.unit.trim()}
                                    >
                                        Create Record
                                    </Button>
                                </Stack>
                            </Card>
                        )}

                        {recordsLoading ? (
                            <Paragraph muted>Loading personal records...</Paragraph>
                        ) : records.length === 0 ? (
                            <Paragraph muted>No personal records yet. They&apos;re created automatically by PR tracking boosters.</Paragraph>
                        ) : (
                            <Stack gap="sm">
                                {records.map((record) => (
                                    <div key={record.recordType} className="enricher-data-item">
                                        {editingRecord?.recordType === record.recordType ? (
                                            <Stack gap="sm">
                                                <Grid cols={2} gap="md">
                                                    <FormField label="Value" htmlFor={`edit-${record.recordType}-value`}>
                                                        <Input
                                                            id={`edit-${record.recordType}-value`}
                                                            type="number"
                                                            step="0.01"
                                                            value={editingRecord.value}
                                                            onChange={(e) => setEditingRecord({ ...editingRecord, value: parseFloat(e.target.value) || 0 })}
                                                        />
                                                    </FormField>
                                                    <FormField label="Unit" htmlFor={`edit-${record.recordType}-unit`}>
                                                        <Input
                                                            id={`edit-${record.recordType}-unit`}
                                                            type="text"
                                                            value={editingRecord.unit}
                                                            onChange={(e) => setEditingRecord({ ...editingRecord, unit: e.target.value })}
                                                        />
                                                    </FormField>
                                                </Grid>
                                                <Stack direction="horizontal" gap="sm">
                                                    <Button size="small" variant="primary" onClick={() => handleSaveRecord(editingRecord)}>
                                                        Save
                                                    </Button>
                                                    <Button size="small" variant="text" onClick={() => setEditingRecord(null)}>
                                                        Cancel
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        ) : (
                                            <Stack direction="horizontal" justify="between" align="center">
                                                <Stack gap="xs">
                                                    <Paragraph><strong>{record.recordType}</strong></Paragraph>
                                                    <Paragraph size="sm" muted>
                                                        {record.value} {record.unit}
                                                        {record.achievedAt && ` • Achieved: ${formatDate(record.achievedAt)}`}
                                                        {record.improvement && ` • Improvement: ${record.improvement.toFixed(1)}%`}
                                                    </Paragraph>
                                                </Stack>
                                                <Stack direction="horizontal" gap="xs">
                                                    <Button size="small" variant="text" onClick={() => setEditingRecord(record)}>
                                                        Edit
                                                    </Button>
                                                    <Button size="small" variant="danger" onClick={() => handleDeleteRecord(record.recordType)}>
                                                        Delete
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        )}
                                    </div>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Card>
            </Stack>
        </PageLayout>
    );
};

export default EnricherDataPage;
