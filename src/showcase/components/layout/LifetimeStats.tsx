import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];

function fmtDist(m: number): string {
  const km = m / 1000;
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k km` : `${Math.round(km).toLocaleString()} km`;
}

function fmtHours(s: number): string {
  const h = Math.round(s / 3600);
  return `${h.toLocaleString()}h`;
}

interface Props {
  profile: ShowcaseProfile;
}

export default function LifetimeStats({ profile }: Props): React.ReactElement {
  const distKm = profile.totalDistanceMeters ? profile.totalDistanceMeters / 1000 : 0;
  const missedWeeks = profile.streakHistory?.missedWeeks ?? null;

  return (
    <div className="lifetime-stats">
      <div className="lifetime-stat">
        <span className="lifetime-stat__value">
          {(profile.totalActivities ?? 0).toLocaleString()}
        </span>
        <span className="lifetime-stat__label">Activities</span>
      </div>

      <div className="lifetime-stat">
        <span className="lifetime-stat__value lifetime-stat__value--aurora">
          {distKm > 0 ? fmtDist(profile.totalDistanceMeters!) : '—'}
        </span>
        <span className="lifetime-stat__label">Lifetime distance</span>
      </div>

      <div className="lifetime-stat">
        <span className="lifetime-stat__value">
          {profile.totalDurationSeconds ? fmtHours(profile.totalDurationSeconds) : '—'}
        </span>
        <span className="lifetime-stat__label">Moving time</span>
      </div>

      <div className="lifetime-stat">
        <span className="lifetime-stat__value">
          {missedWeeks !== null ? missedWeeks : '—'}
        </span>
        <span className="lifetime-stat__label">Missed weeks (26w)</span>
      </div>
    </div>
  );
}
