import React from 'react';
import type { components } from '../../../shared/api/schema-public';
import { resolveCategory, CATEGORY_STAMP_CLASS } from '../../utils/activityCategory';
import { getActivityIcon } from '../../utils/activityMeta';
import { formatSource } from '../../utils/format';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];
type Session = components['schemas']['Session'];

function formatDuration(s: number): string {
  if (s <= 0) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}:${String(sec).padStart(2, '0')}`;
  return `${sec}s`;
}

function formatDistanceKm(m: number): string {
  if (m <= 0) return '—';
  const km = m / 1000;
  return km >= 10 ? km.toFixed(1) : km.toFixed(2);
}

function formatPace(secsPerKm: number): string {
  if (secsPerKm <= 0) return '—';
  const m = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function totalSessionValue(
  sessions: Session[] | undefined,
  key: 'totalElapsedTime' | 'totalDistance'
): number {
  return (sessions ?? []).reduce((sum, s) => sum + (s[key] ?? 0), 0);
}

function totalWeightKg(sessions: Session[] | undefined): number {
  let kg = 0;
  for (const s of sessions ?? []) {
    for (const set of s.strengthSets ?? []) {
      kg += (set.weightKg ?? 0) * (set.reps ?? 0);
    }
  }
  return kg;
}

function totalSets(sessions: Session[] | undefined): number {
  return (sessions ?? []).reduce((sum, s) => sum + (s.strengthSets?.length ?? 0), 0);
}

interface AnchorStat {
  value: string;
  unit?: string;
  label: string;
}

interface Props {
  activity: ShowcasedActivity;
}

export default function ActivityHero({ activity }: Props): React.ReactElement {
  const category = resolveCategory(activity);
  const stampClass = CATEGORY_STAMP_CLASS[category];
  const emoji = getActivityIcon(activity.activityType) || '🏃';
  const sessions = activity.activityData?.sessions as Session[] | undefined;
  const enrichments = activity.enrichments;

  const hasBanner = !!enrichments?.aiBanner?.imageUrl;
  const sectionClass = `activity-hero-section${hasBanner ? ' activity-hero-section--with-banner' : ''}`;

  const durationSecs = totalSessionValue(sessions, 'totalElapsedTime');
  const distanceM = totalSessionValue(sessions, 'totalDistance');
  const avgBpm = enrichments?.heartRate?.avgBpm ?? 0;
  const maxBpm = enrichments?.heartRate?.maxBpm ?? 0;
  const calories = enrichments?.calories?.kcal ?? 0;
  const locationName = enrichments?.location?.locationName;
  const prCount = enrichments?.personalRecords?.records?.length ?? 0;
  const boosterCount = (activity.appliedEnrichments ?? []).length;
  const sourceLabel = activity.source ? `VIA ${formatSource(activity.source).toUpperCase()}` : null;
  const dateLabel = activity.startTime
    ? new Date(activity.startTime).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
    : null;

  // 4-column anchor stats by category
  const anchorStats: AnchorStat[] = [];

  if (category === 'cardio-distance') {
    anchorStats.push({ value: distanceM > 0 ? formatDistanceKm(distanceM) : '—', unit: 'KM', label: 'Distance' });
    anchorStats.push({ value: durationSecs > 0 ? formatDuration(durationSecs) : '—', label: 'Time' });
    if (enrichments?.pace?.avgPaceSecondsPerKm && enrichments.pace.avgPaceSecondsPerKm > 0) {
      anchorStats.push({ value: formatPace(enrichments.pace.avgPaceSecondsPerKm), unit: '/KM', label: 'Avg Pace' });
    } else if (durationSecs > 0 && distanceM > 0) {
      anchorStats.push({ value: formatPace(durationSecs / (distanceM / 1000)), unit: '/KM', label: 'Avg Pace' });
    } else {
      anchorStats.push({ value: '—', label: 'Avg Pace' });
    }
    anchorStats.push({ value: avgBpm > 0 ? String(avgBpm) : '—', unit: avgBpm > 0 ? 'BPM' : undefined, label: 'Avg HR' });
  } else if (category === 'cardio-time') {
    anchorStats.push({ value: durationSecs > 0 ? String(Math.round(durationSecs / 60)) : '—', unit: 'MIN', label: 'Duration' });
    anchorStats.push({ value: avgBpm > 0 ? String(avgBpm) : '—', unit: avgBpm > 0 ? 'BPM' : undefined, label: 'Avg HR' });
    anchorStats.push({ value: maxBpm > 0 ? String(maxBpm) : '—', unit: maxBpm > 0 ? 'BPM' : undefined, label: 'Max HR' });
    anchorStats.push({ value: calories > 0 ? String(calories) : '—', unit: calories > 0 ? 'KCAL' : undefined, label: 'Calories' });
  } else if (category === 'strength') {
    const sets = totalSets(sessions);
    const weightKg = totalWeightKg(sessions);
    anchorStats.push({ value: sets > 0 ? String(sets) : '—', label: 'Sets' });
    anchorStats.push({ value: weightKg > 0 ? Math.round(weightKg).toLocaleString() : '—', unit: weightKg > 0 ? 'KG' : undefined, label: 'Volume Moved' });
    anchorStats.push({ value: durationSecs > 0 ? String(Math.round(durationSecs / 60)) : '—', unit: durationSecs > 0 ? 'MIN' : undefined, label: 'Duration' });
    anchorStats.push({ value: prCount > 0 ? `+${prCount}` : '—', label: 'Personal Records' });
  } else if (category === 'sport') {
    anchorStats.push({ value: durationSecs > 0 ? String(Math.round(durationSecs / 60)) : '—', unit: durationSecs > 0 ? 'MIN' : undefined, label: 'Duration' });
    anchorStats.push({ value: avgBpm > 0 ? String(avgBpm) : '—', unit: avgBpm > 0 ? 'BPM' : undefined, label: 'Avg HR' });
    anchorStats.push({ value: calories > 0 ? String(calories) : '—', unit: calories > 0 ? 'KCAL' : undefined, label: 'Calories' });
    anchorStats.push({ value: emoji, label: 'Activity Type' });
  } else {
    // untraditional
    anchorStats.push({ value: durationSecs > 0 ? String(Math.round(durationSecs / 60)) : '—', unit: durationSecs > 0 ? 'MIN' : undefined, label: 'Duration' });
    if (avgBpm > 0) anchorStats.push({ value: String(avgBpm), unit: 'BPM', label: 'Avg HR' });
    if (calories > 0) anchorStats.push({ value: String(calories), unit: 'KCAL', label: 'Calories' });
    if (distanceM > 0) anchorStats.push({ value: formatDistanceKm(distanceM), unit: 'KM', label: 'Distance' });
    // Pad to 4 stats if needed
    while (anchorStats.length < 4) anchorStats.push({ value: '—', label: '—' });
  }

  // Trim to exactly 4 stats
  const stats = anchorStats.slice(0, 4);

  const locationPart = locationName ? ` · 🌍 ${locationName.toUpperCase()}` : '';
  const boosterPart = boosterCount > 0 ? ` · ENRICHED BY ${boosterCount} BOOSTER${boosterCount !== 1 ? 'S' : ''}` : '';
  const ownerPart = activity.ownerDisplayName ? `BY ${activity.ownerDisplayName.toUpperCase()}` : null;
  const creditLine = [ownerPart, boosterPart ? boosterPart.slice(3) : null, locationPart ? locationPart.slice(3) : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className={sectionClass}>
      {hasBanner && (
        <img
          className="activity-hero__banner-img"
          src={enrichments!.aiBanner!.imageUrl}
          alt=""
          aria-hidden="true"
        />
      )}
      <div className="activity-hero__grain" aria-hidden="true" />

      <div className="activity-hero__inner">
        {/* Top stamps row */}
        <div className="activity-hero__stamps">
          <span className={`stamp ${stampClass}`}>
            {emoji} {(activity.activityType ?? '').replace('ACTIVITY_TYPE_', '').replace(/_/g, ' ')}
          </span>
          {sourceLabel && <span className="stamp stamp--hero-source">{sourceLabel}</span>}
          {dateLabel && <span className="stamp stamp--hero-date">{dateLabel}</span>}
          {prCount > 0 && <span className="stamp stamp--hero-pr">+{prCount} PR</span>}
          {hasBanner && <span className="stamp stamp--hero-ai">🎨 AI BANNER</span>}
        </div>

        {/* Title + credit + anchor stats */}
        <div>
          <h1 className="activity-hero__quote">{activity.title ?? 'Activity'}</h1>
          {creditLine && (
            <div className="activity-hero__credit">
              {ownerPart ? (
                <>
                  BY{' '}
                  <b>
                    {activity.ownerProfileSlug ? (
                      <a
                        href={`/showcase/profile/${activity.ownerProfileSlug}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {activity.ownerDisplayName!.toUpperCase()}
                      </a>
                    ) : (
                      activity.ownerDisplayName!.toUpperCase()
                    )}
                  </b>
                  {boosterCount > 0 && ` · ENRICHED BY ${boosterCount} BOOSTER${boosterCount !== 1 ? 'S' : ''}`}
                  {locationName && ` · 🌍 ${locationName.toUpperCase()}`}
                </>
              ) : (
                creditLine
              )}
            </div>
          )}

          {/* 4-col anchor stats */}
          <div className="activity-hero__anchor">
            {stats.map((stat, i) => (
              <div key={i} className="activity-hero__anchor-cell">
                <div className="activity-hero__anchor-n">
                  {stat.value}
                  {stat.unit && <span>{stat.unit}</span>}
                </div>
                <div className="activity-hero__anchor-l">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
