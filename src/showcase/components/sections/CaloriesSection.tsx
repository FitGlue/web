import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatPills } from '../StatPills';

export const CaloriesSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const text = section.content.trim();
  const m = text.match(/^([\d.]+)\s*kcal\s*≈?\s*(.+)$/);

  if (!m) {
    return (
      <SectionCard section={section} idx={idx}>
        <StatPills items={text.split(' • ').map((p) => p.trim()).filter(Boolean)} />
      </SectionCard>
    );
  }

  return (
    <SectionCard section={section} idx={idx}>
      <div className="calories-display">
        <div className="calories-value-block">
          <span className="calories-number">{m[1]}</span>
          <div className="calories-unit">kcal</div>
        </div>
        <div className="calories-food-callout">≈ {m[2].trim()}</div>
      </div>
    </SectionCard>
  );
};
