import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { DetailList } from '../DetailList';
import { extractEmojiPrefix, splitLines, stripBullet } from '../../utils/section';

export const GoalSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  let percentage = 0;
  let progressText = '';
  const detailRows: { emoji: string; text: string }[] = [];

  for (const line of splitLines(section.content)) {
    const trimmed = stripBullet(line);
    const barMatch = trimmed.match(/\[.*?\]\s*(\d+)%\s*(.+)/);
    if (barMatch) { percentage = parseInt(barMatch[1]); progressText = barMatch[2]; continue; }
    const pctMatch = trimmed.match(/(\d+)%/);
    if (pctMatch && !percentage) percentage = parseInt(pctMatch[1]);
    const { emoji, rest } = extractEmojiPrefix(trimmed);
    detailRows.push({ emoji: emoji || '•', text: rest || trimmed });
  }

  const clamped = Math.min(percentage, 100);

  return (
    <SectionCard section={section} idx={idx}>
      <div className="progress-section-body">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${clamped}%` }}>
            {percentage >= 50 && (
              <span className="progress-bar-label">{percentage}%{progressText ? ` — ${progressText}` : ''}</span>
            )}
          </div>
          {percentage < 50 && (
            <span className="progress-bar-label outside" style={{ left: `${clamped}%`, marginLeft: '8px' }}>
              {percentage}%{progressText ? ` — ${progressText}` : ''}
            </span>
          )}
        </div>
        <DetailList items={detailRows} />
      </div>
    </SectionCard>
  );
};
