import React, { useState, useCallback, useEffect } from 'react';

interface SetEntry {
    reps: string;
    weightKg: string;
    setType: string;
}

interface ExerciseEntry {
    id: string;
    name: string;
    sets: SetEntry[];
}

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const SET_TYPES = [
    { value: 'normal', label: 'Normal' },
    { value: 'warmup', label: 'Warm-up' },
    { value: 'failure', label: 'To Failure' },
    { value: 'dropset', label: 'Drop Set' },
];

let _idCounter = 1;
const genId = () => String(_idCounter++);

const defaultSet = (): SetEntry => ({ reps: '', weightKg: '', setType: 'normal' });

function parseExisting(value: string): ExerciseEntry[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.length === 0) return [];
        return parsed.map((ex: { exercise?: string; sets?: { reps?: number; weight_kg?: number; set_type?: string }[] }) => ({
            id: genId(),
            name: ex.exercise || '',
            sets: (ex.sets || []).map((s) => ({
                reps: String(s.reps ?? ''),
                weightKg: String(s.weight_kg ?? ''),
                setType: s.set_type || 'normal',
            })),
        }));
    } catch {
        return [];
    }
}

const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg-secondary, #1a1a2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: '4px',
    color: 'var(--color-text, #fff)',
    padding: '4px 6px',
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
};

export const WorkoutEntryInput: React.FC<Props> = ({ value, onChange }) => {
    const [exercises, setExercises] = useState<ExerciseEntry[]>(() => parseExisting(value));

    const syncToParent = useCallback((exs: ExerciseEntry[]) => {
        const output = exs
            .filter((ex) => ex.name.trim())
            .map((ex) => ({
                exercise: ex.name.trim(),
                sets: ex.sets
                    .filter((s) => s.reps !== '' || s.weightKg !== '')
                    .map((s) => ({
                        reps: parseInt(s.reps, 10) || 0,
                        weight_kg: parseFloat(s.weightKg) || 0,
                        set_type: s.setType || 'normal',
                    })),
                superset_id: '',
            }))
            .filter((ex) => ex.sets.length > 0);
        // Only send non-empty value — empty string fails the requiredFields check
        onChange(output.length > 0 ? JSON.stringify(output) : '');
    }, [onChange]);

    // Sync parsed initial value to parent once on mount
    useEffect(() => {
        if (exercises.length > 0) syncToParent(exercises);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addExercise = () => {
        const updated = [...exercises, { id: genId(), name: '', sets: [defaultSet()] }];
        setExercises(updated);
        syncToParent(updated);
    };

    const removeExercise = (id: string) => {
        const updated = exercises.filter((ex) => ex.id !== id);
        setExercises(updated);
        syncToParent(updated);
    };

    const updateExerciseName = (id: string, name: string) => {
        const updated = exercises.map((ex) => ex.id === id ? { ...ex, name } : ex);
        setExercises(updated);
        syncToParent(updated);
    };

    const addSet = (exerciseId: string) => {
        const updated = exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, sets: [...ex.sets, defaultSet()] } : ex
        );
        setExercises(updated);
        syncToParent(updated);
    };

    const removeSet = (exerciseId: string, idx: number) => {
        const updated = exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, i) => i !== idx) } : ex
        );
        setExercises(updated);
        syncToParent(updated);
    };

    const updateSet = (exerciseId: string, idx: number, field: keyof SetEntry, val: string) => {
        const updated = exercises.map((ex) =>
            ex.id === exerciseId
                ? { ...ex, sets: ex.sets.map((s, i) => i === idx ? { ...s, [field]: val } : s) }
                : ex
        );
        setExercises(updated);
        syncToParent(updated);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {exercises.length === 0 && (
                <p style={{ margin: 0, color: 'var(--color-text-muted, #888)', fontSize: '0.875rem' }}>
                    Add the exercises you did during this activity.
                </p>
            )}

            {exercises.map((ex, exIdx) => (
                <div
                    key={ex.id}
                    style={{
                        border: '1px solid var(--color-border, #333)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}
                >
                    {/* Exercise name row */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder={`Exercise ${exIdx + 1} name…`}
                            value={ex.name}
                            onChange={(e) => updateExerciseName(ex.id, e.target.value)}
                            style={{
                                ...inputStyle,
                                fontWeight: 600,
                                fontSize: '0.9rem',
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeExercise(ex.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-muted, #888)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                padding: '4px 6px',
                                flexShrink: 0,
                            }}
                            aria-label="Remove exercise"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Sets */}
                    {ex.sets.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '32px 1fr 1fr 1fr 28px',
                                gap: '4px',
                                fontSize: '0.7rem',
                                color: 'var(--color-text-muted, #888)',
                                paddingLeft: '4px',
                            }}>
                                <span>#</span>
                                <span>Reps</span>
                                <span>kg</span>
                                <span>Type</span>
                                <span />
                            </div>
                            {ex.sets.map((set, setIdx) => (
                                <div
                                    key={setIdx}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '32px 1fr 1fr 1fr 28px',
                                        gap: '4px',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-muted, #888)',
                                        textAlign: 'center',
                                    }}>
                                        {setIdx + 1}
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={set.reps}
                                        min={0}
                                        onChange={(e) => updateSet(ex.id, setIdx, 'reps', e.target.value)}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={set.weightKg}
                                        min={0}
                                        step={0.5}
                                        onChange={(e) => updateSet(ex.id, setIdx, 'weightKg', e.target.value)}
                                        style={inputStyle}
                                    />
                                    <select
                                        value={set.setType}
                                        onChange={(e) => updateSet(ex.id, setIdx, 'setType', e.target.value)}
                                        style={{ ...inputStyle, padding: '4px 6px' }}
                                    >
                                        {SET_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => removeSet(ex.id, setIdx)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--color-text-muted, #888)',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            padding: '2px',
                                            lineHeight: 1,
                                        }}
                                        aria-label="Remove set"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => addSet(ex.id)}
                        style={{
                            background: 'transparent',
                            border: '1px dashed var(--color-border, #444)',
                            borderRadius: '4px',
                            color: 'var(--color-text-muted, #888)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '4px 10px',
                            alignSelf: 'flex-start',
                        }}
                    >
                        + Add Set
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={addExercise}
                style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px dashed var(--color-border, #444)',
                    background: 'transparent',
                    color: 'var(--color-text, #fff)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                }}
            >
                💪 Add Exercise
            </button>
        </div>
    );
};
