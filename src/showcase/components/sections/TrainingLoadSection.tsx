import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatPills } from '../StatPills';
import { IntensityBadge } from '../IntensityBadge';
import { getIntensityClass } from '../../utils/section';

// Zone thresholds on the bar (as % of MAX_TRIMP)
const MAX_TRIMP = 500;
const ZONES = [
  { label: 'Easy',     pct: (100 / MAX_TRIMP) * 100 },
  { label: 'Moderate', pct: (200 / MAX_TRIMP) * 100 },
  { label: 'Hard',     pct: (300 / MAX_TRIMP) * 100 },
  { label: 'Extreme',  pct: (400 / MAX_TRIMP) * 100 },
];

const ZONE_CONTEXT: Record<string, string> = {
  recovery:  'Light session · aids active recovery',
  easy:      'Base aerobic · low fatigue',
  moderate:  'Solid stimulus · manageable load',
  hard:      'High load · prioritise recovery',
  'very hard': 'Very high load · rest tomorrow',
  extreme:   'Extreme load · risk of overtraining',
};

const GRADIENTS: Record<string, string> = {
  recovery: 'linear-gradient(90deg, #67e8f9, #06b6d4)',
  easy:     'linear-gradient(90deg, #4ade80, #22c55e)',
  moderate: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
  hard:     'linear-gradient(90deg, #fb923c, #f97316)',
  extreme:  'linear-gradient(90deg, #ef4444, #dc2626)',
};

export const TrainingLoadSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const text = section.content.trim();
  const m = text.match(/^([\d.]+)\s*\(([^)]+)\)/);

  if (!m) {
    return (
      <SectionCard section={section} idx={idx}>
        <StatPills items={text.split(' • ').map((p) => p.trim()).filter(Boolean)} />
      </SectionCard>
    );
  }

  const trimp = parseFloat(m[1]);
  const label = m[2];
  const badgeClass = getIntensityClass(label);
  const fillPct = Math.min((trimp / MAX_TRIMP) * 100, 100);
  const gradient = GRADIENTS[badgeClass] ?? GRADIENTS['moderate'];
  const context = ZONE_CONTEXT[label.toLowerCase()] ?? '';

  return (
    <SectionCard section={section} idx={idx}>
      <div className="training-load-display">
        <span className="training-load-value">{m[1]}</span>
        <IntensityBadge label={label} size="large" />
      </div>
      {context && <p className="training-load-context">{context}</p>}
      <div className="training-load-scale">
        <div className="training-load-fill" style={{ width: `${fillPct}%`, background: gradient }} />
        {ZONES.map((z) => (
          <div key={z.label} className="training-load-marker" style={{ left: `${z.pct}%` }} title={z.label} />
        ))}
      </div>
      <div className="training-load-scale-labels">
        <span>0</span>
        <span>Recovery</span>
        <span>Easy</span>
        <span>Mod</span>
        <span>Hard</span>
        <span>500+</span>
      </div>
    </SectionCard>
  );
};
