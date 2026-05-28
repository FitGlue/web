import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from '../library/layout';
import { Input, FormField } from '../library/forms';
import './enricher-data.css';
import { client } from '../../../shared/api/client';
import { Counter } from './types';
import { formatDate } from './helpers';

const CountersSection: React.FC = () => {
    const [counters, setCounters] = useState<Counter[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
    const [newCounter, setNewCounter] = useState({ id: '', count: 0 });
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchCounters = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await client.GET('/users/me/counters');
            const response = data as unknown as { counters: Counter[] };
            setCounters((response?.counters || []).map(c => ({ ...c, count: Number(c.count) })));
        } catch (err) {
            console.error('Failed to fetch counters:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCounters();
    }, [fetchCounters]);

    const handleSave = async (counter: Counter) => {
        try {
            await client.PUT('/users/me/counters/{name}', { params: { path: { name: counter.id } }, body: { count: counter.count } as never });
            setEditingCounter(null);
            fetchCounters();
        } catch (err) {
            console.error('Failed to save counter:', err);
        }
    };

    const handleCreate = async () => {
        if (!newCounter.id.trim()) return;
        try {
            await client.PUT('/users/me/counters/{name}', { params: { path: { name: newCounter.id } }, body: { count: newCounter.count } as never });
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
            await client.DELETE('/users/me/counters/{name}', { params: { path: { name: id } } });
            fetchCounters();
        } catch (err) {
            console.error('Failed to delete counter:', err);
        }
    };

    return (
        <div className="ba-enricher-section">
            <div className="ba-enricher-section__head" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="ba-enricher-section__head-left">
                    <span>🔢</span>
                    <span className="ba-enricher-section__label">Auto-Increment Counters</span>
                    <span className="ba-enricher-section__count">{loading ? '…' : counters.length}</span>
                </div>
                <button
                    className="ba-enricher-section__add-btn"
                    onClick={(e) => { e.stopPropagation(); if (!showNew) setIsExpanded(true); setShowNew(!showNew); }}
                >
                    {showNew ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {isExpanded && (
                <div className="ba-enricher-section__body">
                    {showNew && (
                        <div className="ba-enricher-section__new-form">
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
                            <button
                                className="fg-button fg-button--sm"
                                style={{ marginTop: '1rem' }}
                                onClick={handleCreate}
                                disabled={!newCounter.id.trim()}
                            >
                                Create Counter
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="ba-enricher-loading">Loading counters…</div>
                    ) : counters.length === 0 ? (
                        <div className="ba-enricher-empty">No counters yet. Add one with the Auto-Increment booster.</div>
                    ) : counters.map((counter) => (
                        editingCounter?.id === counter.id ? (
                            <div key={counter.id} className="ba-enricher-edit-form">
                                <label className="ba-enricher-edit-form__label" htmlFor={`edit-${counter.id}-count`}>
                                    Editing: {counter.id}
                                </label>
                                <Input
                                    id={`edit-${counter.id}-count`}
                                    type="number"
                                    value={editingCounter.count}
                                    onChange={(e) => setEditingCounter({ ...editingCounter, count: parseInt(e.target.value) || 0 })}
                                    style={{ maxWidth: '150px' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <button className="fg-button fg-button--sm" onClick={() => handleSave(editingCounter)}>Save</button>
                                    <button className="fg-button fg-button--sm fg-button--ghost" onClick={() => setEditingCounter(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div key={counter.id} className="ba-enricher-row">
                                <div className="ba-enricher-row__left">
                                    <div className="ba-enricher-row__label">{counter.id}</div>
                                    <div className="ba-enricher-row__meta">
                                        Last: <span className="ba-enricher-row__meta-value">#{counter.count}</span>
                                        {' · '}Next: <span className="ba-enricher-row__meta-value">#{counter.count + 1}</span>
                                        {' · '}Updated: {formatDate(counter.lastUpdated)}
                                    </div>
                                </div>
                                <div className="ba-enricher-row__actions">
                                    <button className="fg-button fg-button--sm fg-button--ghost" onClick={() => setEditingCounter(counter)}>Edit</button>
                                    <button className="fg-button fg-button--sm fg-button--ghost" style={{ color: 'var(--fg-rose)' }} onClick={() => handleDelete(counter.id)}>Delete</button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default CountersSection;
