import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Grid } from '../library/layout';
import { Input, FormField, Select } from '../library/forms';
import './enricher-data.css';
import { client } from '../../../shared/api/client';
import { PersonalRecord } from './types';
import { CARDIO_RECORDS, STRENGTH_SUFFIXES, HYBRID_RACE_TYPES, HYBRID_STATIONS } from './constants';
import { RecordCategory, formatDate, formatRecordValue, getRecordDisplayName, getGroupedExercises } from './helpers';
import DurationInput from './DurationInput';

const PersonalRecordsSection: React.FC = () => {
    const [records, setRecords] = useState<PersonalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const [newRecordCategory, setNewRecordCategory] = useState<RecordCategory | ''>('');
    const [newCardioType, setNewCardioType] = useState('');
    const [newStrengthExercise, setNewStrengthExercise] = useState('');
    const [newStrengthSuffix, setNewStrengthSuffix] = useState('');
    const [newHybridRace, setNewHybridRace] = useState('');
    const [newHybridStation, setNewHybridStation] = useState('');
    const [newRecordValue, setNewRecordValue] = useState(0);

    const newRecordType = useMemo(() => {
        switch (newRecordCategory) {
            case 'cardio': return newCardioType;
            case 'strength': return newStrengthExercise && newStrengthSuffix ? `${newStrengthExercise}${newStrengthSuffix}` : '';
            case 'hybrid': return newHybridRace && newHybridStation ? `hybrid_race_${newHybridRace}_${newHybridStation}` : '';
            default: return '';
        }
    }, [newRecordCategory, newCardioType, newStrengthExercise, newStrengthSuffix, newHybridRace, newHybridStation]);

    const newRecordUnit = useMemo(() => {
        switch (newRecordCategory) {
            case 'cardio': return CARDIO_RECORDS.find(r => r.value === newCardioType)?.unit || '';
            case 'strength': return STRENGTH_SUFFIXES.find(s => s.value === newStrengthSuffix)?.unit || '';
            case 'hybrid': return 'seconds';
            default: return '';
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
            const { data } = await client.GET('/users/me/personal-records');
            setRecords((data as { records: PersonalRecord[] })?.records || []);
        } catch (err) {
            console.error('Failed to fetch personal records:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleSave = async (record: PersonalRecord) => {
        try {
            await client.PUT('/users/me/personal-records/{recordType}', { params: { path: { recordType: record.recordType } }, body: record as never });
            setEditingRecord(null);
            fetchRecords();
        } catch (err) {
            console.error('Failed to save personal record:', err);
        }
    };

    const handleCreate = async () => {
        if (!newRecordType || !newRecordUnit) return;
        try {
            await client.PUT('/users/me/personal-records/{recordType}', {
                params: { path: { recordType: newRecordType } },
                body: { recordType: newRecordType, value: newRecordValue, unit: newRecordUnit } as never,
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
            await client.DELETE('/users/me/personal-records/{recordType}', { params: { path: { recordType } } });
            fetchRecords();
        } catch (err) {
            console.error('Failed to delete personal record:', err);
        }
    };

    return (
        <div className="ba-enricher-section">
            <div className="ba-enricher-section__head" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="ba-enricher-section__head-left">
                    <span>🏆</span>
                    <span className="ba-enricher-section__label">Personal Records</span>
                    <span className="ba-enricher-section__count">{loading ? '…' : records.length}</span>
                </div>
                <button
                    className="ba-enricher-section__add-btn"
                    onClick={(e) => { e.stopPropagation(); if (showNew) { resetForm(); } else { setIsExpanded(true); setShowNew(true); } }}
                >
                    {showNew ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {isExpanded && (
                <div className="ba-enricher-section__body">
                    {showNew && (
                        <div className="ba-enricher-section__new-form">
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

                            {newRecordCategory === 'cardio' && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <FormField label="Record Type" htmlFor="new-cardio-type">
                                        <Select
                                            id="new-cardio-type"
                                            placeholder="Select a record type..."
                                            value={newCardioType}
                                            onChange={(e) => { setNewCardioType(e.target.value); setNewRecordValue(0); }}
                                            options={CARDIO_RECORDS.map(r => ({ value: r.value, label: r.label }))}
                                        />
                                    </FormField>
                                </div>
                            )}

                            {newRecordCategory === 'strength' && (
                                <div style={{ marginTop: '0.75rem' }}>
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
                                                onChange={(e) => { setNewStrengthSuffix(e.target.value); setNewRecordValue(0); }}
                                                options={STRENGTH_SUFFIXES.map(s => ({ value: s.value, label: s.label }))}
                                            />
                                        </FormField>
                                    </Grid>
                                </div>
                            )}

                            {newRecordCategory === 'hybrid' && (
                                <div style={{ marginTop: '0.75rem' }}>
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
                                                onChange={(e) => { setNewHybridStation(e.target.value); setNewRecordValue(0); }}
                                                options={HYBRID_STATIONS}
                                            />
                                        </FormField>
                                    </Grid>
                                </div>
                            )}

                            {newRecordType && newRecordUnit && (
                                <div style={{ marginTop: '0.75rem' }}>
                                <FormField
                                    label={newRecordUnit === 'seconds' ? 'Value (Time)' : newRecordUnit === 'kg' ? 'Value (kg)' : newRecordUnit === 'meters' ? 'Value (meters)' : 'Value'}
                                    htmlFor="new-record-value"
                                >
                                    {newRecordUnit === 'seconds' ? (
                                        <DurationInput id="new-record-value" value={newRecordValue} onChange={setNewRecordValue} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Input
                                                id="new-record-value"
                                                type="number"
                                                step={newRecordUnit === 'reps' ? 1 : 0.01}
                                                min={0}
                                                value={newRecordValue}
                                                onChange={(e) => setNewRecordValue(parseFloat(e.target.value) || 0)}
                                                style={{ maxWidth: '150px' }}
                                            />
                                            <span className="ba-enricher-row__meta">{newRecordUnit}</span>
                                        </div>
                                    )}
                                </FormField>
                                </div>
                            )}

                            <button
                                className="fg-button fg-button--sm"
                                style={{ marginTop: '1rem' }}
                                onClick={handleCreate}
                                disabled={!newRecordType || !newRecordUnit || newRecordValue <= 0}
                            >
                                Create Record
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="ba-enricher-loading">Loading personal records…</div>
                    ) : records.length === 0 ? (
                        <div className="ba-enricher-empty">No personal records yet. They&apos;re created automatically by PR tracking boosters.</div>
                    ) : records.map((record) => (
                        editingRecord?.recordType === record.recordType ? (
                            <div key={record.recordType} className="ba-enricher-edit-form">
                                <label className="ba-enricher-edit-form__label" htmlFor={`edit-${record.recordType}-value`}>
                                    Editing: {getRecordDisplayName(record.recordType)}
                                </label>
                                {editingRecord.unit === 'seconds' ? (
                                    <DurationInput
                                        id={`edit-${record.recordType}-value`}
                                        value={editingRecord.value}
                                        onChange={(v) => setEditingRecord({ ...editingRecord, value: v })}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Input
                                            id={`edit-${record.recordType}-value`}
                                            type="number"
                                            step={editingRecord.unit === 'reps' ? 1 : 0.01}
                                            min={0}
                                            value={editingRecord.value}
                                            onChange={(e) => setEditingRecord({ ...editingRecord, value: parseFloat(e.target.value) || 0 })}
                                            style={{ maxWidth: '150px' }}
                                        />
                                        <span className="ba-enricher-row__meta">{editingRecord.unit}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <button className="fg-button fg-button--sm" onClick={() => handleSave(editingRecord)}>Save</button>
                                    <button className="fg-button fg-button--sm fg-button--ghost" onClick={() => setEditingRecord(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div key={record.recordType} className="ba-enricher-row">
                                <div className="ba-enricher-row__left">
                                    <div className="ba-enricher-row__label">{getRecordDisplayName(record.recordType)}</div>
                                    <div className="ba-enricher-row__meta">
                                        <span className="ba-enricher-row__meta-value">{formatRecordValue(record.value, record.unit)}</span>
                                        {record.achievedAt && ` · Achieved: ${formatDate(record.achievedAt)}`}
                                        {record.improvement != null && record.improvement !== 0 && (
                                            <> · <span className="ba-enricher-row__meta-value">
                                                {record.improvement > 0 ? '+' : ''}{record.improvement.toFixed(1)}%
                                            </span></>
                                        )}
                                    </div>
                                </div>
                                <div className="ba-enricher-row__actions">
                                    <button className="fg-button fg-button--sm fg-button--ghost" onClick={() => setEditingRecord(record)}>Edit</button>
                                    <button className="fg-button fg-button--sm fg-button--ghost" style={{ color: 'var(--fg-rose)' }} onClick={() => handleDelete(record.recordType)}>Delete</button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default PersonalRecordsSection;
