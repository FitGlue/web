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
  const weeksTracked = profile.streakHistory?.weeksTracked ?? 0;
  const activeWeeks = weeksTracked > 0 ? weeksTracked - (missedWeeks ?? 0) : null;
  const activePct = weeksTracked > 0 && missedWeeks !== null
    ? Math.round(((weeksTracked - missedWeeks) / weeksTracked) * 100)
    : null;

  // Effort zones: Z2 (Endurance) + Z3 (Tempo) + Z4 (Threshold) + Z5 (VO2 Max)
  const effortZones = profile.zoneSplit?.zones
    ? Math.round(
        profile.zoneSplit.zones.slice(2).reduce((s, z) => s + (z.percentage ?? 0), 0)
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
          {effortZones !== null ? <>{effortZones}<sup>%</sup></> : dist ? <>{dist.value}<sup>{dist.sup}</sup></> : '—'}
        </div>
        <div className="profile-life__l">
          {effortZones !== null ? 'Effort zones' : 'Lifetime distance'}
        </div>
        <div className="profile-life__sub">
          {effortZones !== null ? 'Z2–Z5 intensity' : null}
        </div>
      </div>

      <div>
        <div className="profile-life__n">
          {dist && effortZones !== null ? (
            <>{dist.value}<sup>{dist.sup}</sup></>
          ) : hours ? (
            <>{hours.value}<sup>{hours.sup}</sup></>
          ) : '—'}
        </div>
        <div className="profile-life__l">
          {dist && effortZones !== null ? 'Lifetime distance' : 'Moving time'}
        </div>
        <div className="profile-life__sub">
          {hours && dist && effortZones !== null ? `${hours.value}h moving` : null}
        </div>
      </div>

      <div>
        <div className="profile-life__n">
          {activeWeeks !== null ? activeWeeks : '—'}
        </div>
        <div className="profile-life__l">Active weeks</div>
        <div className="profile-life__sub">
          {weeksTracked > 0
            ? activePct === 100
              ? `${weeksTracked} weeks · perfect`
              : `${weeksTracked} weeks · ${activePct}% consistency`
            : null}
        </div>
      </div>
    </div>
  );
}
