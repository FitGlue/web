import React from 'react';
import type { GoalTrackerSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: GoalTrackerSummary;
}

// Show whole numbers as integers and fractional progress to one decimal,
// so a raw value like 10.0102001953125 renders as "10".
function formatGoalValue(n: number): string {
  return Number.isInteger(n) ? String(n) : Number(n.toFixed(1)).toString();
}

export default function GoalTrackerModule({ data }: Props): React.ReactElement | null {
  if (!data || !data.goals?.length) return null;

  return (
    <Module title="Goal Tracker" span={6}>
      {data.goals.map((g, i) => {
        const pct = Math.min((g.current / g.target) * 100, 100);
        return (
          <div key={i} className="goal-entry">
            <div className="goal-entry__header">
              <span>{g.label}</span>
              <span>{formatGoalValue(g.current)}/{g.target} {g.unit}</span>
            </div>
            <small>{g.daysRemaining} day{g.daysRemaining === 1 ? '' : 's'} left</small>
            <div className="goal-entry__bar">
              <div className="goal-entry__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            {g.onPace
              ? <span className="goal-entry__on-pace">ON PACE ✓</span>
              : <span className="goal-entry__off-pace">BEHIND ✗</span>
            }
          </div>
        );
      })}
    </Module>
  );
}
