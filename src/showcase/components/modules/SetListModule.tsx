import React from 'react';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Session = components['schemas']['Session'];
type StrengthSet = components['schemas']['StrengthSet'];

interface Props {
  sessions?: Session[];
  prTypes?: Set<string>;
}

interface CombinedSet {
  exerciseName?: string;
  reps: number;
  weightKg: number;
  count: number;
  isPR: boolean;
}

/** Group consecutive sets that share the same exercise name, reps, and weight. */
function combineSets(sets: StrengthSet[], prTypes?: Set<string>): CombinedSet[] {
  const combined: CombinedSet[] = [];

  for (const set of sets) {
    const reps = set.reps ?? 0;
    const weightKg = set.weightKg ?? 0;
    const name = set.exerciseName ?? '';
    const isPR = !!(name && prTypes?.has(name));

    const last = combined[combined.length - 1];
    if (
      last &&
      last.exerciseName === name &&
      last.reps === reps &&
      last.weightKg === weightKg
    ) {
      last.count += 1;
    } else {
      combined.push({ exerciseName: name || undefined, reps, weightKg, count: 1, isPR });
    }
  }

  return combined;
}

export default function SetListModule({ sessions, prTypes }: Props): React.ReactElement | null {
  if (!sessions?.length) return null;

  const allSets: StrengthSet[] = sessions.flatMap(s => s.strengthSets ?? []);
  if (!allSets.length) return null;

  const totalReps = allSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
  const totalWeight = allSets.reduce((sum, s) => sum + (s.weightKg ?? 0), 0);
  const combinedSets = combineSets(allSets, prTypes);

  return (
    <Module title="Sets" right={`${allSets.length} sets · ${totalReps} reps · ${totalWeight.toFixed(1)} kg`} span={6}>
      <div className="set-list">
        {combinedSets.map((s, i) => (
          <div key={i} className="set-row">
            <span className="set-row__name">
              {s.exerciseName}
              {s.isPR && <span className="stamp stamp--pr">PR</span>}
            </span>
            <span className="set-row__detail">
              {s.count > 1
                ? `${s.count} × ${s.reps} × ${s.weightKg.toFixed(1)} kg`
                : `${s.reps} × ${s.weightKg.toFixed(1)} kg`}
            </span>
          </div>
        ))}
      </div>
    </Module>
  );
}
