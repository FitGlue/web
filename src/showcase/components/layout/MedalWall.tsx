import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];
type ShowcaseTopPR = components['schemas']['ShowcaseTopPR'];

interface Medal {
  icon: string;
  value: string;
  valueSup?: string;
  label: string;
  sub?: string;
  isGradient?: boolean;
}

function prRecordLabel(recordType: string): string {
  return recordType.replace(/_/g, ' ').toUpperCase();
}

function prValueLabel(value: number, unit: string): { val: string; sup: string } {
  if (unit === 'seconds') {
    const m = Math.floor(value / 60);
    const s = Math.floor(value % 60);
    return { val: `${m}:${String(s).padStart(2, '0')}`, sup: '' };
  }
  if (unit === 'kg') return { val: String(Math.round(value)), sup: 'kg' };
  if (unit === 'meters') {
    const km = value / 1000;
    return { val: km >= 1 ? String(Math.round(km)) : String(Math.round(value)), sup: km >= 1 ? 'km' : 'm' };
  }
  return { val: String(Math.round(value)), sup: unit };
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
        label: 'DISTANCE MILESTONE',
        value: milestone.toLocaleString(),
        valueSup: 'km',
        sub: `${Math.round(distKm).toLocaleString()} km lifetime`,
      });
      break;
    }
  }

  const weightKg = profile.totalWeightKg ?? 0;
  for (const [threshold, label] of [[1000000, '1M KG'], [500000, '500K KG'], [100000, '100K KG'], [50000, '50K KG'], [10000, '10K KG'], [1000, '1K KG']] as [number, string][]) {
    if (weightKg >= threshold) {
      medals.push({
        icon: '💪',
        label: 'WEIGHT LIFTED',
        value: label,
        sub: `${Math.round(weightKg).toLocaleString()} kg lifetime`,
      });
      break;
    }
  }

  // Strength PRs from server-side personal records
  const topPRs: ShowcaseTopPR[] = (profile.topPrs ?? []).filter((p) => p.recordType && p.value && p.unit === 'kg');
  for (const pr of topPRs.slice(0, 4)) {
    const { val, sup } = prValueLabel(pr.value!, pr.unit!);
    const date = pr.achievedAt
      ? new Date(pr.achievedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : null;
    const delta = pr.previousValue && pr.value! > pr.previousValue
      ? `+${Math.round(pr.value! - pr.previousValue)} kg`
      : null;
    medals.push({
      icon: '🏋️',
      label: prRecordLabel(pr.recordType!),
      value: val,
      valueSup: sup,
      sub: [date, delta].filter(Boolean).join(' · ') || undefined,
    });
  }

  return medals.slice(0, 8);
}

interface Props {
  profile: ShowcaseProfile;
}

export default function MedalWall({ profile }: Props): React.ReactElement | null {
  const medals = buildMedals(profile);
  if (!medals.length) return null;

  const streakCount = medals.filter((m) => m.label === 'CURRENT STREAK' || m.label === 'LONGEST STREAK').length;
  const actCount = medals.filter((m) => m.label === 'LIFETIME ACTIVITIES').length;
  const distCount = medals.filter((m) => m.label === 'DISTANCE MILESTONE').length;
  const prCount = medals.filter((m) => m.icon === '🏋️').length;

  return (
    <div className="medal-band">
      <div className="medal-band__label">
        <span>
          <b>🏆 MEDAL WALL</b>
          {prCount > 0 && ` · ${prCount} PR${prCount > 1 ? 'S' : ''}`}
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
