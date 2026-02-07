// ============================================================================
// PR Record Type Definitions
// ============================================================================

export interface CardioRecordDef {
    value: string;
    label: string;
    unit: 'seconds' | 'meters';
}

export const CARDIO_RECORDS: CardioRecordDef[] = [
    { value: 'fastest_5k', label: 'Fastest 5K', unit: 'seconds' },
    { value: 'fastest_10k', label: 'Fastest 10K', unit: 'seconds' },
    { value: 'fastest_half_marathon', label: 'Fastest Half Marathon', unit: 'seconds' },
    { value: 'fastest_marathon', label: 'Fastest Marathon', unit: 'seconds' },
    { value: 'longest_run', label: 'Longest Run', unit: 'meters' },
    { value: 'longest_ride', label: 'Longest Ride', unit: 'meters' },
    { value: 'highest_elevation_gain', label: 'Highest Elevation Gain', unit: 'meters' },
];

export interface StrengthRecordSuffix {
    value: string;
    label: string;
    unit: 'kg' | 'reps';
}

export const STRENGTH_SUFFIXES: StrengthRecordSuffix[] = [
    { value: '_1rm', label: '1 Rep Max', unit: 'kg' },
    { value: '_volume', label: 'Session Volume', unit: 'kg' },
    { value: '_reps', label: 'Max Reps', unit: 'reps' },
];

// Canonical exercises from the backend taxonomy
export const STRENGTH_EXERCISES = [
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
export const HYBRID_RACE_TYPES = [
    { value: 'hyrox', label: 'HYROX' },
    { value: 'athx', label: 'ATHX' },
];

export const HYBRID_STATIONS = [
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
