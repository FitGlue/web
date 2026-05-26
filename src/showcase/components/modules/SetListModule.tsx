import React from 'react';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Session = components['schemas']['Session'];
type StrengthSet = components['schemas']['StrengthSet'];

interface Props {
  sessions?: Session[];
  prTypes?: Set<string>;
}

interface ExerciseGroup {
  name: string;
  isPR: boolean;
  sets: Array<{ reps: number; weightKg: number; count: number }>;
  totalVolume: number;
}

/** Group all sets by exercise name, then combine consecutive identical sets within each group. */
function groupByExercise(sets: StrengthSet[], prTypes?: Set<string>): ExerciseGroup[] {
  // Collect runs of each exercise (preserving order of first appearance)
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
    // Combine consecutive identical reps+weight within this exercise
    const combined: Array<{ reps: number; weightKg: number; count: number }> = [];
    for (const set of raw) {
      const reps = set.reps ?? 0;
      const weightKg = set.weightKg ?? 0;
      const last = combined[combined.length - 1];
      if (last && last.reps === reps && last.weightKg === weightKg) {
        last.count += 1;
      } else {
        combined.push({ reps, weightKg, count: 1 });
      }
    }
    const totalVolume = raw.reduce((sum, s) => sum + (s.reps ?? 0) * (s.weightKg ?? 0), 0);
    return {
      name: name || 'Exercise',
      isPR: !!(name && prTypes?.has(name)),
      sets: combined,
      totalVolume,
    };
  });
}

function formatSetChip(s: { reps: number; weightKg: number; count: number }): string {
  const weight = s.weightKg > 0 ? ` × ${s.weightKg % 1 === 0 ? s.weightKg : s.weightKg.toFixed(1)}kg` : '';
  const base = `${s.reps}${weight}`;
  return s.count > 1 ? `${s.count}×${base}` : base;
}

export default function SetListModule({ sessions, prTypes }: Props): React.ReactElement | null {
  if (!sessions?.length) return null;

  const allSets: StrengthSet[] = sessions.flatMap((s) => s.strengthSets ?? []);
  if (!allSets.length) return null;

  const totalSets = allSets.length;
  const totalReps = allSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
  const totalVolume = allSets.reduce((sum, s) => sum + (s.reps ?? 0) * (s.weightKg ?? 0), 0);
  const groups = groupByExercise(allSets, prTypes);

  return (
    <Module
      title="Workout"
      right={`${groups.length} exercises · ${totalSets} sets`}
      span={6}
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
          </div>
        ))}
      </div>
      <div className="ex-footer">
        <span className="ex-footer__stat">{totalReps} <span>REPS</span></span>
        {totalVolume > 0 && (
          <span className="ex-footer__stat ex-footer__stat--aurora">
            {Math.round(totalVolume).toLocaleString()} <span>KG MOVED</span>
          </span>
        )}
      </div>
    </Module>
  );
}
