import React, { useState } from 'react';
import { Grid } from '../library/layout';
import { Input, FormField, Select } from '../library/forms';
import { useToast } from '../library/ui';
import './enricher-data.css';
import { client } from '../../../shared/api/client';
import { BoosterDataEntry } from './types';
import { getBoosterLabel, formatDate } from './helpers';
import { logger } from '../../../shared/logger';

interface GoalTrackersSectionProps {
    entries: BoosterDataEntry[];
    loading: boolean;
    onRefresh: () => void;
}

const GoalTrackersSection: React.FC<GoalTrackersSectionProps> = ({ entries, loading, onRefresh }) => {
    const toast = useToast();
    const [editingBooster, setEditingBooster] = useState<BoosterDataEntry | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newPeriod, setNewPeriod] = useState('month');
    const [newMetric, setNewMetric] = useState('distance');
    const [newAccumulated, setNewAccumulated] = useState(0);

    const handleSave = async (entry: BoosterDataEntry) => {
        try {
            await client.PUT('/users/me/booster-data/{boosterId}', { params: { path: { boosterId: entry.id } }, body: entry.data as never });
            setEditingBooster(null);
            onRefresh();
            toast.success('Saved', 'Goal tracker updated.');
        } catch (err) {
            logger.error('Failed to save booster data:', err);
            toast.error('Save failed', 'Could not update goal tracker.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Delete booster data "${id}"? This will reset this booster's progress.`)) return;
        try {
            await client.DELETE('/users/me/booster-data/{boosterId}', { params: { path: { boosterId: id } } });
            onRefresh();
        } catch (err) {
            logger.error('Failed to delete booster data:', err);
        }
    };

    const handleCreate = async () => {
        const id = `goal_tracker_${newPeriod}_${newMetric}`;
        try {
            await client.PUT('/users/me/booster-data/{boosterId}', {
                params: { path: { boosterId: id } },
                body: { accumulated: newAccumulated, period_key: '', last_update: new Date().toISOString() } as never,
            });
            setShowNew(false);
            setNewPeriod('month');
            setNewMetric('distance');
            setNewAccumulated(0);
            onRefresh();
        } catch (err) {
            logger.error('Failed to create goal tracker:', err);
        }
    };

    return (
        <div className="ba-enricher-section">
            <div className="ba-enricher-section__head" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="ba-enricher-section__head-left">
                    <span>🎯</span>
                    <span className="ba-enricher-section__label">Goal Trackers</span>
                    <span className="ba-enricher-section__count">{loading ? '…' : entries.length}</span>
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
                            <button className="fg-button fg-button--sm" style={{ marginTop: '1rem' }} onClick={handleCreate}>
                                Create Goal Tracker
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="ba-enricher-loading">Loading goal trackers…</div>
                    ) : entries.length === 0 ? (
                        <div className="ba-enricher-empty">No goal trackers yet. Add the Goal Tracker booster to a pipeline to start tracking.</div>
                    ) : entries.map((entry) => (
                        editingBooster?.id === entry.id ? (
                            <div key={entry.id} className="ba-enricher-edit-form">
                                <label className="ba-enricher-edit-form__label" htmlFor={`edit-${entry.id}-accumulated`}>
                                    Editing: {getBoosterLabel(entry.id)} — Accumulated Progress
                                </label>
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
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <button className="fg-button fg-button--sm" onClick={() => handleSave(editingBooster)}>Save</button>
                                    <button className="fg-button fg-button--sm fg-button--ghost" onClick={() => setEditingBooster(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div key={entry.id} className="ba-enricher-row">
                                <div className="ba-enricher-row__left">
                                    <div className="ba-enricher-row__label">{getBoosterLabel(entry.id)}</div>
                                    <div className="ba-enricher-row__meta">
                                        Progress: <span className="ba-enricher-row__meta-value">
                                            {typeof entry.data.accumulated === 'number' ? entry.data.accumulated.toFixed(1) : '0'}
                                        </span>
                                        {entry.data.period_key ? <>{' · '}Period: <span className="ba-enricher-row__meta-value">{entry.data.period_key as string}</span></> : null}
                                        {entry.data.last_update ? ` · Updated: ${formatDate(entry.data.last_update as string)}` : ''}
                                    </div>
                                </div>
                                <div className="ba-enricher-row__actions">
                                    <button className="fg-button fg-button--sm fg-button--ghost" onClick={() => setEditingBooster(entry)}>Edit</button>
                                    <button className="fg-button fg-button--sm fg-button--ghost" style={{ color: 'var(--fg-rose)' }} onClick={() => handleDelete(entry.id)}>Delete</button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default GoalTrackersSection;
