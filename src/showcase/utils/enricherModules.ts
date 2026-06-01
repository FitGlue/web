import type { ShowcaseCategory } from './activityCategory';
import type { components } from '../../shared/api/schema-public';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

export type ModuleKey =
  | 'parkrun'
  | 'hybrid-race-segments'
  | 'ai-story'
  | 'milestone-callout'
  | 'pr-callout'
  | 'description'
  | 'tags'
  | 'photos'
  | 'map'
  | 'heart-rate'
  | 'zones'
  | 'pace'
  | 'speed'
  | 'cadence'
  | 'elevation'
  | 'power'
  | 'effort'
  | 'calories'
  | 'training-load'
  | 'running-dynamics'
  | 'intervals'
  | 'muscle-heatmap'
  | 'set-list'
  | 'recovery'
  | 'streak'
  | 'goals'
  | 'weather'
  | 'temperature'
  | 'spotify'
  | 'auto-increment-footer'
  | 'source-link-footer';

// Where each ModuleKey is rendered. TypeScript enforces that every key in the
// union is listed here — add a new ModuleKey to the union and this will fail
// to compile until you declare its placement.
//
//   'page'      — rendered directly in ShowcaseActivityPage (outside ModuleGrid)
//   'pre-grid'  — full-width row above the module grid (ModuleGrid preGrid switch)
//   'grid'      — card inside the 12-col module grid (ModuleGrid gridModules switch)
//   'footer'    — enricher footer strip (ModuleGrid footer switch)
export const MODULE_PLACEMENT = {
  'parkrun':               'page',
  'hybrid-race-segments':  'pre-grid',
  'ai-story':              'pre-grid',
  'milestone-callout':     'pre-grid',
  'description':           'pre-grid',
  'tags':                  'pre-grid',
  'photos':                'pre-grid',
  'map':                   'pre-grid',
  'pr-callout':            'grid',
  'heart-rate':            'grid',
  'zones':                 'grid',
  'pace':                  'grid',
  'speed':                 'grid',
  'cadence':               'grid',
  'elevation':             'grid',
  'power':                 'grid',
  'effort':                'grid',
  'calories':              'grid',
  'training-load':         'grid',
  'running-dynamics':      'grid',
  'intervals':             'grid',
  'muscle-heatmap':        'grid',
  'set-list':              'grid',
  'recovery':              'grid',
  'streak':                'grid',
  'goals':                 'grid',
  'weather':               'grid',
  'temperature':           'grid',
  'spotify':               'grid',
  'auto-increment-footer': 'footer',
  'source-link-footer':    'footer',
} satisfies Record<ModuleKey, 'page' | 'pre-grid' | 'grid' | 'footer'>;

