import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { DetailList } from '../DetailList';
import { extractEmojiPrefix, splitLines, stripBullet } from '../../utils/section';

export const StreakSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  let streakNumber: number | null = null;
  const badges: string[] = [];
  const details: string[] = [];

  for (const line of splitLines(section.content)) {
    const trimmed = stripBullet(line);
    const streakMatch = trimmed.match(/(\d+)[- ]day/i);
    if (streakMatch && streakNumber === null) streakNumber = parseInt(streakMatch[1]);
    if (/personal best|new.*record/i.test(trimmed)) badges.push(trimmed);
    else details.push(trimmed);
  }

  const filteredDetails = details.filter((d) => !(/\d+[- ]day/i.test(d)) || streakNumber === null);
  const detailRows = filteredDetails.map((d) => {
    const { emoji, rest } = extractEmojiPrefix(d);
    return { emoji: emoji || '•', text: rest || d };
  });

  return (
    <SectionCard section={section} idx={idx}>
      <div className="progress-section-body">
        {streakNumber !== null && (
          <div>
            <span className="streak-number">{streakNumber}</span>{' '}
            <span className="streak-label">day streak 🔥</span>
          </div>
        )}
        {badges.map((b, i) => <span key={i} className="streak-badge">🏆 {b}</span>)}
        {detailRows.length > 0 && <DetailList items={detailRows} />}
      </div>
    </SectionCard>
  );
};
