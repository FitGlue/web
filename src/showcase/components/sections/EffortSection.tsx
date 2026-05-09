import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { getIntensityColor, splitLines, stripBullet } from '../../utils/section';

export const EffortSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  let scoreValue = '';
  let scoreLabel = '';
  const factors: string[] = [];

  for (const line of splitLines(section.content)) {
    const trimmed = stripBullet(line);
    const scoreMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*10\s*[–-]\s*(.+)/);
    if (scoreMatch) { scoreValue = scoreMatch[1]; scoreLabel = scoreMatch[2].trim(); continue; }
    const altMatch = trimmed.match(/^(\d+(?:\.\d+)?)\/10/);
    if (altMatch && !scoreValue) {
      scoreValue = altMatch[1];
      scoreLabel = trimmed.replace(altMatch[0], '').replace(/^\s*[–-]\s*/, '').trim();
      continue;
    }
    if (trimmed) factors.push(trimmed);
  }

  const score = parseFloat(scoreValue);
  const color = scoreLabel ? getIntensityColor(scoreLabel) : '#FBBF24';
  const rotation = isNaN(score) ? 0 : (score / 10) * 180 - 90;

  return (
    <SectionCard section={section} idx={idx}>
      <div className="effort-score-body">
        {scoreValue && (
          <div className="effort-gauge">
            <svg viewBox="0 0 120 70" className="effort-gauge-svg" aria-hidden="true">
              <path d="M10,65 A50,50 0 0,1 110,65" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
              <path
                d="M10,65 A50,50 0 0,1 110,65"
                fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                strokeDasharray="157"
                strokeDashoffset={isNaN(score) ? 157 : 157 - (score / 10) * 157}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
              <line
                x1="60" y1="65"
                x2={60 + 35 * Math.cos((rotation - 90) * Math.PI / 180)}
                y2={65 + 35 * Math.sin((rotation - 90) * Math.PI / 180)}
                stroke={color} strokeWidth="3" strokeLinecap="round"
              />
            </svg>
            <div className="effort-score-value" style={{ color }}>{scoreValue}/10</div>
            {scoreLabel && <div className="effort-score-label">{scoreLabel}</div>}
          </div>
        )}
        {factors.length > 0 && (
          <div className="effort-factors">
            {factors.map((f, i) => <span key={i} className="effort-factor-chip">{f}</span>)}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