// Enricher key → module key mapping
const ENRICHER_TO_MODULE: Record<string, ModuleKey | null> = {
  ENRICHER_PROVIDER_PARKRUN:              'parkrun',
  ENRICHER_PROVIDER_HYBRID_RACE_TAGGER:   'hybrid-race-segments',
  ENRICHER_PROVIDER_AI_COMPANION:         'ai-story',
  ENRICHER_PROVIDER_DISTANCE_MILESTONES:  'milestone-callout',
  ENRICHER_PROVIDER_PERSONAL_RECORDS:     'pr-callout',
  ENRICHER_PROVIDER_HEART_RATE_SUMMARY:   'heart-rate',
  ENRICHER_PROVIDER_FIT_FILE_HEART_RATE:  null, // booster-timeline only
  ENRICHER_PROVIDER_FITBIT_HEART_RATE:    null, // booster-timeline only
  ENRICHER_PROVIDER_HEART_RATE_ZONES:     'zones',
  ENRICHER_PROVIDER_PACE_SUMMARY:         'pace',
  ENRICHER_PROVIDER_SPEED_SUMMARY:        'speed',
  ENRICHER_PROVIDER_CADENCE_SUMMARY:      'cadence',
  ENRICHER_PROVIDER_POWER_SUMMARY:        'power',
  ENRICHER_PROVIDER_ELEVATION_SUMMARY:    'elevation',
  ENRICHER_PROVIDER_EFFORT_SCORE:         'effort',
  ENRICHER_PROVIDER_CALORIES_BURNED:      'calories',
  ENRICHER_PROVIDER_TRAINING_LOAD:        'training-load',
  ENRICHER_PROVIDER_RUNNING_DYNAMICS:     'running-dynamics',
  ENRICHER_PROVIDER_INTERVALS:            'intervals',
  ENRICHER_PROVIDER_MUSCLE_HEATMAP:       'muscle-heatmap',
  ENRICHER_PROVIDER_MUSCLE_HEATMAP_IMAGE: 'muscle-heatmap', // upgrades the heatmap module
  ENRICHER_PROVIDER_RECOVERY_ADVISOR:     'recovery',
  ENRICHER_PROVIDER_STREAK_TRACKER:       'streak',
  ENRICHER_PROVIDER_GOAL_TRACKER:         'goals',
  ENRICHER_PROVIDER_WEATHER:              'weather',
  ENRICHER_PROVIDER_TEMPERATURE_SUMMARY:  'temperature',
  ENRICHER_PROVIDER_SPOTIFY_TRACKS:       'spotify',
  ENRICHER_PROVIDER_AUTO_INCREMENT:       'auto-increment-footer',
  ENRICHER_PROVIDER_SOURCE_LINK:          'source-link-footer',
  // always-hidden (booster timeline only)
  ENRICHER_PROVIDER_CONDITION_MATCHER:    null,
  ENRICHER_PROVIDER_ACTIVITY_FILTER:      null,
  ENRICHER_PROVIDER_LOGIC_GATE:           null,
  ENRICHER_PROVIDER_TYPE_MAPPER:          null,
  ENRICHER_PROVIDER_AI_ACTIVITY_TYPE:     null,
  ENRICHER_PROVIDER_USER_INPUT:           null,
  ENRICHER_PROVIDER_MANUAL_WORKOUT_ENTRY: null,
  ENRICHER_PROVIDER_PHOTO_UPLOAD:         null,
  ENRICHER_PROVIDER_VIRTUAL_GPS:          null,
  ENRICHER_PROVIDER_AI_BANNER:            null, // handled separately (page-level hero)
  ENRICHER_PROVIDER_ROUTE_THUMBNAIL:      null, // handled separately (map module)
  ENRICHER_PROVIDER_LOCATION_NAMING:      null, // folds into hero meta
  ENRICHER_PROVIDER_BRANDING:             null,
  ENRICHER_PROVIDER_WORKOUT_SUMMARY:      null,
};

function hasGps(activity: ShowcasedActivity): boolean {
  return (activity.activityData?.sessions ?? []).some((s) =>
    (s.laps ?? []).some((l) =>
      (l.records ?? []).some(
        (r) => r.positionLat !== undefined && r.positionLat !== 0 && r.positionLong !== undefined && r.positionLong !== 0
      )
    )
  );
}

