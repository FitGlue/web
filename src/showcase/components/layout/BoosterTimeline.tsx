import React from 'react';
import { getEnricherInfo } from '../../utils/format';

// Enrichers that produce typed visual output → aurora dot
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
  if (!appliedEnrichments.length) {
    return (
      <div className="booster-timeline">
        <p className="booster-timeline__title">Booster Sequence</p>
        <span className="no-enrichments-stamp">No boosters ran</span>
      </div>
    );
  }

  return (
    <div className="booster-timeline">
      <p className="booster-timeline__title">Booster Sequence</p>
      <ul className="booster-timeline__list">
        {appliedEnrichments.map((key) => {
          const { icon, name } = getEnricherInfo(key);
          const isTyped = TYPED_OUTPUT_ENRICHERS.has(key);
          const dotClass = isTyped ? 'booster-entry__dot--ran' : 'booster-entry__dot--silent';
          const nameClass = isTyped ? '' : 'booster-entry__name--silent';

          return (
            <li key={key} className="booster-entry">
              <div className={`booster-entry__dot ${dotClass}`} />
              <div className="booster-entry__text">
                <div className={`booster-entry__name ${nameClass}`}>
                  {icon} {name}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
