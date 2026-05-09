import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatPills } from '../StatPills';
import { IntensityBadge } from '../IntensityBadge';
import { getIntensityClass } from '../../utils/section';

const GRADIENTS: Record<string, string> = {
  recovery: 'linear-gradient(90deg, #67e8f9, #06b6d4)',
  easy: 'linear-gradient(90deg, #4ade80, #22c55e)',
  moderate: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
  hard: 'linear-gradient(90deg, #fb923c, #f97316)',
  extreme: 'linear-gradient(90deg, #ef4444, #dc2626)',
};

export const TrainingLoadSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const text = section.content.trim();
  const m = text.match(/^([\d.]+)\s*\((\w+)\)$/);

  if (!m) {
    return (
      <SectionCard section={section} idx={idx}>
        <StatPills items={text.split(' • ').map((p) => p.trim()).filter(Boolean)} />
      </SectionCard>
    );
  }

  const badgeClass = getIntensityClass(m[2]);
  const fillPct = Math.min((parseFloat(m[1]) / 200) * 100, 100);

  return (
    <SectionCard section={section} idx={idx}>
      <div className="training-load-display">
        <span className="training-load-value">{m[1]}</span>
        <IntensityBadge label={m[2]} size="large" />
      </div>
      <div className="training-load-scale">
        <div className="training-load-fill" style={{ width: `${fillPct}%`, background: GRADIENTS[badgeClass] }} />
      </div>
    </SectionCard>
  );
};