export function buildModuleOrder(
  activity: ShowcasedActivity,
  category: ShowcaseCategory,
  applied: Set<string>
): ModuleKey[] {
  const has = (k: string) => applied.has(k);
  const modules: ModuleKey[] = [];
  const seen = new Set<ModuleKey>();

  function push(key: ModuleKey) {
    if (!seen.has(key)) {
      seen.add(key);
      modules.push(key);
    }
  }

  // 1. Special types first
  if (has('ENRICHER_PROVIDER_PARKRUN') && activity.activityType === 'ACTIVITY_TYPE_RUN') {
    push('parkrun');
  }
  if (has('ENRICHER_PROVIDER_HYBRID_RACE_TAGGER')) {
    push('hybrid-race-segments');
  }

  // 2. User-written description first (most personal content)
  if (activity.description) push('description');

  // 3. AI story
  if (has('ENRICHER_PROVIDER_AI_COMPANION')) push('ai-story');

  // 4. Achievements
  if (has('ENRICHER_PROVIDER_DISTANCE_MILESTONES')) push('milestone-callout');
  if (has('ENRICHER_PROVIDER_PERSONAL_RECORDS')) push('pr-callout');

  // 5. Tags and photos
  if ((activity.tags ?? []).length > 0) push('tags');
  if ((activity.photoUrls ?? []).length > 0) push('photos');

  // 5. Map — cardio-distance with GPS
  if (category === 'cardio-distance' && hasGps(activity)) push('map');

  // 6. Core metrics — order by category
  switch (category) {
    case 'cardio-distance':
      if (has('ENRICHER_PROVIDER_HEART_RATE_SUMMARY')) push('heart-rate');
      if (has('ENRICHER_PROVIDER_HEART_RATE_ZONES')) push('zones');
      if (has('ENRICHER_PROVIDER_PACE_SUMMARY')) push('pace');
      if (has('ENRICHER_PROVIDER_SPEED_SUMMARY')) push('speed');
      if (has('ENRICHER_PROVIDER_CADENCE_SUMMARY')) push('cadence');
      if (has('ENRICHER_PROVIDER_ELEVATION_SUMMARY')) push('elevation');
      if (has('ENRICHER_PROVIDER_POWER_SUMMARY')) push('power');
      if (has('ENRICHER_PROVIDER_EFFORT_SCORE')) push('effort');
      if (has('ENRICHER_PROVIDER_CALORIES_BURNED')) push('calories');
      if (has('ENRICHER_PROVIDER_TRAINING_LOAD')) push('training-load');
      if (has('ENRICHER_PROVIDER_RUNNING_DYNAMICS')) push('running-dynamics');
      if (has('ENRICHER_PROVIDER_INTERVALS')) push('intervals');
      break;

    case 'cardio-time':
      if (has('ENRICHER_PROVIDER_HEART_RATE_SUMMARY')) push('heart-rate');
      if (has('ENRICHER_PROVIDER_HEART_RATE_ZONES')) push('zones');
      if (has('ENRICHER_PROVIDER_CADENCE_SUMMARY')) push('cadence');
      if (has('ENRICHER_PROVIDER_EFFORT_SCORE')) push('effort');
      if (has('ENRICHER_PROVIDER_CALORIES_BURNED')) push('calories');
      if (has('ENRICHER_PROVIDER_TRAINING_LOAD')) push('training-load');
      break;

    case 'strength':
      if (has('ENRICHER_PROVIDER_MUSCLE_HEATMAP') || has('ENRICHER_PROVIDER_MUSCLE_HEATMAP_IMAGE')) push('muscle-heatmap');
      push('set-list');
      if (has('ENRICHER_PROVIDER_HEART_RATE_SUMMARY')) push('heart-rate');
      if (has('ENRICHER_PROVIDER_HEART_RATE_ZONES')) push('zones');
      if (has('ENRICHER_PROVIDER_EFFORT_SCORE')) push('effort');
      if (has('ENRICHER_PROVIDER_CALORIES_BURNED')) push('calories');
      if (has('ENRICHER_PROVIDER_TRAINING_LOAD')) push('training-load');
      break;

    case 'sport':
      if (has('ENRICHER_PROVIDER_HEART_RATE_SUMMARY')) push('heart-rate');
      if (has('ENRICHER_PROVIDER_HEART_RATE_ZONES')) push('zones');
      if (has('ENRICHER_PROVIDER_EFFORT_SCORE')) push('effort');
      if (has('ENRICHER_PROVIDER_CALORIES_BURNED')) push('calories');
      break;

    case 'untraditional':
      if (has('ENRICHER_PROVIDER_HEART_RATE_SUMMARY')) push('heart-rate');
      if (has('ENRICHER_PROVIDER_CALORIES_BURNED')) push('calories');
      break;
  }

  // 7. Context modules
  if (has('ENRICHER_PROVIDER_RECOVERY_ADVISOR')) push('recovery');
  if (has('ENRICHER_PROVIDER_STREAK_TRACKER')) push('streak');
  if (has('ENRICHER_PROVIDER_GOAL_TRACKER')) push('goals');
  if (has('ENRICHER_PROVIDER_WEATHER') && category === 'cardio-distance') push('weather');
  if (has('ENRICHER_PROVIDER_TEMPERATURE_SUMMARY')) push('temperature');
  if (has('ENRICHER_PROVIDER_SPOTIFY_TRACKS')) push('spotify');

  // 8. Footer enrichers
  if (has('ENRICHER_PROVIDER_AUTO_INCREMENT')) push('auto-increment-footer');
  if (has('ENRICHER_PROVIDER_SOURCE_LINK')) push('source-link-footer');

  return modules;
}

export { ENRICHER_TO_MODULE };
