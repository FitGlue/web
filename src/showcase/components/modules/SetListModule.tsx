import React from 'react';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Session = components['schemas']['Session'];
type StrengthSet = components['schemas']['StrengthSet'];

interface Props {
  sessions?: Session[];
  prTypes?: Set<string>;
}

interface SetEntry {
  reps: number;
  weightKg: number;
  durationSeconds: number;
  distanceMeters: number;
  count: number;
}

interface ExerciseGroup {
  name: string;
  isPR: boolean;
  sets: SetEntry[];
  totalVolume: number;
  totalDurationSeconds: number;
}

function formatWeight(kg: number): string {
  return kg % 1 === 0 ? String(kg) : kg.toFixed(1);
}

function formatDuration(secs: number): string {
  if (secs >= 3600) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  }
  if (secs >= 60) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m}m${s}s` : `${m}m`;
  }
  return `${secs}s`;
}

function formatSetChip(s: SetEntry): string {
  const hasDuration = s.durationSeconds > 0;
  const hasDistance = s.distanceMeters > 0;
  const hasWeight = s.weightKg > 0;
  const hasReps = s.reps > 0;

  let base: string;

  if (hasDuration) {
    const dur = formatDuration(s.durationSeconds);
    base = hasWeight ? `${dur} × ${formatWeight(s.weightKg)}kg` : dur;
  } else if (hasDistance) {
    const dist = s.distanceMeters >= 1000
      ? `${(s.distanceMeters / 1000).toFixed(1)}km`
      : `${Math.round(s.distanceMeters)}m`;
    base = hasWeight ? `${dist} × ${formatWeight(s.weightKg)}kg` : dist;
  } else {
    // Reps-based (standard or bodyweight)
    const weight = hasWeight ? ` × ${formatWeight(s.weightKg)}kg` : '';
    base = hasReps ? `${s.reps}${weight}` : `—${weight}`;
  }

  return s.count > 1 ? `${s.count}×${base}` : base;
}

/** Group all sets by exercise name, then combine consecutive identical sets. */
function groupByExercise(sets: StrengthSet[], prTypes?: Set<string>): ExerciseGroup[] {
  const order: string[] = [];
  const runs: Record<string, StrengthSet[]> = {};

  for (const set of sets) {
    const name = set.exerciseName ?? '';
    if (!runs[name]) {
      order.push(name);
      runs[name] = [];
    }
    runs[name].push(set);
  }

  return order.map((name) => {
    const raw = runs[name];
    const combined: SetEntry[] = [];

    for (const set of raw) {
      const entry: Omit<SetEntry, 'count'> = {
        reps: set.reps ?? 0,
        weightKg: set.weightKg ?? 0,
        durationSeconds: set.durationSeconds ?? 0,
        distanceMeters: set.distanceMeters ?? 0,
      };
      const last = combined[combined.length - 1];
      if (
        last &&
        last.reps === entry.reps &&
        last.weightKg === entry.weightKg &&
        last.durationSeconds === entry.durationSeconds &&
        last.distanceMeters === entry.distanceMeters
      ) {
        last.count += 1;
      } else {
        combined.push({ ...entry, count: 1 });
      }
    }

    const totalVolume = raw.reduce((sum, s) => sum + (s.reps ?? 0) * (s.weightKg ?? 0), 0);
    const totalDurationSeconds = raw.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);

    return {
      name: name || 'Exercise',
      isPR: !!(name && prTypes?.has(name)),
      sets: combined,
      totalVolume,
      totalDurationSeconds,
    };
  });
}

export default function SetListModule({ sessions, prTypes }: Props): React.ReactElement | null {
  if (!sessions?.length) return null;

  const allSets: StrengthSet[] = sessions.flatMap((s) => s.strengthSets ?? []);
  if (!allSets.length) return null;

  const totalSets = allSets.length;
  const totalReps = allSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
  const totalVolume = allSets.reduce((sum, s) => sum + (s.reps ?? 0) * (s.weightKg ?? 0), 0);
  const totalDurationSeconds = allSets.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
  const groups = groupByExercise(allSets, prTypes);

  return (
    <Module
      title="Workout"
      right={`${groups.length} exercises · ${totalSets} sets`}
      span={12}
    >
      <div className="ex-list">
        {groups.map((group, gi) => (
          <div key={gi} className={`ex-row${group.isPR ? ' ex-row--pr' : ''}`}>
            <div className="ex-row__name">
              {group.name}
              {group.isPR && <span className="stamp stamp--pr">PR</span>}
            </div>
            <div className="ex-row__sets">
              {group.sets.map((s, si) => (
                <span key={si} className="ex-chip">{formatSetChip(s)}</span>
              ))}
            </div>
            {group.totalVolume > 0 && (
              <div className="ex-row__vol">{Math.round(group.totalVolume).toLocaleString()} kg</div>
            )}
            {group.totalVolume === 0 && group.totalDurationSeconds > 0 && (
              <div className="ex-row__vol">{formatDuration(group.totalDurationSeconds)}</div>
            )}
          </div>
        ))}
      </div>
      <div className="ex-footer">
        {totalReps > 0 && (
          <span className="ex-footer__stat">{totalReps} <span>REPS</span></span>
        )}
        {totalDurationSeconds > 0 && totalReps === 0 && (
          <span className="ex-footer__stat">{formatDuration(totalDurationSeconds)} <span>TOTAL TIME</span></span>
        )}
        {totalVolume > 0 && (
          <span className="ex-footer__stat ex-footer__stat--aurora">
            {Math.round(totalVolume).toLocaleString()} <span>KG MOVED</span>
          </span>
        )}
      </div>
    </Module>
  );
}
