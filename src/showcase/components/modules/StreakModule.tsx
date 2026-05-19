import React from 'react';
import {
  type StreakSummary,
  StreakDayState,
} from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: StreakSummary;
}

function dayClass(state: StreakDayState): string {
  if (state === StreakDayState.STREAK_DAY_STATE_ACTIVE) return 'streak-day streak-day--active';
  if (state === StreakDayState.STREAK_DAY_STATE_REST) return 'streak-day streak-day--rest';
  return 'streak-day streak-day--off';
}

export default function StreakModule({ data }: Props): React.ReactElement | null {
  if (!data || data.currentDays === 0) return null;

  const days = data.calendar.slice(-28);

  return (
    <Module title="Streak" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.currentDays}</span>
          <span className="mini__label">CURRENT</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.longestDays}</span>
          <span className="mini__label">LONGEST</span>
        </div>
      </div>
      <div className="streak-calendar">
        {days.map(d => (
          <div key={d.date} className={dayClass(d.state)} title={d.date} />
        ))}
      </div>
    </Module>
  );
}
