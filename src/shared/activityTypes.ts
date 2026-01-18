/**
 * Activity type formatting utility
 * Mirrors standardized_activity.proto ActivityType enum values
 *
 * This is the single source of truth for activity type display names.
 * Import this instead of defining local mappings.
 */

/**
 * ActivityType enum values matching standardized_activity.proto
 * Keep in sync with server/src/proto/standardized_activity.proto
 */
export enum ActivityType {
  ACTIVITY_TYPE_UNSPECIFIED = 0,
  ACTIVITY_TYPE_ALPINE_SKI = 1,
  ACTIVITY_TYPE_BACKCOUNTRY_SKI = 2,
  ACTIVITY_TYPE_BADMINTON = 3,
  ACTIVITY_TYPE_CANOEING = 4,
  ACTIVITY_TYPE_CROSSFIT = 5,
  ACTIVITY_TYPE_EBIKE_RIDE = 6,
  ACTIVITY_TYPE_ELLIPTICAL = 7,
  ACTIVITY_TYPE_EMOUNTAIN_BIKE_RIDE = 8,
  ACTIVITY_TYPE_GOLF = 9,
  ACTIVITY_TYPE_GRAVEL_RIDE = 10,
  ACTIVITY_TYPE_HANDCYCLE = 11,
  ACTIVITY_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING = 12,
  ACTIVITY_TYPE_HIKE = 13,
  ACTIVITY_TYPE_ICE_SKATE = 14,
  ACTIVITY_TYPE_INLINE_SKATE = 15,
  ACTIVITY_TYPE_KAYAKING = 16,
  ACTIVITY_TYPE_KITESURF = 17,
  ACTIVITY_TYPE_MOUNTAIN_BIKE_RIDE = 18,
  ACTIVITY_TYPE_NORDIC_SKI = 19,
  ACTIVITY_TYPE_PICKLEBALL = 20,
  ACTIVITY_TYPE_PILATES = 21,
  ACTIVITY_TYPE_RACQUETBALL = 22,
  ACTIVITY_TYPE_RIDE = 23,
  ACTIVITY_TYPE_ROCK_CLIMBING = 24,
  ACTIVITY_TYPE_ROLLER_SKI = 25,
  ACTIVITY_TYPE_ROWING = 26,
  ACTIVITY_TYPE_RUN = 27,
  ACTIVITY_TYPE_SAIL = 28,
  ACTIVITY_TYPE_SKATEBOARD = 29,
  ACTIVITY_TYPE_SNOWBOARD = 30,
  ACTIVITY_TYPE_SNOWSHOE = 31,
  ACTIVITY_TYPE_SOCCER = 32,
  ACTIVITY_TYPE_SQUASH = 33,
  ACTIVITY_TYPE_STAIR_STEPPER = 34,
  ACTIVITY_TYPE_STAND_UP_PADDLING = 35,
  ACTIVITY_TYPE_SURFING = 36,
  ACTIVITY_TYPE_SWIM = 37,
  ACTIVITY_TYPE_TABLE_TENNIS = 38,
  ACTIVITY_TYPE_TENNIS = 39,
  ACTIVITY_TYPE_TRAIL_RUN = 40,
  ACTIVITY_TYPE_VELOMOBILE = 41,
  ACTIVITY_TYPE_VIRTUAL_RIDE = 42,
  ACTIVITY_TYPE_VIRTUAL_ROW = 43,
  ACTIVITY_TYPE_VIRTUAL_RUN = 44,
  ACTIVITY_TYPE_WALK = 45,
  ACTIVITY_TYPE_WEIGHT_TRAINING = 46,
  ACTIVITY_TYPE_WHEELCHAIR = 47,
  ACTIVITY_TYPE_WINDSURF = 48,
  ACTIVITY_TYPE_WORKOUT = 49,
  ACTIVITY_TYPE_YOGA = 50,
}

/**
 * Convert enum key to display name
 * e.g., "ACTIVITY_TYPE_WEIGHT_TRAINING" -> "Weight Training"
 */
function enumKeyToDisplayName(key: string): string {
  return key
    .replace(/^ACTIVITY_TYPE_/, '')
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/Ebike/g, 'E-Bike')
    .replace(/Emountain/g, 'E-Mountain')
    .replace(/High Intensity Interval Training/g, 'HIIT');
}

/**
 * Map of ActivityType enum values to human-readable names
 * Generated from the enum to avoid manual maintenance
 */
export const ACTIVITY_TYPE_NAMES: Record<number, string> = Object.fromEntries(
  Object.entries(ActivityType)
    .filter(([key, value]) => typeof value === 'number' && key !== 'UNRECOGNIZED')
    .map(([key, value]) => [value as number, enumKeyToDisplayName(key)])
);

// Override UNSPECIFIED to show "Workout" instead of "Unspecified"
ACTIVITY_TYPE_NAMES[0] = 'Workout';

/**
 * Format activity type from enum number or string to readable string
 *
 * @param type - Activity type as number, numeric string, or PascalCase string (e.g., "WeightTraining")
 * @returns Human-readable activity type name
 */
export const formatActivityType = (type?: number | string): string => {
  if (type === undefined || type === null) {
    return 'Workout';
  }

  // Handle string types
  if (typeof type === 'string') {
    // If it's a number string, parse it
    const numericType = parseInt(type, 10);
    if (!isNaN(numericType)) {
      return ACTIVITY_TYPE_NAMES[numericType] || 'Workout';
    }

    // Already a formatted string like "WeightTraining" - format it nicely
    return type
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/  +/g, ' ');
  }

  return ACTIVITY_TYPE_NAMES[type] || 'Workout';
};
