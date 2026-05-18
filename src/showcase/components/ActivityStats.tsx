import React from 'react';
import type { components } from '../../shared/api/schema-public';
import { formatDuration, formatDistance, formatWeight } from '../utils/format';

type Session = components['schemas']['Session'];
type Record = components['schemas']['Record'];
type ActivityType = components['schemas']['ShowcasedActivity']['activityType'];

const DISTANCE_ACTIVITY_TYPES = new Set<ActivityType>([
  'ACTIVITY_TYPE_RUN', 'ACTIVITY_TYPE_TRAIL_RUN', 'ACTIVITY_TYPE_VIRTUAL_RUN',
  'ACTIVITY_TYPE_RIDE', 'ACTIVITY_TYPE_VIRTUAL_RIDE', 'ACTIVITY_TYPE_GRAVEL_RIDE',
  'ACTIVITY_TYPE_MOUNTAIN_BIKE_RIDE', 'ACTIVITY_TYPE_EMOUNTAIN_BIKE_RIDE', 'ACTIVITY_TYPE_EBIKE_RIDE',
  'ACTIVITY_TYPE_SWIM', 'ACTIVITY_TYPE_WALK', 'ACTIVITY_TYPE_HIKE',
  'ACTIVITY_TYPE_ROWING', 'ACTIVITY_TYPE_VIRTUAL_ROW',
  'ACTIVITY_TYPE_ALPINE_SKI', 'ACTIVITY_TYPE_NORDIC_SKI', 'ACTIVITY_TYPE_BACKCOUNTRY_SKI',
  'ACTIVITY_TYPE_SNOWBOARD', 'ACTIVITY_TYPE_SNOWSHOE',
  'ACTIVITY_TYPE_SOCCER', 'ACTIVITY_TYPE_TENNIS', 'ACTIVITY_TYPE_GOLF',
  'ACTIVITY_TYPE_KAYAKING', 'ACTIVITY_TYPE_STAND_UP_PADDLING', 'ACTIVITY_TYPE_SURFING',
  'ACTIVITY_TYPE_SAIL', 'ACTIVITY_TYPE_ICE_SKATE', 'ACTIVITY_TYPE_INLINE_SKATE',
  'ACTIVITY_TYPE_ROCK_CLIMBING', 'ACTIVITY_TYPE_HANDCYCLE', 'ACTIVITY_TYPE_WHEELCHAIR',
  'ACTIVITY_TYPE_VELOMOBILE', 'ACTIVITY_TYPE_ROLLER_SKI', 'ACTIVITY_TYPE_KITESURF',
  'ACTIVITY_TYPE_WINDSURF', 'ACTIVITY_TYPE_SKATEBOARD', 'ACTIVITY_TYPE_CANOEING',
]);

interface StatItem { icon: string; value: string | number; label: string }

function buildStats(session: Session, activityType?: ActivityType): StatItem[] {
  const stats: StatItem[] = [];

  if (session.totalElapsedTime) {
    const d = formatDuration(session.totalElapsedTime);
    if (d) stats.push({ icon: '⏱️', value: d, label: 'Duration' });
  }
  const showDistance = !activityType || DISTANCE_ACTIVITY_TYPES.has(activityType);
  if (showDistance && session.totalDistance) {
    const d = formatDistance(session.totalDistance);
    if (d) stats.push({ icon: '📏', value: d, label: 'Distance' });
  }

  const allRecords: Record[] = session.laps?.flatMap((l) => l.records ?? []) ?? [];

  const hrValues = allRecords.filter((r) => (r.heartRate ?? 0) > 0).map((r) => r.heartRate!);
  if (hrValues.length > 0) {
    const avg = Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length);
    stats.push({ icon: '❤️', value: avg, label: 'Avg BPM' });
  }

  const powerValues = allRecords.filter((r) => (r.power ?? 0) > 0).map((r) => r.power!);
  if (powerValues.length > 0) {
    const avg = Math.round(powerValues.reduce((a, b) => a + b, 0) / powerValues.length);
    stats.push({ icon: '⚡', value: `${avg}W`, label: 'Avg Power' });
  }

  const cadenceValues = allRecords.filter((r) => (r.cadence ?? 0) > 0).map((r) => r.cadence!);
  if (cadenceValues.length > 0) {
    const avg = Math.round(cadenceValues.reduce((a, b) => a + b, 0) / cadenceValues.length);
    stats.push({ icon: '🦶', value: avg, label: 'Avg Cadence' });
  }

  const speedValues = allRecords.filter((r) => (r.speed ?? 0) > 0).map((r) => r.speed!);
  if (speedValues.length > 0) {
    const avg = speedValues.reduce((a, b) => a + b, 0) / speedValues.length;
    stats.push({ icon: '🚀', value: `${(avg * 3.6).toFixed(1)} km/h`, label: 'Avg Speed' });
  }

  if (session.strengthSets && session.strengthSets.length > 0) {
    const totalSets = session.strengthSets.length;
    const totalReps = session.strengthSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
    const totalVolume = session.strengthSets.reduce((sum, s) => {
      const reps = s.reps ?? 0;
      const weight = s.weightKg ?? 0;
      const dist = s.distanceMeters ?? 0;
      if (weight > 0) {
        if (reps > 0) return sum + reps * weight;
        if (dist > 0) return sum + dist * weight;
      }
      return sum;
    }, 0);
    stats.push({ icon: '🔢', value: totalSets, label: 'Sets' });
    stats.push({ icon: '💪', value: totalReps, label: 'Reps' });
    if (totalVolume > 0) {
      const w = formatWeight(totalVolume);
      if (w) stats.push({ icon: '⚖️', value: w, label: 'Volume' });
    }
  }

  return stats;
}

interface Props {
  session: Session;
  activityType?: ActivityType;
}

export const ActivityStats: React.FC<Props> = ({ session, activityType }) => {
  const stats = buildStats(session, activityType);
  if (stats.length === 0) return null;

  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
};
