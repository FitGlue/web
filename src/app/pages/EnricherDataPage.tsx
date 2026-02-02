import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, Badge } from '../components/library/ui';
import { Input, FormField, Select } from '../components/library/forms';
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

// ============================================================================
// PR Record Type Definitions
// ============================================================================

type RecordCategory = 'cardio' | 'strength' | 'hybrid';

interface CardioRecordDef {
    value: string;
    label: string;
    unit: 'seconds' | 'meters';
}

const CARDIO_RECORDS: CardioRecordDef[] = [
    { value: 'fastest_5k', label: 'Fastest 5K', unit: 'seconds' },
    { value: 'fastest_10k', label: 'Fastest 10K', unit: 'seconds' },
    { value: 'fastest_half_marathon', label: 'Fastest Half Marathon', unit: 'seconds' },
    { value: 'fastest_marathon', label: 'Fastest Marathon', unit: 'seconds' },
    { value: 'longest_run', label: 'Longest Run', unit: 'meters' },
    { value: 'longest_ride', label: 'Longest Ride', unit: 'meters' },
    { value: 'highest_elevation_gain', label: 'Highest Elevation Gain', unit: 'meters' },
];

interface StrengthRecordSuffix {
    value: string;
    label: string;
    unit: 'kg' | 'reps';
}

const STRENGTH_SUFFIXES: StrengthRecordSuffix[] = [
    { value: '_1rm', label: '1 Rep Max', unit: 'kg' },
    { value: '_volume', label: 'Session Volume', unit: 'kg' },
    { value: '_reps', label: 'Max Reps', unit: 'reps' },
];

// Canonical exercises from the backend taxonomy
const STRENGTH_EXERCISES = [
    // Chest
    { value: 'bench_press', label: 'Bench Press', group: 'Chest' },
    { value: 'incline_bench_press', label: 'Incline Bench Press', group: 'Chest' },
    { value: 'decline_bench_press', label: 'Decline Bench Press', group: 'Chest' },
    { value: 'dumbbell_bench_press', label: 'Dumbbell Bench Press', group: 'Chest' },
    { value: 'incline_dumbbell_press', label: 'Incline Dumbbell Press', group: 'Chest' },
    { value: 'chest_fly', label: 'Chest Fly', group: 'Chest' },
    { value: 'cable_fly', label: 'Cable Fly', group: 'Chest' },
    { value: 'push_up', label: 'Push Up', group: 'Chest' },
    { value: 'dip', label: 'Dip', group: 'Chest' },
    { value: 'machine_chest_press', label: 'Machine Chest Press', group: 'Chest' },
    // Back
    { value: 'deadlift', label: 'Deadlift', group: 'Back' },
    { value: 'romanian_deadlift', label: 'Romanian Deadlift', group: 'Back' },
    { value: 'pull_up', label: 'Pull Up', group: 'Back' },
    { value: 'chin_up', label: 'Chin Up', group: 'Back' },
    { value: 'lat_pulldown', label: 'Lat Pulldown', group: 'Back' },
    { value: 'bent_over_row', label: 'Bent Over Row', group: 'Back' },
    { value: 'dumbbell_row', label: 'Dumbbell Row', group: 'Back' },
    { value: 'seated_cable_row', label: 'Seated Cable Row', group: 'Back' },
    { value: 't_bar_row', label: 'T-Bar Row', group: 'Back' },
    { value: 'face_pull', label: 'Face Pull', group: 'Back' },
    { value: 'shrug', label: 'Shrug', group: 'Back' },
    { value: 'back_extension', label: 'Back Extension', group: 'Back' },
    // Shoulders
    { value: 'overhead_press', label: 'Overhead Press', group: 'Shoulders' },
    { value: 'dumbbell_shoulder_press', label: 'Dumbbell Shoulder Press', group: 'Shoulders' },
    { value: 'arnold_press', label: 'Arnold Press', group: 'Shoulders' },
    { value: 'lateral_raise', label: 'Lateral Raise', group: 'Shoulders' },
    { value: 'front_raise', label: 'Front Raise', group: 'Shoulders' },
    { value: 'rear_delt_fly', label: 'Rear Delt Fly', group: 'Shoulders' },
    { value: 'upright_row', label: 'Upright Row', group: 'Shoulders' },
    // Arms - Biceps
    { value: 'bicep_curl', label: 'Bicep Curl', group: 'Arms' },
    { value: 'barbell_curl', label: 'Barbell Curl', group: 'Arms' },
    { value: 'hammer_curl', label: 'Hammer Curl', group: 'Arms' },
    { value: 'preacher_curl', label: 'Preacher Curl', group: 'Arms' },
    { value: 'concentration_curl', label: 'Concentration Curl', group: 'Arms' },
    { value: 'cable_curl', label: 'Cable Curl', group: 'Arms' },
    // Arms - Triceps
    { value: 'tricep_extension', label: 'Tricep Extension', group: 'Arms' },
    { value: 'tricep_pushdown', label: 'Tricep Pushdown', group: 'Arms' },
    { value: 'skull_crusher', label: 'Skull Crusher', group: 'Arms' },
    { value: 'tricep_dip', label: 'Tricep Dip', group: 'Arms' },
    { value: 'close_grip_bench_press', label: 'Close Grip Bench Press', group: 'Arms' },
    { value: 'tricep_kickback', label: 'Tricep Kickback', group: 'Arms' },
    // Legs - Quadriceps
    { value: 'squat', label: 'Squat', group: 'Legs' },
    { value: 'front_squat', label: 'Front Squat', group: 'Legs' },
    { value: 'goblet_squat', label: 'Goblet Squat', group: 'Legs' },
    { value: 'leg_press', label: 'Leg Press', group: 'Legs' },
    { value: 'leg_extension', label: 'Leg Extension', group: 'Legs' },
    { value: 'lunge', label: 'Lunge', group: 'Legs' },
    { value: 'walking_lunge', label: 'Walking Lunge', group: 'Legs' },
    { value: 'bulgarian_split_squat', label: 'Bulgarian Split Squat', group: 'Legs' },
    { value: 'hack_squat', label: 'Hack Squat', group: 'Legs' },
    // Legs - Hamstrings/Glutes
    { value: 'leg_curl', label: 'Leg Curl', group: 'Legs' },
    { value: 'hip_thrust', label: 'Hip Thrust', group: 'Legs' },
    { value: 'glute_kickback', label: 'Glute Kickback', group: 'Legs' },
    { value: 'good_morning', label: 'Good Morning', group: 'Legs' },
    { value: 'calf_raise', label: 'Calf Raise', group: 'Legs' },
    // Core
    { value: 'crunch', label: 'Crunch', group: 'Core' },
    { value: 'plank', label: 'Plank', group: 'Core' },
    { value: 'russian_twist', label: 'Russian Twist', group: 'Core' },
    { value: 'leg_raise', label: 'Leg Raise', group: 'Core' },
    { value: 'bicycle_crunch', label: 'Bicycle Crunch', group: 'Core' },
    { value: 'ab_wheel_rollout', label: 'Ab Wheel Rollout', group: 'Core' },
    // Full Body
    { value: 'kettlebell_swing', label: 'Kettlebell Swing', group: 'Full Body' },
    { value: 'burpee', label: 'Burpee', group: 'Full Body' },
    { value: 'clean_and_press', label: 'Clean and Press', group: 'Full Body' },
    { value: 'thruster', label: 'Thruster', group: 'Full Body' },
    { value: 'snatch', label: 'Snatch', group: 'Full Body' },
    { value: 'farmers_walk', label: 'Farmers Walk', group: 'Full Body' },
];

