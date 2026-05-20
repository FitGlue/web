import React from 'react';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Session = components['schemas']['Session'];
type StrengthSet = components['schemas']['StrengthSet'];

interface Props {
  sessions?: Session[];
  prTypes?: Set<string>;
}

export default function SetListModule({ sessions, prTypes }: Props): React.ReactElement | null {
  if (!sessions?.length) return null;

  const allSets: StrengthSet[] = sessions.flatMap(s => s.strengthSets ?? []);
  if (!allSets.length) return null;

  const totalReps = allSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
  const totalWeight = allSets.reduce((sum, s) => sum + (s.weightKg ?? 0), 0);

  return (
    <Module title="Sets" right={`${allSets.length} sets · ${totalReps} reps · ${totalWeight.toFixed(1)} kg`} span={6}>
      <div className="set-list">
        {allSets.map((s, i) => {
          const isPR = s.exerciseName && prTypes?.has(s.exerciseName);
          return (
            <div key={i} className="set-row">
              <span className="set-row__name">
                {s.exerciseName}
                {isPR && <span className="stamp stamp--pr">PR</span>}
              </span>
              <span className="set-row__detail">
                {s.reps ?? 0} × {s.weightKg?.toFixed(1) ?? '0.0'} kg
              </span>
            </div>
          );
        })}
      </div>
    </Module>
  );
}
