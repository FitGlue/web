import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];

function fmtDist(m: number): { value: string; sup: string } {
  const km = m / 1000;
  if (km >= 1000) return { value: `${(km / 1000).toFixed(1)}k`, sup: 'km' };
  return { value: Math.round(km).toLocaleString(), sup: 'km' };
}

function fmtHours(s: number): { value: string; sup: string } {
  const h = Math.round(s / 3600);
  return { value: h.toLocaleString(), sup: 'h' };
}

interface Props {
  profile: ShowcaseProfile;
}

export default function LifetimeStats({ profile }: Props): React.ReactElement {
  const acts = (profile.totalActivities ?? 0).toLocaleString();
  const dist = profile.totalDistanceMeters ? fmtDist(profile.totalDistanceMeters) : null;
  const hours = profile.totalDurationSeconds ? fmtHours(profile.totalDurationSeconds) : null;
  const missedWeeks = profile.streakHistory?.missedWeeks ?? null;
  const weeksTracked = profile.streakHistory?.weeksTracked ?? 26;

  // Zone split from API if available
  const zoneSplitLabel = profile.zoneSplit?.label ?? null;
  const z01 = profile.zoneSplit?.zones
    ? Math.round(
        (profile.zoneSplit.zones.slice(0, 2).reduce((s, z) => s + (z.percentage ?? 0), 0))
      )
    : null;

  return (
    <div className="profile-life">
      <div>
        <div className="profile-life__n">{acts}</div>
        <div className="profile-life__l">Activities</div>
        <div className="profile-life__sub">
          {(profile.totalActivities ?? 0) > 0 ? 'Via FitGlue pipelines' : 'No activities yet'}
        </div>
      </div>

      <div>
        <div className="profile-life__n profile-life__n--gr">
          {z01 !== null ? <>{z01}<sup>%</sup></> : dist ? <>{dist.value}<sup>{dist.sup}</sup></> : '—'}
        </div>
        <div className="profile-life__l">
          {z01 !== null ? 'Z0 + Z1 split' : 'Lifetime distance'}
        </div>
        <div className="profile-life__sub">
          {z01 !== null ? (zoneSplitLabel ?? 'Polarized') : null}
        </div>
      </div>

      <div>
        <div className="profile-life__n">
          {dist && z01 !== null ? (
            <>{dist.value}<sup>{dist.sup}</sup></>
          ) : hours ? (
            <>{hours.value}<sup>{hours.sup}</sup></>
          ) : '—'}
        </div>
        <div className="profile-life__l">
          {dist && z01 !== null ? 'Lifetime distance' : 'Moving time'}
        </div>
        <div className="profile-life__sub">
          {hours && dist && z01 !== null ? `${hours.value}h moving` : null}
        </div>
      </div>

      <div>
        <div className="profile-life__n">
          {missedWeeks !== null ? missedWeeks : '—'}
        </div>
        <div className="profile-life__l">Missed week-streaks</div>
        <div className="profile-life__sub">
          Last {weeksTracked} weeks
          {missedWeeks === 0 ? ' · perfect' : null}
        </div>
      </div>
    </div>
  );
}
