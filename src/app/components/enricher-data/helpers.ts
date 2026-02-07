import {
    CARDIO_RECORDS,
    STRENGTH_SUFFIXES,
    STRENGTH_EXERCISES,
    HYBRID_RACE_TYPES,
    HYBRID_STATIONS,
} from './constants';

export type RecordCategory = 'cardio' | 'strength' | 'hybrid';

/** Convert seconds to HH:MM:SS format */
export const secondsToTime = (totalSeconds: number): { hours: number; minutes: number; seconds: number } => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);
    return { hours, minutes, seconds };
};

/** Convert HH:MM:SS to seconds */
export const timeToSeconds = (hours: number, minutes: number, seconds: number): number => {
    return hours * 3600 + minutes * 60 + seconds;
};

/** Format seconds as human-readable duration */
export const formatDuration = (totalSeconds: number): string => {
    const { hours, minutes, seconds } = secondsToTime(totalSeconds);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/** Format a record value for display based on unit */
export const formatRecordValue = (value: number, unit: string): string => {
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
export const getRecordDisplayName = (recordType: string): string => {
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

/** Get friendly label for booster IDs */
export const getBoosterLabel = (id: string): string => {
    if (id.startsWith('goal_tracker_')) {
        const parts = id.replace('goal_tracker_', '').split('_');
        const period = parts[0] === 'week' ? 'Weekly' : parts[0] === 'year' ? 'Yearly' : 'Monthly';
        const metric = parts.slice(1).join('_');
        const metricLabel = metric === 'distance' ? 'Distance' : metric === 'duration' ? 'Duration' : metric === 'activities' ? 'Activities' : metric === 'elevation' ? 'Elevation' : metric;
        return `${period} ${metricLabel}`;
    }
    if (id.startsWith('streak_tracker_')) {
        const actType = id.replace('streak_tracker_', '');
        return actType === 'any' ? 'All Activities' : actType.charAt(0).toUpperCase() + actType.slice(1);
    }
    if (id.startsWith('distance_milestones_')) {
        const sport = id.replace('distance_milestones_', '');
        return sport === 'any' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1);
    }
    return id;
};

/** Format a date string for display */
export const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
};

/** Group exercises by muscle group for select dropdown */
export const getGroupedExercises = (): Record<string, typeof STRENGTH_EXERCISES> => {
    const groups: Record<string, typeof STRENGTH_EXERCISES> = {};
    for (const ex of STRENGTH_EXERCISES) {
        if (!groups[ex.group]) groups[ex.group] = [];
        groups[ex.group].push(ex);
    }
    return groups;
};
