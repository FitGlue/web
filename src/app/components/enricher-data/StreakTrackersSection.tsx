import React, { useState } from 'react';
import { Grid } from '../library/layout';
import { Input, FormField, Select } from '../library/forms';
import { useToast } from '../library/ui';
import './enricher-data.css';
import { client } from '../../../shared/api/client';
import { BoosterDataEntry } from './types';
import { getBoosterLabel, formatDate } from './helpers';
import { logger } from '../../../shared/logger';

interface StreakTrackersSectionProps {
    entries: BoosterDataEntry[];
    loading: boolean;
    onRefresh: () => void;
}

const StreakTrackersSection: React.FC<StreakTrackersSectionProps> = ({ entries, loading, onRefresh }) => {
    const toast = useToast();
    const [editingBooster, setEditingBooster] = useState<BoosterDataEntry | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newActivityTypes, setNewActivityTypes] = useState('any');
    const [newCurrent, setNewCurrent] = useState(0);
    const [newLongest, setNewLongest] = useState(0);

    const handleSave = async (entry: BoosterDataEntry) => {
        try {
            await client.PUT('/users/me/booster-data/{boosterId}', { params: { path: { boosterId: entry.id } }, body: entry.data as never });
            setEditingBooster(null);
            onRefresh();
            toast.success('Saved', 'Streak tracker updated.');
        } catch (err) {
            logger.error('Failed to save booster data:', err);
            toast.error('Save failed', 'Could not update streak tracker.');
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
        const id = `streak_tracker_${newActivityTypes}`;
        try {
            await client.PUT('/users/me/booster-data/{boosterId}', {
                params: { path: { boosterId: id } },
                body: { current_streak: newCurrent, longest_streak: newLongest, last_activity_date: '', last_update: new Date().toISOString() } as never,
            });
            setShowNew(false);
            setNewActivityTypes('any');
            setNewCurrent(0);
            setNewLongest(0);
            onRefresh();
        } catch (err) {
            logger.error('Failed to create streak tracker:', err);
        }
    };

    return (
        <div className="ba-enricher-section">
            <div className="ba-enricher-section__head" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="ba-enricher-section__head-left">
                    <span>🔥</span>
                    <span className="ba-enricher-section__label">Streak Trackers</span>
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
                            <button className="fg-button fg-button--sm" style={{ marginTop: '1rem' }} onClick={handleCreate}>
                                Create Streak Tracker
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="ba-enricher-loading">Loading streak trackers…</div>
                    ) : entries.length === 0 ? (
                        <div className="ba-enricher-empty">No streak trackers yet. Add the Streak Tracker booster to a pipeline to start tracking.</div>
                    ) : entries.map((entry) => (
                        editingBooster?.id === entry.id ? (
                            <div key={entry.id} className="ba-enricher-edit-form">
                                <label className="ba-enricher-edit-form__label">
                                    Editing: {getBoosterLabel(entry.id)}
                                </label>
                                <Grid cols={2} gap="md">
                                    <div>
                                        <label className="ba-enricher-edit-form__label" htmlFor={`edit-${entry.id}-current`}>Current Streak</label>
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
                                    </div>
                                    <div>
                                        <label className="ba-enricher-edit-form__label" htmlFor={`edit-${entry.id}-longest`}>Longest Streak</label>
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
                                    </div>
                                </Grid>
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
                                        Current: <span className="ba-enricher-row__meta-value">{(entry.data.current_streak as number) ?? 0} days</span>
                                        {' · '}Best: <span className="ba-enricher-row__meta-value">{(entry.data.longest_streak as number) ?? 0} days</span>
                                        {entry.data.last_activity_date ? ` · Last: ${entry.data.last_activity_date}` : ''}
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

export default StreakTrackersSection;
