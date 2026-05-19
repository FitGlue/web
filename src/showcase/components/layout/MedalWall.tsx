import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];

interface Medal {
  icon: string;
  value: string;
  label: string;
  isStreak?: boolean;
}

function computeStreaks(weeklyActive: boolean[]): { current: number; longest: number } {
  let current = 0;
  for (let i = weeklyActive.length - 1; i >= 0; i--) {
    if (weeklyActive[i]) current++;
    else break;
  }
  let longest = 0;
  let run = 0;
  for (const active of weeklyActive) {
    run = active ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  return { current, longest };
}

function buildMedals(profile: ShowcaseProfile): Medal[] {
  const medals: Medal[] = [];

  const weeklyActive = profile.streakHistory?.weeklyActive ?? [];
  const { current: currentStreak, longest: longestStreak } = computeStreaks(weeklyActive);

  // Current streak (show if >= 4 consecutive weeks)
  if (currentStreak >= 4) {
    medals.push({
      icon: '🔥',
      value: `${currentStreak}w`,
      label: 'Current streak',
      isStreak: true,
    });
  }

  // Longest streak (show if >= 8 consecutive weeks)
  if (longestStreak >= 8) {
    medals.push({
      icon: '🏆',
      value: `${longestStreak}w`,
      label: 'Longest streak',
    });
  }

  // Activity count milestones
  const acts = profile.totalActivities ?? 0;
  for (const milestone of [1000, 500, 100]) {
    if (acts >= milestone) {
      medals.push({
        icon: '🎯',
        value: `${milestone}`,
        label: 'lifetime activities',
      });
      break;
    }
  }

  // Distance milestones (nearest thousand km)
  const distKm = (profile.totalDistanceMeters ?? 0) / 1000;
  if (distKm > 0) {
    const milestone = Math.floor(distKm / 1000) * 1000;
    if (milestone >= 1000) {
      medals.push({
        icon: '🏅',
        value: `${milestone.toLocaleString()} km`,
        label: `lifetime distance`,
      });
    }
  }

  return medals;
}

interface Props {
  profile: ShowcaseProfile;
}

export default function MedalWall({ profile }: Props): React.ReactElement | null {
  const medals = buildMedals(profile);
  if (!medals.length) return null;

  return (
    <div>
      <p className="showcase-section-title">Medal wall</p>
      <div className="medal-wall">
        {medals.map((m, i) => (
          <div
            key={i}
            className={`medal-tile${m.isStreak ? ' medal-tile--streak' : ''}`}
          >
            <div className="medal-tile__icon">{m.icon}</div>
            <div className="medal-tile__value">{m.value}</div>
            <div className="medal-tile__label">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
