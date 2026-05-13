import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { splitLines, stripBullet } from '../../utils/section';

export const StreakSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  let streakNumber: number | null = null;
  const details: string[] = [];

  for (const line of splitLines(section.content)) {
    const trimmed = stripBullet(line);
    // "5-day streak", "5 day streak", or "Day 5" / "day 5"
    const m = trimmed.match(/(\d+)[- ]day/i) ?? trimmed.match(/[Dd]ay\s+(\d+)/);
    if (m && streakNumber === null) { streakNumber = parseInt(m[1]); }
    else if (trimmed) details.push(trimmed);
  }

  const isPersonalBest = details.some((d) => /personal best|new.*record/i.test(d));
  const extraDetails = details.filter((d) => !/personal best|new.*record/i.test(d));

  return (
    <SectionCard section={section} idx={idx}>
      <div className="streak-body">
        <div className="streak-hero">
          <span className="streak-flame">🔥</span>
          <div className="streak-count-wrap">
            <span className="streak-count">{streakNumber ?? 1}</span>
            <span className="streak-count-label">day{(streakNumber ?? 1) !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {isPersonalBest && <span className="streak-pb-badge">🏆 Personal best!</span>}
        {extraDetails.length > 0 && (
          <ul className="streak-details">
            {extraDetails.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        )}
      </div>
    </SectionCard>
  );
};
