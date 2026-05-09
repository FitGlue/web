import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatPills } from '../StatPills';

export const CompactPillsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const parts = section.content.split(' • ').map((p) => p.trim()).filter(Boolean);
  return (
    <SectionCard section={section} idx={idx}>
      {parts.length > 1 ? (
        <StatPills items={parts} />
      ) : (
        <div className="compact-pill-value">{section.content}</div>
      )}
    </SectionCard>
  );
};
