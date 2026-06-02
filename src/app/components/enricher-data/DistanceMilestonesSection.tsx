import React, { useState } from 'react';
import { Grid } from '../library/layout';
import { Input, FormField, Select } from '../library/forms';
import './enricher-data.css';
import { client } from '../../../shared/api/client';
import { BoosterDataEntry } from './types';
import { getBoosterLabel, formatDate } from './helpers';
import { logger } from '../../../shared/logger';

interface DistanceMilestonesSectionProps {
    entries: BoosterDataEntry[];
    loading: boolean;
    onRefresh: () => void;
}

const DistanceMilestonesSection: React.FC<DistanceMilestonesSectionProps> = ({ entries, loading, onRefresh }) => {
    const [editingBooster, setEditingBooster] = useState<BoosterDataEntry | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSport, setNewSport] = useState('any');
    const [newDistance, setNewDistance] = useState(0);

    const handleSave = async (entry: BoosterDataEntry) => {
        try {
            await client.PUT('/users/me/booster-data/{boosterId}', { params: { path: { boosterId: entry.id } }, body: entry.data as never });
            setEditingBooster(null);
            onRefresh();
        } catch (err) {
            logger.error('Failed to save booster data:', err);
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
        const id = `distance_milestones_${newSport}`;
        try {
            await client.PUT('/users/me/booster-data/{boosterId}', {
                params: { path: { boosterId: id } },
                body: { lifetime_distance: newDistance, last_update: new Date().toISOString() } as never,
            });
            setShowNew(false);
            setNewSport('any');
            setNewDistance(0);
            onRefresh();
        } catch (err) {
            logger.error('Failed to create distance milestone:', err);
        }
    };

    return (
        <div className="ba-enricher-section">
            <div className="ba-enricher-section__head" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="ba-enricher-section__head-left">
                    <span>📊</span>
                    <span className="ba-enricher-section__label">Distance Milestones</span>
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
                            <button className="fg-button fg-button--sm" style={{ marginTop: '1rem' }} onClick={handleCreate}>
                                Create Milestone Tracker
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="ba-enricher-loading">Loading distance milestones…</div>
                    ) : entries.length === 0 ? (
                        <div className="ba-enricher-empty">No distance milestones yet. Add the Distance Milestones booster to a pipeline to start tracking.</div>
                    ) : entries.map((entry) => (
                        editingBooster?.id === entry.id ? (
                            <div key={entry.id} className="ba-enricher-edit-form">
                                <label className="ba-enricher-edit-form__label" htmlFor={`edit-${entry.id}-distance`}>
                                    Editing: {getBoosterLabel(entry.id)} — Lifetime Distance (km)
                                </label>
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
                                        Lifetime: <span className="ba-enricher-row__meta-value">
                                            {typeof entry.data.lifetime_distance === 'number' ? entry.data.lifetime_distance.toFixed(1) : '0'} km
                                        </span>
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

export default DistanceMilestonesSection;
