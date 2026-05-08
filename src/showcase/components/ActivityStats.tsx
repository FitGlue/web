import React from 'react';
import type { components } from '../../shared/api/schema-public';
import { formatDuration, formatDistance, formatWeight } from '../utils/format';

type Session = components['schemas']['Session'];
type Record = components['schemas']['Record'];

interface StatItem { icon: string; value: string | number; label: string }

function buildStats(session: Session): StatItem[] {
  const stats: StatItem[] = [];

  if (session.totalElapsedTime) {
    const d = formatDuration(session.totalElapsedTime);
    if (d) stats.push({ icon: '⏱️', value: d, label: 'Duration' });
  }
  if (session.totalDistance) {
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
}

export const ActivityStats: React.FC<Props> = ({ session }) => {
  const stats = buildStats(session);
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
