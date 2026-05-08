import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';

function getEffortColor(label: string): string {
  const l = label.toLowerCase();
  if (l === 'easy') return '#4ADE80';
  if (l === 'moderate') return '#FBBF24';
  if (l === 'hard') return '#FB923C';
  if (l.includes('very')) return '#EF4444';
  if (l === 'max') return '#DC2626';
  return '#FBBF24';
}

export const EffortSection: React.FC<{ section: DescriptionSection; idx: number }> = ({
  section,
  idx,
}) => {
  const lines = section.content.split('\n').filter((l) => l.trim());
  let scoreValue = '';
  let scoreLabel = '';
  const factors: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim().replace(/^•\s*/, '');
    const scoreMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*10\s*[–-]\s*(.+)/);
    if (scoreMatch) {
      scoreValue = scoreMatch[1];
      scoreLabel = scoreMatch[2].trim();
      continue;
    }
    const altMatch = trimmed.match(/^(\d+(?:\.\d+)?)\/10/);
    if (altMatch && !scoreValue) {
      scoreValue = altMatch[1];
      scoreLabel = trimmed.replace(altMatch[0], '').replace(/^\s*[–-]\s*/, '').trim();
      continue;
    }
    if (trimmed) factors.push(trimmed);
  }

  const score = parseFloat(scoreValue);
  const color = scoreLabel ? getEffortColor(scoreLabel) : '#FBBF24';
  const rotation = isNaN(score) ? 0 : (score / 10) * 180 - 90;

  return (
    <div className="showcase-section glass-card description-section-card" style={{ animationDelay: `${idx * 0.1}s` }}>
      <div className="section-header"><h2>{section.emoji} {section.title}</h2></div>
      <div className="effort-score-body">
        {scoreValue && (
          <div className="effort-gauge">
            <svg viewBox="0 0 120 70" className="effort-gauge-svg" aria-hidden="true">
              <path d="M10,65 A50,50 0 0,1 110,65" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
              <path
                d="M10,65 A50,50 0 0,1 110,65"
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="157"
                strokeDashoffset={isNaN(score) ? 157 : 157 - (score / 10) * 157}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
              <line
                x1="60" y1="65"
                x2={60 + 35 * Math.cos((rotation - 90) * Math.PI / 180)}
                y2={65 + 35 * Math.sin((rotation - 90) * Math.PI / 180)}
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="effort-score-value" style={{ color }}>{scoreValue}/10</div>
            {scoreLabel && <div className="effort-score-label">{scoreLabel}</div>}
          </div>
        )}
        {factors.length > 0 && (
          <div className="effort-factors">
            {factors.map((f, i) => (
              <span key={i} className="effort-factor-chip">{f}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
