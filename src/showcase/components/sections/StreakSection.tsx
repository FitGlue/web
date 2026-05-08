import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';

export const StreakSection: React.FC<{ section: DescriptionSection; idx: number }> = ({
  section,
  idx,
}) => {
  const lines = section.content.split('\n').filter((l) => l.trim());
  let streakNumber: number | null = null;
  const badges: string[] = [];
  const details: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim().replace(/^•\s*/, '');
    const streakMatch = trimmed.match(/(\d+)[- ]day/i);
    if (streakMatch && streakNumber === null) streakNumber = parseInt(streakMatch[1]);
    if (/personal best|new.*record/i.test(trimmed)) {
      badges.push(trimmed);
    } else {
      details.push(trimmed);
    }
  }

  const filteredDetails = details.filter((d) => !(/\d+[- ]day/i.test(d)) || streakNumber === null);

  return (
    <div className="showcase-section glass-card description-section-card" style={{ animationDelay: `${idx * 0.1}s` }}>
      <div className="section-header"><h2>{section.emoji} {section.title}</h2></div>
      <div className="progress-section-body">
        {streakNumber !== null && (
          <div>
            <span className="streak-number">{streakNumber}</span>{' '}
            <span className="streak-label">day streak 🔥</span>
          </div>
        )}
        {badges.map((b, i) => (
          <span key={i} className="streak-badge">🏆 {b}</span>
        ))}
        {filteredDetails.length > 0 && (
          <div className="progress-details">
            {filteredDetails.map((d, i) => {
              const emoji = [...d][0] ?? '•';
              const rest = d.slice(emoji.length).trim();
              return (
                <div key={i} className="progress-detail-row">
                  <span className="detail-emoji">{emoji}</span>
                  {rest || d}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