// Hybrid race definitions
const HYBRID_RACE_TYPES = [
    { value: 'hyrox', label: 'HYROX' },
    { value: 'athx', label: 'ATHX' },
];

const HYBRID_STATIONS = [
    { value: 'total_time', label: 'Total Time' },
    { value: 'skierg', label: 'SkiErg' },
    { value: 'sled_push', label: 'Sled Push' },
    { value: 'sled_pull', label: 'Sled Pull' },
    { value: 'burpee_broad_jump', label: 'Burpee Broad Jump' },
    { value: 'rowing', label: 'Rowing' },
    { value: 'farmers_carry', label: 'Farmers Carry' },
    { value: 'sandbag_lunges', label: 'Sandbag Lunges' },
    { value: 'wall_balls', label: 'Wall Balls' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/** Convert seconds to HH:MM:SS format */
const secondsToTime = (totalSeconds: number): { hours: number; minutes: number; seconds: number } => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);
    return { hours, minutes, seconds };
};

/** Convert HH:MM:SS to seconds */
const timeToSeconds = (hours: number, minutes: number, seconds: number): number => {
    return hours * 3600 + minutes * 60 + seconds;
};

/** Format seconds as human-readable duration */
const formatDuration = (totalSeconds: number): string => {
    const { hours, minutes, seconds } = secondsToTime(totalSeconds);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/** Format a record value for display based on unit */
const formatRecordValue = (value: number, unit: string): string => {
    switch (unit) {
        case 'seconds':
            return formatDuration(value);
        case 'meters':
            if (value >= 1000) {
                return `${(value / 1000).toFixed(2)} km`;
            }
            return `${value} m`;
        case 'kg':
            return `${value} kg`;
        case 'reps':
            return `${value} reps`;
        default:
            return `${value} ${unit}`;
    }
};

/** Get display name for a record type */
const getRecordDisplayName = (recordType: string): string => {
    // Check cardio records
    const cardio = CARDIO_RECORDS.find(r => r.value === recordType);
    if (cardio) return cardio.label;

    // Check strength records
    for (const suffix of STRENGTH_SUFFIXES) {
        if (recordType.endsWith(suffix.value)) {
            const exerciseName = recordType.slice(0, -suffix.value.length);
            const exercise = STRENGTH_EXERCISES.find(e => e.value === exerciseName);
            if (exercise) {
                return `${exercise.label} ${suffix.label}`;
            }
            // Fallback: convert snake_case to Title Case
            const formatted = exerciseName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `${formatted} ${suffix.label}`;
        }
    }

    // Check hybrid race records
    if (recordType.startsWith('hybrid_race_')) {
        const rest = recordType.slice('hybrid_race_'.length);
        for (const race of HYBRID_RACE_TYPES) {
            if (rest.startsWith(race.value + '_')) {
                const station = rest.slice(race.value.length + 1);
                const stationDef = HYBRID_STATIONS.find(s => s.value === station);
                return `${race.label} ${stationDef?.label || station}`;
            }
        }
    }

    // Fallback: convert snake_case to Title Case
    return recordType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// ============================================================================
// Time Duration Input Component
// ============================================================================

interface DurationInputProps {
    value: number; // Total seconds
    onChange: (seconds: number) => void;
    id?: string;
}

const DurationInput: React.FC<DurationInputProps> = ({ value, onChange, id }) => {
    const { hours, minutes, seconds } = secondsToTime(value);

    const handleChange = (field: 'hours' | 'minutes' | 'seconds', newValue: number) => {
        const updated = {
            hours: field === 'hours' ? newValue : hours,
            minutes: field === 'minutes' ? Math.min(59, newValue) : minutes,
            seconds: field === 'seconds' ? Math.min(59, newValue) : seconds,
        };
        onChange(timeToSeconds(updated.hours, updated.minutes, updated.seconds));
    };

    return (
        <Stack direction="horizontal" gap="xs" align="center">
            <Input
                id={id}
                type="number"
                min={0}
                max={99}
                value={hours}
                onChange={(e) => handleChange('hours', parseInt(e.target.value) || 0)}
                style={{ width: '60px', textAlign: 'center' }}
                aria-label="Hours"
            />
            <span>:</span>
            <Input
                type="number"
                min={0}
                max={59}
                value={minutes.toString().padStart(2, '0')}
                onChange={(e) => handleChange('minutes', parseInt(e.target.value) || 0)}
                style={{ width: '60px', textAlign: 'center' }}
                aria-label="Minutes"
            />
            <span>:</span>
            <Input
                type="number"
                min={0}
                max={59}
                value={seconds.toString().padStart(2, '0')}
                onChange={(e) => handleChange('seconds', parseInt(e.target.value) || 0)}
                style={{ width: '60px', textAlign: 'center' }}
                aria-label="Seconds"
            />
            <Paragraph size="sm" muted>(HH:MM:SS)</Paragraph>
        </Stack>
    );
};

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
    const [showNewRecord, setShowNewRecord] = useState(false);

    // New record form state (category-based)
    const [newRecordCategory, setNewRecordCategory] = useState<RecordCategory | ''>('');
    const [newCardioType, setNewCardioType] = useState('');
    const [newStrengthExercise, setNewStrengthExercise] = useState('');
    const [newStrengthSuffix, setNewStrengthSuffix] = useState('');
    const [newHybridRace, setNewHybridRace] = useState('');
    const [newHybridStation, setNewHybridStation] = useState('');
    const [newRecordValue, setNewRecordValue] = useState(0);

    // Computed values for the new record form
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

    // Reset form helper
    const resetNewRecordForm = () => {
        setNewRecordCategory('');
        setNewCardioType('');
        setNewStrengthExercise('');
        setNewStrengthSuffix('');
        setNewHybridRace('');
        setNewHybridStation('');
        setNewRecordValue(0);
        setShowNewRecord(false);
    };

    // Group exercises by muscle group for better UX
    const groupedExercises = useMemo(() => {
        const groups: Record<string, typeof STRENGTH_EXERCISES> = {};
        for (const ex of STRENGTH_EXERCISES) {
            if (!groups[ex.group]) groups[ex.group] = [];
            groups[ex.group].push(ex);
        }
        return groups;
    }, []);

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
        if (!newRecordType || !newRecordUnit) return;
        try {
            await api.post('/users/me/personal-records', {
                recordType: newRecordType,
                value: newRecordValue,
                unit: newRecordUnit,
            });
            resetNewRecordForm();
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
                                    <Card key={counter.id} variant="elevated">
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
                                    </Card>
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
                                onClick={() => showNewRecord ? resetNewRecordForm() : setShowNewRecord(true)}
                            >
                                {showNewRecord ? 'Cancel' : '+ Add Record'}
                            </Button>
                        </Stack>

                        {showNewRecord && (
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
                                                // Reset sub-selections
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

                                    {/* Step 3: Value Input (shown when record type is determined) */}
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
                                            onClick={handleCreateRecord}
                                            disabled={!newRecordType || !newRecordUnit || newRecordValue <= 0}
                                        >
                                            Create Record
                                        </Button>
                                        <Button variant="text" onClick={resetNewRecordForm}>
                                            Cancel
                                        </Button>
                                    </Stack>
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
                                                    <Button size="small" variant="danger" onClick={() => handleDeleteRecord(record.recordType)}>
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
            </Stack>
        </PageLayout>
    );
};

export default EnricherDataPage;
