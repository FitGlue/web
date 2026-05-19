import React from 'react';
import type { GoalTrackerSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: GoalTrackerSummary;
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
              <span>{g.current}/{g.target} {g.unit}</span>
            </div>
            <small>{g.daysRemaining} days left</small>
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
