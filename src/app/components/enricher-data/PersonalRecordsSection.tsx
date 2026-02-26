import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Stack, Grid } from '../library/layout';
import { Card, Button, Heading, Paragraph, Badge, AccordionTrigger } from '../library/ui';
import { Input, FormField, Select } from '../library/forms';
import { useApi } from '../../hooks/useApi';
import { PersonalRecord } from './types';
import { CARDIO_RECORDS, STRENGTH_SUFFIXES, HYBRID_RACE_TYPES, HYBRID_STATIONS } from './constants';
import { RecordCategory, formatDate, formatRecordValue, getRecordDisplayName, getGroupedExercises } from './helpers';
import DurationInput from './DurationInput';

const PersonalRecordsSection: React.FC = () => {
    const api = useApi();
    const [records, setRecords] = useState<PersonalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // New record form state
    const [newRecordCategory, setNewRecordCategory] = useState<RecordCategory | ''>('');
    const [newCardioType, setNewCardioType] = useState('');
    const [newStrengthExercise, setNewStrengthExercise] = useState('');
    const [newStrengthSuffix, setNewStrengthSuffix] = useState('');
    const [newHybridRace, setNewHybridRace] = useState('');
    const [newHybridStation, setNewHybridStation] = useState('');
    const [newRecordValue, setNewRecordValue] = useState(0);

    const newRecordType = useMemo(() => {
        switch (newRecordCategory) {
            case 'cardio':
                return newCardioType;
            case 'strength':
                return newStrengthExercise && newStrengthSuffix
                    ? `${newStrengthExercise}${newStrengthSuffix}`
                    : '';
            case 'hybrid':
                return newHybridRace && newHybridStation
                    ? `hybrid_race_${newHybridRace}_${newHybridStation}`
                    : '';
            default:
                return '';
        }
    }, [newRecordCategory, newCardioType, newStrengthExercise, newStrengthSuffix, newHybridRace, newHybridStation]);

    const newRecordUnit = useMemo(() => {
        switch (newRecordCategory) {
            case 'cardio': {
                const cardio = CARDIO_RECORDS.find(r => r.value === newCardioType);
                return cardio?.unit || '';
            }
            case 'strength': {
                const suffix = STRENGTH_SUFFIXES.find(s => s.value === newStrengthSuffix);
                return suffix?.unit || '';
            }
            case 'hybrid':
                return 'seconds'; // All hybrid race times are in seconds
            default:
                return '';
        }
    }, [newRecordCategory, newCardioType, newStrengthSuffix]);

    const groupedExercises = useMemo(() => getGroupedExercises(), []);

    const resetForm = () => {
        setNewRecordCategory('');
        setNewCardioType('');
        setNewStrengthExercise('');
        setNewStrengthSuffix('');
        setNewHybridRace('');
        setNewHybridStation('');
        setNewRecordValue(0);
        setShowNew(false);
    };

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/me/personal-records') as { records: PersonalRecord[] };
            setRecords(response.records || []);
        } catch (err) {
            console.error('Failed to fetch personal records:', err);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleSave = async (record: PersonalRecord) => {
        try {
            await api.put(`/users/me/personal-records/${encodeURIComponent(record.recordType)}`, record);
            setEditingRecord(null);
            fetchRecords();
        } catch (err) {
            console.error('Failed to save personal record:', err);
        }
    };

    const handleCreate = async () => {
        if (!newRecordType || !newRecordUnit) return;
        try {
            await api.put(`/users/me/personal-records/${encodeURIComponent(newRecordType)}`, {
                recordType: newRecordType,
                value: newRecordValue,
                unit: newRecordUnit,
            });
            resetForm();
            fetchRecords();
        } catch (err) {
            console.error('Failed to create personal record:', err);
        }
    };

    const handleDelete = async (recordType: string) => {
        if (!confirm(`Delete personal record "${recordType}"?`)) return;
        try {
            await api.delete(`/users/me/personal-records/${encodeURIComponent(recordType)}`);
            fetchRecords();
        } catch (err) {
            console.error('Failed to delete personal record:', err);
        }
    };

    return (
        <Card>
            <Stack gap="md">
                <Stack direction="horizontal" justify="between" align="center">
                    <AccordionTrigger isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
                        <Heading level={3}>🏆 Personal Records</Heading>
                        <Badge variant="default">{loading ? '...' : records.length}</Badge>
                    </AccordionTrigger>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => { if (showNew) { resetForm(); } else { setIsExpanded(true); setShowNew(true); } }}
                    >
                        {showNew ? 'Cancel' : '+ Add Record'}
                    </Button>
                </Stack>

                {isExpanded && (
                    <>
                        {showNew && (
                            <Card>
                                <Stack gap="md">
                                    <Heading level={4}>New Personal Record</Heading>

                                    {/* Step 1: Category Selection */}
                                    <FormField label="Record Category" htmlFor="new-record-category">
                                        <Select
                                            id="new-record-category"
                                            placeholder="Select a category..."
                                            value={newRecordCategory}
                                            onChange={(e) => {
                                                setNewRecordCategory(e.target.value as RecordCategory);
                                                setNewCardioType('');
                                                setNewStrengthExercise('');
                                                setNewStrengthSuffix('');
                                                setNewHybridRace('');
                                                setNewHybridStation('');
                                                setNewRecordValue(0);
                                            }}
                                            options={[
                                                { value: 'cardio', label: 'Cardio (Running/Cycling PBs)' },
                                                { value: 'strength', label: 'Strength (Lifting PRs)' },
                                                { value: 'hybrid', label: 'Hybrid Race (HYROX/ATHX)' },
                                            ]}
                                        />
                                    </FormField>

                                    {/* Step 2: Category-specific selection */}
                                    {newRecordCategory === 'cardio' && (
                                        <FormField label="Record Type" htmlFor="new-cardio-type">
                                            <Select
                                                id="new-cardio-type"
                                                placeholder="Select a record type..."
                                                value={newCardioType}
                                                onChange={(e) => {
                                                    setNewCardioType(e.target.value);
                                                    setNewRecordValue(0);
                                                }}
                                                options={CARDIO_RECORDS.map(r => ({ value: r.value, label: r.label }))}
                                            />
                                        </FormField>
                                    )}

                                    {newRecordCategory === 'strength' && (
                                        <Grid cols={2} gap="md">
                                            <FormField label="Exercise" htmlFor="new-strength-exercise">
                                                <Select
                                                    id="new-strength-exercise"
                                                    placeholder="Select an exercise..."
                                                    value={newStrengthExercise}
                                                    onChange={(e) => setNewStrengthExercise(e.target.value)}
                                                    options={Object.entries(groupedExercises).flatMap(([group, exercises]) => [
                                                        { value: `__group_${group}`, label: `── ${group} ──`, disabled: true },
                                                        ...exercises.map(ex => ({ value: ex.value, label: ex.label })),
                                                    ])}
                                                />
                                            </FormField>
                                            <FormField label="Record Type" htmlFor="new-strength-suffix">
                                                <Select
                                                    id="new-strength-suffix"
                                                    placeholder="Select type..."
                                                    value={newStrengthSuffix}
                                                    onChange={(e) => {
                                                        setNewStrengthSuffix(e.target.value);
                                                        setNewRecordValue(0);
                                                    }}
                                                    options={STRENGTH_SUFFIXES.map(s => ({ value: s.value, label: s.label }))}
                                                />
                                            </FormField>
                                        </Grid>
                                    )}

                                    {newRecordCategory === 'hybrid' && (
                                        <Grid cols={2} gap="md">
                                            <FormField label="Race Type" htmlFor="new-hybrid-race">
                                                <Select
                                                    id="new-hybrid-race"
                                                    placeholder="Select race..."
                                                    value={newHybridRace}
                                                    onChange={(e) => setNewHybridRace(e.target.value)}
                                                    options={HYBRID_RACE_TYPES}
                                                />
                                            </FormField>
                                            <FormField label="Station" htmlFor="new-hybrid-station">
                                                <Select
                                                    id="new-hybrid-station"
                                                    placeholder="Select station..."
                                                    value={newHybridStation}
                                                    onChange={(e) => {
                                                        setNewHybridStation(e.target.value);
                                                        setNewRecordValue(0);
                                                    }}
                                                    options={HYBRID_STATIONS}
                                                />
                                            </FormField>
                                        </Grid>
                                    )}

                                    {/* Step 3: Value Input */}
                                    {newRecordType && newRecordUnit && (
                                        <FormField
                                            label={`Value${newRecordUnit === 'seconds' ? ' (Time)' : newRecordUnit === 'kg' ? ' (kg)' : newRecordUnit === 'meters' ? ' (meters)' : ''}`}
                                            htmlFor="new-record-value"
                                        >
                                            {newRecordUnit === 'seconds' ? (
                                                <DurationInput
                                                    id="new-record-value"
                                                    value={newRecordValue}
                                                    onChange={setNewRecordValue}
                                                />
                                            ) : (
                                                <Stack direction="horizontal" gap="sm" align="center">
                                                    <Input
                                                        id="new-record-value"
                                                        type="number"
                                                        step={newRecordUnit === 'reps' ? 1 : 0.01}
                                                        min={0}
                                                        value={newRecordValue}
                                                        onChange={(e) => setNewRecordValue(parseFloat(e.target.value) || 0)}
                                                        style={{ maxWidth: '150px' }}
                                                    />
                                                    <Paragraph muted>{newRecordUnit}</Paragraph>
                                                </Stack>
                                            )}
                                        </FormField>
                                    )}

                                    {/* Preview */}
                                    {newRecordType && newRecordUnit && newRecordValue > 0 && (
                                        <Card variant="elevated">
                                            <Stack gap="xs">
                                                <Paragraph size="sm" muted>Preview:</Paragraph>
                                                <Paragraph>
                                                    <strong>{getRecordDisplayName(newRecordType)}</strong>: {formatRecordValue(newRecordValue, newRecordUnit)}
                                                </Paragraph>
                                            </Stack>
                                        </Card>
                                    )}

                                    {/* Actions */}
                                    <Stack direction="horizontal" gap="sm">
                                        <Button
                                            variant="primary"
                                            onClick={handleCreate}
                                            disabled={!newRecordType || !newRecordUnit || newRecordValue <= 0}
                                        >
                                            Create Record
                                        </Button>
                                        <Button variant="text" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Card>
                        )}

                        {loading ? (
                            <Paragraph muted>Loading personal records...</Paragraph>
                        ) : records.length === 0 ? (
                            <Paragraph muted>No personal records yet. They&apos;re created automatically by PR tracking boosters.</Paragraph>
                        ) : (
                            <Stack gap="sm">
                                {records.map((record) => (
                                    <Card key={record.recordType} variant="elevated">
                                        {editingRecord?.recordType === record.recordType ? (
                                            <Stack gap="sm">
                                                <Paragraph size="sm" muted>
                                                    Editing: <strong>{getRecordDisplayName(record.recordType)}</strong>
                                                </Paragraph>
                                                <FormField label="Value" htmlFor={`edit-${record.recordType}-value`}>
                                                    {editingRecord.unit === 'seconds' ? (
                                                        <DurationInput
                                                            id={`edit-${record.recordType}-value`}
                                                            value={editingRecord.value}
                                                            onChange={(v) => setEditingRecord({ ...editingRecord, value: v })}
                                                        />
                                                    ) : (
                                                        <Stack direction="horizontal" gap="sm" align="center">
                                                            <Input
                                                                id={`edit-${record.recordType}-value`}
                                                                type="number"
                                                                step={editingRecord.unit === 'reps' ? 1 : 0.01}
                                                                min={0}
                                                                value={editingRecord.value}
                                                                onChange={(e) => setEditingRecord({ ...editingRecord, value: parseFloat(e.target.value) || 0 })}
                                                                style={{ maxWidth: '150px' }}
                                                            />
                                                            <Paragraph muted>{editingRecord.unit}</Paragraph>
                                                        </Stack>
                                                    )}
                                                </FormField>
                                                <Stack direction="horizontal" gap="sm">
                                                    <Button size="small" variant="primary" onClick={() => handleSave(editingRecord)}>
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
                                                    <Paragraph><strong>{getRecordDisplayName(record.recordType)}</strong></Paragraph>
                                                    <Paragraph size="sm" muted>
                                                        {formatRecordValue(record.value, record.unit)}
                                                        {record.achievedAt && ` • Achieved: ${formatDate(record.achievedAt)}`}
                                                        {record.improvement != null && record.improvement !== 0 && ` • ${record.improvement > 0 ? '+' : ''}${record.improvement.toFixed(1)}%`}
                                                    </Paragraph>
                                                </Stack>
                                                <Stack direction="horizontal" gap="xs">
                                                    <Button size="small" variant="text" onClick={() => setEditingRecord(record)}>
                                                        Edit
                                                    </Button>
                                                    <Button size="small" variant="danger" onClick={() => handleDelete(record.recordType)}>
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

export default PersonalRecordsSection;
