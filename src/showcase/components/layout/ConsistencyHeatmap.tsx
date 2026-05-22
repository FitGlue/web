import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type WeeklyStreakHistory = components['schemas']['WeeklyStreakHistory'];

interface Props {
  streakHistory?: WeeklyStreakHistory;
}

export default function ConsistencyHeatmap({ streakHistory }: Props): React.ReactElement | null {
  const weeks = streakHistory?.weeklyActive;
  if (!weeks || weeks.length < 8) return null;

  const show = weeks.slice(-52);
  const activeCount = show.filter(Boolean).length;
  const pct = Math.round((activeCount / show.length) * 100);

  // Find current streak (trailing consecutive active weeks)
  let currentStreak = 0;
  for (let i = show.length - 1; i >= 0; i--) {
    if (show[i]) currentStreak++;
    else break;
  }

  return (
    <div className="heatmap-band">
      <div className="heatmap-band__label">
        <span>📅 CONSISTENCY · {activeCount}/{show.length} WEEKS ACTIVE · {pct}%</span>
        {currentStreak >= 2 && (
          <span className="heatmap-band__streak">🔥 {currentStreak} WK STREAK</span>
        )}
      </div>
      <div className="heatmap-grid">
        {show.map((active, i) => (
          <div
            key={i}
            className={`heatmap-sq${active ? ' heatmap-sq--on' : ''}`}
            title={`Week ${i + 1}${active ? ': Active' : ': Rest'}`}
          />
        ))}
      </div>
    </div>
  );
}
