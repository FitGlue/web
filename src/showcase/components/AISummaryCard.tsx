import React from 'react';
import type { DescriptionSection } from './DescriptionSections';
import { SectionCard } from './SectionCard';

export const AISummaryCard: React.FC<{ section: DescriptionSection; idx?: number }> = ({ section, idx = 0 }) => (
  <SectionCard section={section} idx={idx} className="ai-summary-card" headerClassName="ai-summary-header">
    <div className="ai-summary-prose">{section.content}</div>
  </SectionCard>
);
