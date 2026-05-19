import React from 'react';
import type { components } from '../../../shared/api/schema-public';
import { resolveCategory, CATEGORY_STAMP_CLASS, CATEGORY_EMOJI } from '../../utils/activityCategory';
import { getActivityIcon } from '../../utils/activityMeta';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

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
  return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`;
}

function formatPace(secsPerKm: number): string {
  if (secsPerKm <= 0) return '—';
  const m = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}/km`;
}

function totalSessionValue(
  sessions: components['schemas']['Session'][] | undefined,
  key: 'totalElapsedTime' | 'totalDistance'
): number {
  return (sessions ?? []).reduce((sum, s) => sum + (s[key] ?? 0), 0);
}

function totalWeight(sessions: components['schemas']['Session'][] | undefined): number {
  let kg = 0;
  for (const s of sessions ?? []) {
    for (const set of s.strengthSets ?? []) {
      kg += (set.weightKg ?? 0) * (set.reps ?? 0);
    }
  }
  return kg;
}

function totalSets(sessions: components['schemas']['Session'][] | undefined): number {
  return (sessions ?? []).reduce((sum, s) => sum + (s.strengthSets?.length ?? 0), 0);
}

interface Props {
  activity: ShowcasedActivity;
}

export default function ActivityHero({ activity }: Props): React.ReactElement {
  const category = resolveCategory(activity);
  const stampClass = CATEGORY_STAMP_CLASS[category];
  const emoji = getActivityIcon(activity.activityType) || CATEGORY_EMOJI[category];
  const sessions = activity.activityData?.sessions;
  const enrichments = activity.enrichments;

  const durationSecs = totalSessionValue(sessions, 'totalElapsedTime');
  const distanceM = totalSessionValue(sessions, 'totalDistance');
  const avgBpm = enrichments?.heartRate?.avgBpm ?? 0;
  const calories = enrichments?.calories?.kcal ?? 0;
  const locationName = enrichments?.location?.locationName;
  const prCount = enrichments?.personalRecords?.records?.length ?? 0;
  const appliedEnrichments = new Set(activity.appliedEnrichments ?? []);

  const hasBanner = !!enrichments?.aiBanner?.imageUrl;
  const boosterCount = (activity.appliedEnrichments ?? []).length;

  return (
    <div className="activity-hero">
      {hasBanner && (
        <img
          className="activity-hero__banner"
          src={enrichments!.aiBanner!.imageUrl}
          alt={activity.title ?? 'Activity banner'}
        />
      )}

      <div className="activity-hero__meta-row">
        <span className={`stamp ${stampClass}`}>{emoji} {category.replace('-', ' ')}</span>
        {locationName && <span>📍 {locationName}</span>}
        {activity.startTime && (
          <span>{new Date(activity.startTime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        )}
        {prCount > 0 && <span className="stamp stamp--pr">+{prCount} PR</span>}
        {appliedEnrichments.has('ENRICHER_PROVIDER_PARKRUN') && (
          <span className="stamp">🎽 Parkrun</span>
        )}
      </div>

      <h1 className="activity-hero__title">{activity.title ?? 'Activity'}</h1>

      {(activity.ownerDisplayName || boosterCount > 0) && (
        <div className="activity-hero__byline">
          {activity.ownerDisplayName && (
            <a
              href={activity.ownerProfileSlug ? `/showcase/profile/${activity.ownerProfileSlug}` : undefined}
              className="activity-hero__owner-link"
            >
              {activity.ownerProfilePictureUrl ? (
                <img
                  src={activity.ownerProfilePictureUrl}
                  alt={activity.ownerDisplayName}
                  className="activity-hero__owner-avatar"
                />
              ) : (
                <span className="activity-hero__owner-avatar activity-hero__owner-avatar--initials">
                  {activity.ownerDisplayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span>BY <b>{activity.ownerDisplayName.toUpperCase()}</b></span>
            </a>
          )}
          {boosterCount > 0 && (
            <span>ENRICHED BY <b>{boosterCount} BOOSTER{boosterCount !== 1 ? 'S' : ''}</b></span>
          )}
        </div>
      )}

      <div className="activity-hero__stat-row">
        {category === 'cardio-distance' && distanceM > 0 && (
          <div className="activity-hero__primary-stat">
            <span className="stat-value">{formatDistanceKm(distanceM)}</span>
            <span className="stat-label">Distance</span>
          </div>
        )}

        {(category === 'cardio-time' || category === 'sport' || category === 'untraditional') && durationSecs > 0 && (
          <div className="activity-hero__primary-stat">
            <span className="stat-value">{Math.round(durationSecs / 60)}</span>
            <span className="stat-label">MIN</span>
          </div>
        )}

        {category === 'strength' && (
          <div className="activity-hero__primary-stat">
            <span className="stat-value">{Math.round(totalWeight(sessions)).toLocaleString()}</span>
            <span className="stat-label">KG MOVED</span>
          </div>
        )}

        <div className="activity-hero__secondary-stats">
          {durationSecs > 0 && category === 'cardio-distance' && (
            <div className="mini">
              <span className="mini__value">{formatDuration(durationSecs)}</span>
              <span className="mini__label">Duration</span>
            </div>
          )}
          {distanceM > 0 && enrichments?.pace?.avgPaceSecondsPerKm && enrichments.pace.avgPaceSecondsPerKm > 0 && (
            <div className="mini">
              <span className="mini__value">{formatPace(enrichments.pace.avgPaceSecondsPerKm)}</span>
              <span className="mini__label">Avg Pace</span>
            </div>
          )}
          {avgBpm > 0 && (
            <div className="mini">
              <span className="mini__value">{avgBpm}</span>
              <span className="mini__label">Avg BPM</span>
            </div>
          )}
          {calories > 0 && (
            <div className="mini">
              <span className="mini__value">{calories}</span>
              <span className="mini__label">kcal</span>
            </div>
          )}
          {category === 'strength' && (
            <div className="mini">
              <span className="mini__value">{totalSets(sessions)}</span>
              <span className="mini__label">Sets</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
