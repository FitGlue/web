import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';

export const GoalSection: React.FC<{ section: DescriptionSection; idx: number }> = ({
  section,
  idx,
}) => {
  const lines = section.content.split('\n').filter((l) => l.trim());
  let percentage = 0;
  let progressText = '';
  const detailRows: { emoji: string; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim().replace(/^•\s*/, '');
    const barMatch = trimmed.match(/\[.*?\]\s*(\d+)%\s*(.+)/);
    if (barMatch) {
      percentage = parseInt(barMatch[1]);
      progressText = barMatch[2];
      continue;
    }
    const pctMatch = trimmed.match(/(\d+)%/);
    if (pctMatch && !percentage) percentage = parseInt(pctMatch[1]);
    const emoji = [...trimmed][0] ?? '•';
    const rest = trimmed.slice(emoji.length).trim();
    detailRows.push({ emoji, text: rest || trimmed });
  }

  const clamped = Math.min(percentage, 100);

  return (
    <div className="showcase-section glass-card description-section-card" style={{ animationDelay: `${idx * 0.1}s` }}>
      <div className="section-header"><h2>{section.emoji} {section.title}</h2></div>
      <div className="progress-section-body">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${clamped}%` }}>
            {percentage >= 50 && (
              <span className="progress-bar-label">
                {percentage}%{progressText ? ` — ${progressText}` : ''}
              </span>
            )}
          </div>
          {percentage < 50 && (
            <span
              className="progress-bar-label outside"
              style={{ left: `${clamped}%`, marginLeft: '8px' }}
            >
              {percentage}%{progressText ? ` — ${progressText}` : ''}
            </span>
          )}
        </div>
        <div className="progress-details">
          {detailRows.map((d, i) => (
            <div key={i} className="progress-detail-row">
              <span className="detail-emoji">{d.emoji}</span>
              {d.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
