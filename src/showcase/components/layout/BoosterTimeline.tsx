import React from 'react';
import { getEnricherInfo } from '../../utils/format';

// Canonical ordered list of all enricher providers (spec Part 3, sections A–H)
// Order matches the spec's category order and the archetype HTML timeline.
const ALL_ENRICHERS: string[] = [
  // A · Hero / page-shaping
  'ENRICHER_PROVIDER_AI_BANNER',
  'ENRICHER_PROVIDER_AI_COMPANION',
  'ENRICHER_PROVIDER_ROUTE_THUMBNAIL',
  // H · Gate / filter (shown early in firing order)
  'ENRICHER_PROVIDER_CONDITION_MATCHER',
  'ENRICHER_PROVIDER_ACTIVITY_FILTER',
  'ENRICHER_PROVIDER_LOGIC_GATE',
  'ENRICHER_PROVIDER_TYPE_MAPPER',
  'ENRICHER_PROVIDER_AI_ACTIVITY_TYPE',
  'ENRICHER_PROVIDER_AUTO_INCREMENT',
  'ENRICHER_PROVIDER_SOURCE_LINK',
  // F · Special-type
  'ENRICHER_PROVIDER_PARKRUN',
  'ENRICHER_PROVIDER_HYBRID_RACE_TAGGER',
  'ENRICHER_PROVIDER_RUNNING_DYNAMICS',
  // B · Core metrics
  'ENRICHER_PROVIDER_FITBIT_HEART_RATE',
  'ENRICHER_PROVIDER_FIT_FILE_HEART_RATE',
  'ENRICHER_PROVIDER_HEART_RATE_SUMMARY',
  'ENRICHER_PROVIDER_HEART_RATE_ZONES',
  'ENRICHER_PROVIDER_PACE_SUMMARY',
  'ENRICHER_PROVIDER_SPEED_SUMMARY',
  'ENRICHER_PROVIDER_CADENCE_SUMMARY',
  'ENRICHER_PROVIDER_POWER_SUMMARY',
  'ENRICHER_PROVIDER_ELEVATION_SUMMARY',
  'ENRICHER_PROVIDER_EFFORT_SCORE',
  'ENRICHER_PROVIDER_CALORIES_BURNED',
  'ENRICHER_PROVIDER_TRAINING_LOAD',
  'ENRICHER_PROVIDER_WORKOUT_SUMMARY',
  // D · Strength
  'ENRICHER_PROVIDER_MUSCLE_HEATMAP',
  'ENRICHER_PROVIDER_MUSCLE_HEATMAP_IMAGE',
  // E · Achievement
  'ENRICHER_PROVIDER_PERSONAL_RECORDS',
  'ENRICHER_PROVIDER_DISTANCE_MILESTONES',
  'ENRICHER_PROVIDER_GOAL_TRACKER',
  // C · Context
  'ENRICHER_PROVIDER_RECOVERY_ADVISOR',
  'ENRICHER_PROVIDER_STREAK_TRACKER',
  'ENRICHER_PROVIDER_INTERVALS',
  'ENRICHER_PROVIDER_LOCATION_NAMING',
  'ENRICHER_PROVIDER_WEATHER',
  // G · External
  'ENRICHER_PROVIDER_SPOTIFY_TRACKS',
  // H · Always-hidden (remaining)
  'ENRICHER_PROVIDER_USER_INPUT',
  'ENRICHER_PROVIDER_MANUAL_WORKOUT_ENTRY',
  'ENRICHER_PROVIDER_PHOTO_UPLOAD',
  'ENRICHER_PROVIDER_VIRTUAL_GPS',
];

// Enrichers that produce typed visual output → aurora gradient dot
const TYPED_OUTPUT_ENRICHERS = new Set([
  'ENRICHER_PROVIDER_HEART_RATE_SUMMARY',
  'ENRICHER_PROVIDER_HEART_RATE_ZONES',
  'ENRICHER_PROVIDER_PACE_SUMMARY',
  'ENRICHER_PROVIDER_SPEED_SUMMARY',
  'ENRICHER_PROVIDER_CADENCE_SUMMARY',
  'ENRICHER_PROVIDER_POWER_SUMMARY',
  'ENRICHER_PROVIDER_ELEVATION_SUMMARY',
  'ENRICHER_PROVIDER_EFFORT_SCORE',
  'ENRICHER_PROVIDER_CALORIES_BURNED',
  'ENRICHER_PROVIDER_TRAINING_LOAD',
  'ENRICHER_PROVIDER_WORKOUT_SUMMARY',
  'ENRICHER_PROVIDER_RECOVERY_ADVISOR',
  'ENRICHER_PROVIDER_STREAK_TRACKER',
  'ENRICHER_PROVIDER_WEATHER',
  'ENRICHER_PROVIDER_INTERVALS',
  'ENRICHER_PROVIDER_RUNNING_DYNAMICS',
  'ENRICHER_PROVIDER_MUSCLE_HEATMAP',
  'ENRICHER_PROVIDER_MUSCLE_HEATMAP_IMAGE',
  'ENRICHER_PROVIDER_PARKRUN',
  'ENRICHER_PROVIDER_HYBRID_RACE_TAGGER',
  'ENRICHER_PROVIDER_PERSONAL_RECORDS',
  'ENRICHER_PROVIDER_DISTANCE_MILESTONES',
  'ENRICHER_PROVIDER_GOAL_TRACKER',
  'ENRICHER_PROVIDER_SPOTIFY_TRACKS',
  'ENRICHER_PROVIDER_AI_COMPANION',
  'ENRICHER_PROVIDER_AI_BANNER',
  'ENRICHER_PROVIDER_ROUTE_THUMBNAIL',
]);

interface Props {
  appliedEnrichments: string[];
}

export default function BoosterTimeline({ appliedEnrichments }: Props): React.ReactElement {
  const applied = new Set(appliedEnrichments);
  const ranCount = appliedEnrichments.length;

  // Show any applied enrichers that aren't in the canonical list (future/unknown enrichers)
  const unknownApplied = appliedEnrichments.filter((k) => !ALL_ENRICHERS.includes(k));
  const displayList = [...ALL_ENRICHERS, ...unknownApplied];

  return (
    <div className="booster-timeline">
      <p className="booster-timeline__title">
        ⚡ Booster Sequence · {ranCount} ran
      </p>
      <ul className="booster-timeline__list">
        {displayList.map((key) => {
          const { icon, name } = getEnricherInfo(key);
          const ran = applied.has(key);

          let dotClass: string;
          let subText: string;

          if (ran) {
            if (TYPED_OUTPUT_ENRICHERS.has(key)) {
              dotClass = 'booster-entry__dot--ran';
              subText = '✓ ran';
            } else {
              dotClass = 'booster-entry__dot--silent';
              subText = '✓ ran · no visual output';
            }
          } else {
            dotClass = 'booster-entry__dot--skipped';
            subText = '— skipped';
          }

          return (
            <li key={key} className="booster-entry">
              <div className={`booster-entry__dot ${dotClass}`} />
              <div className="booster-entry__text">
                <div className={`booster-entry__name${ran ? '' : ' booster-entry__name--silent'}`}>
                  {icon} {name}
                </div>
                <div className="booster-entry__sub">{subText}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
