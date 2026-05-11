import React, { useState, useCallback, useEffect, useRef } from 'react';
import { client } from '../../../shared/api/client';
import './WorkoutEntryInput.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type SetMode = 'weight_reps' | 'reps_only' | 'duration' | 'distance_duration';

interface SetEntry {
    reps: string;
    weightKg: string;
    durationSeconds: string;
    distanceMeters: string;
    setType: 'normal' | 'warmup' | 'failure' | 'dropset';
}

interface ExerciseEntry {
    id: string;
    name: string;
    mode: SetMode;
    supersetId: string;
    sets: SetEntry[];
}

interface ExerciseLibraryEntry {
    name: string;
    category: string;
    primary_muscle: string;
    source: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SET_TYPES: { value: SetEntry['setType']; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'warmup', label: 'Warm-up' },
    { value: 'failure', label: 'Failure' },
    { value: 'dropset', label: 'Drop Set' },
];

const SET_MODE_OPTIONS: { value: SetMode; label: string; icon: string }[] = [
    { value: 'weight_reps', label: 'Weight + Reps', icon: '🏋️' },
    { value: 'reps_only', label: 'Reps Only', icon: '💪' },
    { value: 'duration', label: 'Duration', icon: '⏱️' },
    { value: 'distance_duration', label: 'Distance + Duration', icon: '📏' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 1;
const genId = () => String(_idCounter++);

const defaultSet = (prev?: SetEntry): SetEntry => ({
    reps: prev?.reps ?? '',
    weightKg: prev?.weightKg ?? '',
    durationSeconds: prev?.durationSeconds ?? '',
    distanceMeters: prev?.distanceMeters ?? '',
    setType: 'normal',
});

const defaultExercise = (): ExerciseEntry => ({
    id: genId(),
    name: '',
    mode: 'weight_reps',
    supersetId: '',
    sets: [defaultSet()],
});

function inferMode(exName: string): SetMode {
    const n = exName.toLowerCase();
    if (/rowing|skierg|run|walk|cycl|swim/i.test(n)) return 'distance_duration';
    if (/plank|hold|carry|farmer|sled|push.*up\s*hold/i.test(n)) return 'duration';
    return 'weight_reps';
}

function parseDuration(str: string): number {
    if (!str) return 0;
    if (str.includes(':')) {
        const [m, s] = str.split(':').map(Number);
        return (m || 0) * 60 + (s || 0);
    }
    return parseInt(str, 10) || 0;
}

function formatDuration(seconds: number): string {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function parseExisting(value: string): ExerciseEntry[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.length === 0) return [];
        return parsed.map((ex: {
            exercise?: string;
            set_mode?: SetMode;
            superset_id?: string;
            sets?: {
                reps?: number;
                weight_kg?: number;
                duration_seconds?: number;
                distance_meters?: number;
                set_type?: string;
            }[];
        }) => ({
            id: genId(),
            name: ex.exercise ?? '',
            mode: ex.set_mode ?? 'weight_reps',
            supersetId: ex.superset_id ?? '',
            sets: (ex.sets ?? []).map((s) => ({
                reps: String(s.reps ?? ''),
                weightKg: String(s.weight_kg ?? ''),
                durationSeconds: s.duration_seconds ? formatDuration(s.duration_seconds) : '',
                distanceMeters: String(s.distance_meters ?? ''),
                setType: (s.set_type as SetEntry['setType']) ?? 'normal',
            })),
        }));
    } catch {
        return [];
    }
}

// ─── Autocomplete hook ────────────────────────────────────────────────────────

function useExerciseLibrary() {
    const [library, setLibrary] = useState<ExerciseLibraryEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        client.GET('/users/me/exercise-library' as never, {} as never)
            .then((res: { data?: { exercises?: ExerciseLibraryEntry[] } }) => {
                setLibrary(res?.data?.exercises ?? []);
            })
            .catch(() => { /* no Hevy connected — silent */ })
            .finally(() => setLoaded(true));
    }, []);

    const search = useCallback((q: string): ExerciseLibraryEntry[] => {
        if (!q || q.length < 2) return [];
        const lower = q.toLowerCase();
        return library.filter((e) => e.name.toLowerCase().includes(lower)).slice(0, 8);
    }, [library]);

    return { library, loaded, search };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ExerciseNameInputProps {
    value: string;
    placeholder: string;
    search: (q: string) => ExerciseLibraryEntry[];
    onChange: (name: string) => void;
    onSelect: (entry: ExerciseLibraryEntry) => void;
}

