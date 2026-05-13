import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { IntensityBadge } from '../IntensityBadge';
import { getIntensityClass, getIntensityColor, splitLines, stripBullet } from '../../utils/section';

const BAR_GRADIENTS: Record<string, string> = {
  recovery: 'linear-gradient(90deg, #67e8f9, #06b6d4)',
  easy:     'linear-gradient(90deg, #4ade80, #22c55e)',
  moderate: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
  hard:     'linear-gradient(90deg, #fb923c, #f97316)',
  extreme:  'linear-gradient(90deg, #ef4444, #dc2626)',
};

export const EffortSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  let scoreValue = '';
  let scoreLabel = '';
  const factors: string[] = [];

  for (const line of splitLines(section.content)) {
    const trimmed = stripBullet(line);
    // Support both /100 and /10 scale from enricher
    const m100 = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*100\s*[–\-]\s*(.+)/);
    const m10  = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*10\s*[–\-]\s*(.+)/);
    const alt  = trimmed.match(/^(\d+(?:\.\d+)?)\/10/);
    if (m100 && !scoreValue) { scoreValue = m100[1]; scoreLabel = m100[2].trim(); continue; }
    if (m10  && !scoreValue) { scoreValue = m10[1];  scoreLabel = m10[2].trim();  continue; }
    if (alt  && !scoreValue) {
      scoreValue = alt[1];
      scoreLabel = trimmed.replace(alt[0], '').replace(/^\s*[–\-]\s*/, '').trim();
      continue;
    }
    if (trimmed) factors.push(trimmed);
  }

  const score = parseFloat(scoreValue);
  // Scores >10 are on the 0-100 scale
  const isHundredScale = score > 10;
  const fillPct = isNaN(score) ? 0 : isHundredScale ? Math.min(score, 100) : Math.min((score / 10) * 100, 100);
  const displayScore = isNaN(score) ? '' : isHundredScale ? `${Math.round(score)}/100` : `${scoreValue}/10`;
  const color = scoreLabel ? getIntensityColor(scoreLabel) : '#FBBF24';
  const badgeClass = scoreLabel ? getIntensityClass(scoreLabel) : 'moderate';
  const barGradient = BAR_GRADIENTS[badgeClass] ?? `linear-gradient(90deg, ${color}, ${color})`;

  return (
    <SectionCard section={section} idx={idx}>
      <div className="effort-body">
        {displayScore && (
          <div className="effort-header">
            <span className="effort-score-num" style={{ color }}>{displayScore}</span>
            {scoreLabel && <IntensityBadge label={scoreLabel} />}
          </div>
        )}
        {!isNaN(score) && (
          <div className="effort-bar-track">
            <div className="effort-bar-fill" style={{ width: `${fillPct}%`, background: barGradient }} />
          </div>
        )}
        {factors.length > 0 && (
          <div className="effort-chips">
            {factors.map((f, i) => <span key={i} className="effort-chip">{f}</span>)}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
