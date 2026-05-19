import type { components } from '../../shared/api/schema-public';

export type ShowcaseCategory =
  | 'cardio-distance'
  | 'cardio-time'
  | 'strength'
  | 'sport'
  | 'untraditional';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

const CARDIO_DISTANCE = new Set([
  'ACTIVITY_TYPE_RUN',
  'ACTIVITY_TYPE_TRAIL_RUN',
  'ACTIVITY_TYPE_VIRTUAL_RUN',
  'ACTIVITY_TYPE_RIDE',
  'ACTIVITY_TYPE_GRAVEL_RIDE',
  'ACTIVITY_TYPE_MOUNTAIN_BIKE_RIDE',
  'ACTIVITY_TYPE_EMOUNTAIN_BIKE_RIDE',
  'ACTIVITY_TYPE_EBIKE_RIDE',
  'ACTIVITY_TYPE_VIRTUAL_RIDE',
  'ACTIVITY_TYPE_HANDCYCLE',
  'ACTIVITY_TYPE_VELOMOBILE',
  'ACTIVITY_TYPE_ROLLER_SKI',
  'ACTIVITY_TYPE_NORDIC_SKI',
  'ACTIVITY_TYPE_BACKCOUNTRY_SKI',
  'ACTIVITY_TYPE_ALPINE_SKI',
  'ACTIVITY_TYPE_SNOWSHOE',
  'ACTIVITY_TYPE_ICE_SKATE',
  'ACTIVITY_TYPE_INLINE_SKATE',
  'ACTIVITY_TYPE_WALK',
  'ACTIVITY_TYPE_HIKE',
  'ACTIVITY_TYPE_WHEELCHAIR',
  'ACTIVITY_TYPE_KAYAKING',
  'ACTIVITY_TYPE_CANOEING',
  'ACTIVITY_TYPE_ROWING',
  'ACTIVITY_TYPE_VIRTUAL_ROW',
  'ACTIVITY_TYPE_STAND_UP_PADDLING',
  'ACTIVITY_TYPE_SWIM',
  'ACTIVITY_TYPE_WINDSURF',
  'ACTIVITY_TYPE_KITESURF',
  'ACTIVITY_TYPE_SAIL',
  'ACTIVITY_TYPE_SURFING',
  'ACTIVITY_TYPE_SKATEBOARD',
]);

const CARDIO_TIME = new Set([
  'ACTIVITY_TYPE_ELLIPTICAL',
  'ACTIVITY_TYPE_STAIR_STEPPER',
  'ACTIVITY_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING',
  'ACTIVITY_TYPE_PILATES',
  'ACTIVITY_TYPE_YOGA',
]);

const SPORT = new Set([
  'ACTIVITY_TYPE_TENNIS',
  'ACTIVITY_TYPE_BADMINTON',
  'ACTIVITY_TYPE_PICKLEBALL',
  'ACTIVITY_TYPE_RACQUETBALL',
  'ACTIVITY_TYPE_SQUASH',
  'ACTIVITY_TYPE_TABLE_TENNIS',
  'ACTIVITY_TYPE_SOCCER',
  'ACTIVITY_TYPE_GOLF',
  'ACTIVITY_TYPE_ROCK_CLIMBING',
]);

export function resolveCategory(activity: ShowcasedActivity): ShowcaseCategory {
  // 1. Strength override: if strength_sets is populated, force strength
  const hasStrengthSets = activity.activityData?.sessions?.some(
    (s) => (s.strengthSets?.length ?? 0) > 0
  );
  if (hasStrengthSets) return 'strength';

  const t = activity.activityType ?? '';

  // 2. Direct type lookup
  if (CARDIO_DISTANCE.has(t)) return 'cardio-distance';
  if (CARDIO_TIME.has(t)) return 'cardio-time';
  if (SPORT.has(t)) return 'sport';

  // 3. WORKOUT/CROSSFIT without strength sets = cardio-time
  if (t === 'ACTIVITY_TYPE_WORKOUT' || t === 'ACTIVITY_TYPE_CROSSFIT') return 'cardio-time';

  return 'untraditional';
}

export const CATEGORY_ACCENT: Record<ShowcaseCategory, string> = {
  'cardio-distance': 'var(--fg-cyan)',
  'cardio-time':     'var(--fg-violet)',
  strength:          'var(--fg-pink)',
  sport:             'var(--fg-gold)',
  untraditional:     'var(--fg-paper)',
};

export const CATEGORY_STAMP_CLASS: Record<ShowcaseCategory, string> = {
  'cardio-distance': 'stamp--cardio-distance',
  'cardio-time':     'stamp--cardio-time',
  strength:          'stamp--strength',
  sport:             'stamp--sport',
  untraditional:     'stamp--untraditional',
};

export const CATEGORY_EMOJI: Record<ShowcaseCategory, string> = {
  'cardio-distance': '🏃',
  'cardio-time':     '⏱️',
  strength:          '🏋️',
  sport:             '🏅',
  untraditional:     '✨',
};