function ExerciseNameInput({ value, placeholder, search, onChange, onSelect }: ExerciseNameInputProps) {
    const [suggestions, setSuggestions] = useState<ExerciseLibraryEntry[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleChange = (v: string) => {
        onChange(v);
        const results = search(v);
        setSuggestions(results);
        setOpen(results.length > 0);
    };

    const handleSelect = (entry: ExerciseLibraryEntry) => {
        onSelect(entry);
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <div className="wei-autocomplete" ref={ref}>
            <input
                type="text"
                className="wei-input wei-exercise-name"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
                autoComplete="off"
            />
            {open && suggestions.length > 0 && (
                <ul className="wei-suggestions">
                    {suggestions.map((s, i) => (
                        <li key={i} className="wei-suggestion" onMouseDown={() => handleSelect(s)}>
                            <span className="wei-suggestion-name">{s.name}</span>
                            {s.category && <span className="wei-suggestion-cat">{s.category}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const WorkoutEntryInput: React.FC<Props> = ({ value, onChange }) => {
    const [exercises, setExercises] = useState<ExerciseEntry[]>(() => parseExisting(value) || [defaultExercise()]);
    const { search } = useExerciseLibrary();

    const toJSON = useCallback((exs: ExerciseEntry[]) => {
        const output = exs
            .filter((ex) => ex.name.trim())
            .map((ex) => ({
                exercise: ex.name.trim(),
                set_mode: ex.mode,
                superset_id: ex.supersetId,
                sets: ex.sets
                    .filter((s) => {
                        if (ex.mode === 'weight_reps') return s.reps !== '' || s.weightKg !== '';
                        if (ex.mode === 'reps_only') return s.reps !== '';
                        if (ex.mode === 'duration') return s.durationSeconds !== '';
                        return s.distanceMeters !== '' || s.durationSeconds !== '';
                    })
                    .map((s) => ({
                        reps: parseInt(s.reps, 10) || 0,
                        weight_kg: parseFloat(s.weightKg) || 0,
                        duration_seconds: parseDuration(s.durationSeconds),
                        distance_meters: parseFloat(s.distanceMeters) || 0,
                        set_type: s.setType,
                        set_mode: ex.mode,
                    })),
            }))
            .filter((ex) => ex.sets.length > 0);
        onChange(output.length > 0 ? JSON.stringify(output) : '');
    }, [onChange]);

    const update = useCallback((exs: ExerciseEntry[]) => {
        setExercises(exs);
        toJSON(exs);
    }, [toJSON]);

    useEffect(() => {
        if (exercises.length > 0) toJSON(exercises);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addExercise = () => update([...exercises, defaultExercise()]);

    const removeExercise = (id: string) => {
        const updated = exercises.filter((ex) => ex.id !== id);
        update(updated.length > 0 ? updated : [defaultExercise()]);
    };

    const setName = (id: string, name: string) =>
        update(exercises.map((ex) => ex.id === id ? { ...ex, name } : ex));

    const setMode = (id: string, mode: SetMode) =>
        update(exercises.map((ex) => ex.id === id ? { ...ex, mode } : ex));

    const selectLibraryEntry = (id: string, entry: ExerciseLibraryEntry) => {
        update(exercises.map((ex) =>
            ex.id === id ? { ...ex, name: entry.name, mode: inferMode(entry.name) } : ex
        ));
    };

    const toggleSuperset = (id: string) => {
        const ex = exercises.find((e) => e.id === id);
        if (!ex) return;
        if (ex.supersetId) {
            update(exercises.map((e) => e.id === id ? { ...e, supersetId: '' } : e));
        } else {
            const nextSupersetIndex = exercises.filter((e) => e.supersetId).length + 1;
            update(exercises.map((e) => e.id === id ? { ...e, supersetId: String(nextSupersetIndex) } : e));
        }
    };

    const addSet = (exId: string) => {
        update(exercises.map((ex) => {
            if (ex.id !== exId) return ex;
            const prev = ex.sets[ex.sets.length - 1];
            return { ...ex, sets: [...ex.sets, defaultSet(prev)] };
        }));
    };

    const removeSet = (exId: string, idx: number) =>
        update(exercises.map((ex) =>
            ex.id === exId ? { ...ex, sets: ex.sets.filter((_, i) => i !== idx) } : ex
        ));

    const updateSet = (exId: string, idx: number, field: keyof SetEntry, val: string) =>
        update(exercises.map((ex) =>
            ex.id === exId
                ? { ...ex, sets: ex.sets.map((s, i) => i === idx ? { ...s, [field]: val } : s) }
                : ex
        ));

    return (
        <div className="wei-root">
            {exercises.map((ex, exIdx) => (
                <div key={ex.id} className={`wei-exercise${ex.supersetId ? ' wei-exercise--superset' : ''}`}>
                    {/* Exercise header row */}
                    <div className="wei-exercise-header">
                        <span className="wei-exercise-num">{exIdx + 1}</span>
                        <ExerciseNameInput
                            value={ex.name}
                            placeholder={`Exercise ${exIdx + 1}…`}
                            search={search}
                            onChange={(name) => setName(ex.id, name)}
                            onSelect={(entry) => selectLibraryEntry(ex.id, entry)}
                        />
                        <button
                            type="button"
                            className={`wei-superset-btn${ex.supersetId ? ' wei-superset-btn--active' : ''}`}
                            onClick={() => toggleSuperset(ex.id)}
                            title={ex.supersetId ? `In superset ${ex.supersetId} — click to remove` : 'Add to superset'}
                        >
                            {ex.supersetId ? `S${ex.supersetId}` : '⬡'}
                        </button>
                        <button
                            type="button"
                            className="wei-remove-btn"
                            onClick={() => removeExercise(ex.id)}
                            aria-label="Remove exercise"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Mode picker */}
                    <div className="wei-mode-picker">
                        {SET_MODE_OPTIONS.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                className={`wei-mode-btn${ex.mode === m.value ? ' wei-mode-btn--active' : ''}`}
                                onClick={() => setMode(ex.id, m.value)}
                                title={m.label}
                            >
                                {m.icon}
                            </button>
                        ))}
                        <span className="wei-mode-label">{SET_MODE_OPTIONS.find((m) => m.value === ex.mode)?.label}</span>
                    </div>

                    {/* Sets */}
                    <div className="wei-sets">
                        <SetColumnHeaders mode={ex.mode} />
                        {ex.sets.map((set, setIdx) => (
                            <SetRow
                                key={setIdx}
                                set={set}
                                idx={setIdx}
                                mode={ex.mode}
                                onChange={(field, val) => updateSet(ex.id, setIdx, field, val)}
                                onRemove={() => removeSet(ex.id, setIdx)}
                            />
                        ))}
                    </div>

                    <button type="button" className="wei-add-set-btn" onClick={() => addSet(ex.id)}>
                        + Add Set
                    </button>
                </div>
            ))}

            <button type="button" className="wei-add-exercise-btn" onClick={addExercise}>
                💪 Add Exercise
            </button>
        </div>
    );
};

// ─── Set column headers ───────────────────────────────────────────────────────

function SetColumnHeaders({ mode }: { mode: SetMode }) {
    return (
        <div className="wei-set-row wei-set-row--header">
            <span className="wei-col-num">#</span>
            {mode === 'weight_reps' && <><span className="wei-col">Reps</span><span className="wei-col">kg</span></>}
            {mode === 'reps_only' && <span className="wei-col">Reps</span>}
            {mode === 'duration' && <span className="wei-col">Duration</span>}
            {mode === 'distance_duration' && <><span className="wei-col">km</span><span className="wei-col">Time</span></>}
            <span className="wei-col">Type</span>
            <span className="wei-col-remove" />
        </div>
    );
}

// ─── Set row ──────────────────────────────────────────────────────────────────

interface SetRowProps {
    set: SetEntry;
    idx: number;
    mode: SetMode;
    onChange: (field: keyof SetEntry, val: string) => void;
    onRemove: () => void;
}

function SetRow({ set, idx, mode, onChange, onRemove }: SetRowProps) {
    return (
        <div className="wei-set-row">
            <span className="wei-col-num">{idx + 1}</span>

            {mode === 'weight_reps' && (
                <>
                    <input className="wei-input wei-col" type="number" min={0} placeholder="0" value={set.reps}
                        onChange={(e) => onChange('reps', e.target.value)} />
                    <input className="wei-input wei-col" type="number" min={0} step={0.5} placeholder="0" value={set.weightKg}
                        onChange={(e) => onChange('weightKg', e.target.value)} />
                </>
            )}
            {mode === 'reps_only' && (
                <input className="wei-input wei-col" type="number" min={0} placeholder="0" value={set.reps}
                    onChange={(e) => onChange('reps', e.target.value)} />
            )}
            {mode === 'duration' && (
                <input className="wei-input wei-col" type="text" placeholder="m:ss" value={set.durationSeconds}
                    onChange={(e) => onChange('durationSeconds', e.target.value)} />
            )}
            {mode === 'distance_duration' && (
                <>
                    <input className="wei-input wei-col" type="number" min={0} step={0.01} placeholder="0.00" value={set.distanceMeters}
                        onChange={(e) => onChange('distanceMeters', e.target.value)} />
                    <input className="wei-input wei-col" type="text" placeholder="m:ss" value={set.durationSeconds}
                        onChange={(e) => onChange('durationSeconds', e.target.value)} />
                </>
            )}

            <select className="wei-input wei-col wei-set-type" value={set.setType}
                onChange={(e) => onChange('setType', e.target.value as SetEntry['setType'])}>
                {SET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <button type="button" className="wei-remove-btn wei-col-remove" onClick={onRemove} aria-label="Remove set">
                ✕
            </button>
        </div>
    );
}
