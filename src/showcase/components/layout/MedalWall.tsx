import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];

interface Medal {
  icon: string;
  value: string;
  valueSup?: string;
  label: string;
  sub?: string;
  isGradient?: boolean;
}

function buildMedals(profile: ShowcaseProfile): Medal[] {
  const medals: Medal[] = [];

  const weeklyActive = profile.streakHistory?.weeklyActive ?? [];
  let currentStreak = 0;
  for (let i = weeklyActive.length - 1; i >= 0; i--) {
    if (weeklyActive[i]) currentStreak++;
    else break;
  }
  let longestStreak = 0;
  let run = 0;
  for (const active of weeklyActive) {
    run = active ? run + 1 : 0;
    if (run > longestStreak) longestStreak = run;
  }

  if (currentStreak >= 4) {
    medals.push({
      icon: '🔥',
      label: 'CURRENT STREAK',
      value: String(currentStreak),
      valueSup: 'wks',
      sub: longestStreak > currentStreak ? `Best: ${longestStreak} wks` : 'Personal best',
      isGradient: true,
    });
  }

  if (longestStreak >= 8 && longestStreak !== currentStreak) {
    medals.push({
      icon: '🏆',
      label: 'LONGEST STREAK',
      value: String(longestStreak),
      valueSup: 'wks',
    });
  }

  const acts = profile.totalActivities ?? 0;
  for (const milestone of [2000, 1000, 500, 250, 100]) {
    if (acts >= milestone) {
      medals.push({
        icon: '🎯',
        label: 'LIFETIME ACTIVITIES',
        value: milestone.toLocaleString(),
        sub: `${acts.toLocaleString()} total`,
      });
      break;
    }
  }

  const distKm = (profile.totalDistanceMeters ?? 0) / 1000;
  for (const milestone of [25000, 10000, 5000, 2500, 1000, 500, 200, 100]) {
    if (distKm >= milestone) {
      medals.push({
        icon: '🏅',
        label: 'MILESTONE',
        value: milestone.toLocaleString(),
        valueSup: 'km',
        sub: `${Math.round(distKm).toLocaleString()} km lifetime`,
      });
      break;
    }
  }

  return medals.slice(0, 8);
}

interface Props {
  profile: ShowcaseProfile;
}

export default function MedalWall({ profile }: Props): React.ReactElement | null {
  const medals = buildMedals(profile);
  if (!medals.length) return null;

  const streakCount = profile.streakHistory?.weeklyActive ? 1 : 0;
  const actCount = medals.filter((m) => m.label === 'LIFETIME ACTIVITIES').length;
  const distCount = medals.filter((m) => m.label === 'MILESTONE').length;

  return (
    <div className="medal-band">
      <div className="medal-band__label">
        <span>
          <b>🏆 MEDAL WALL</b>
          {streakCount > 0 && ` · ${streakCount} STREAK`}
          {actCount > 0 && ` · ${actCount} MILESTONE`}
          {distCount > 0 && ` · ${distCount} DISTANCE`}
        </span>
        {medals.length >= 4 && <span>SCROLL →</span>}
      </div>
      <div className="medals">
        {medals.map((m, i) => (
          <div key={i} className={`medal${m.isGradient ? ' medal--gr' : ''}`}>
            <div>
              <div className="medal__icon">{m.icon}</div>
              <div className="medal__label">{m.label}</div>
            </div>
            <div>
              <div className="medal__n">
                {m.value}
                {m.valueSup && <sup>{m.valueSup}</sup>}
              </div>
              {m.sub && <div className="medal__sub">{m.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
