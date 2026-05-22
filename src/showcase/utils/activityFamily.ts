export type ActivityFamily =
  | 'run' | 'ride' | 'swim' | 'hike'
  | 'strength' | 'crossfit' | 'hiit' | 'yoga'
  | 'sport' | 'paddle' | 'other';

export interface FamilyStamp {
  cls: string;   // CSS suffix: act__stamp--{cls}
}

const FAMILY_MAP: Record<string, ActivityFamily> = {
  ACTIVITY_TYPE_RUN: 'run',
  ACTIVITY_TYPE_TRAIL_RUN: 'run',
  ACTIVITY_TYPE_VIRTUAL_RUN: 'run',
  ACTIVITY_TYPE_RIDE: 'ride',
  ACTIVITY_TYPE_GRAVEL_RIDE: 'ride',
  ACTIVITY_TYPE_MOUNTAIN_BIKE_RIDE: 'ride',
  ACTIVITY_TYPE_EBIKE_RIDE: 'ride',
  ACTIVITY_TYPE_EMOUNTAIN_BIKE_RIDE: 'ride',
  ACTIVITY_TYPE_VIRTUAL_RIDE: 'ride',
  ACTIVITY_TYPE_VELOMOBILE: 'ride',
  ACTIVITY_TYPE_HANDCYCLE: 'ride',
  ACTIVITY_TYPE_ROLLER_SKI: 'ride',
  ACTIVITY_TYPE_SWIM: 'swim',
  ACTIVITY_TYPE_HIKE: 'hike',
  ACTIVITY_TYPE_WALK: 'hike',
  ACTIVITY_TYPE_WEIGHT_TRAINING: 'strength',
  ACTIVITY_TYPE_WORKOUT: 'strength',
  ACTIVITY_TYPE_CROSSFIT: 'crossfit',
  ACTIVITY_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING: 'hiit',
  ACTIVITY_TYPE_ELLIPTICAL: 'hiit',
  ACTIVITY_TYPE_STAIR_STEPPER: 'hiit',
  ACTIVITY_TYPE_YOGA: 'yoga',
  ACTIVITY_TYPE_PILATES: 'yoga',
  ACTIVITY_TYPE_TENNIS: 'sport',
  ACTIVITY_TYPE_TABLE_TENNIS: 'sport',
  ACTIVITY_TYPE_BADMINTON: 'sport',
  ACTIVITY_TYPE_RACQUETBALL: 'sport',
  ACTIVITY_TYPE_SQUASH: 'sport',
  ACTIVITY_TYPE_PICKLEBALL: 'sport',
  ACTIVITY_TYPE_SOCCER: 'sport',
  ACTIVITY_TYPE_STAND_UP_PADDLING: 'paddle',
  ACTIVITY_TYPE_KAYAKING: 'paddle',
  ACTIVITY_TYPE_CANOEING: 'paddle',
  ACTIVITY_TYPE_ROWING: 'paddle',
  ACTIVITY_TYPE_VIRTUAL_ROW: 'paddle',
  ACTIVITY_TYPE_SURFING: 'paddle',
  ACTIVITY_TYPE_WINDSURF: 'paddle',
  ACTIVITY_TYPE_KITESURF: 'paddle',
  ACTIVITY_TYPE_SAIL: 'paddle',
};

export function resolveFamily(activityType: string | undefined): ActivityFamily {
  if (!activityType) return 'other';
  return FAMILY_MAP[activityType] ?? 'other';
}

export const FAMILY_STAMP_CLASS: Record<ActivityFamily, string> = {
  run:      'run',
  ride:     'ride',
  swim:     'swim',
  hike:     'hike',
  strength: 'strength',
  crossfit: 'crossfit',
  hiit:     'hiit',
  yoga:     'yoga',
  sport:    'sport',
  paddle:   'paddle',
  other:    'other',
};
