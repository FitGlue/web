import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatsBar } from '../StatsBar';
import type { StatItem } from '../StatsBar';

function parsePaceStats(content: string) {
  const firstLine = content.split('\n')[0] ?? '';
  let avg = '', best = '';
  for (const p of firstLine.split(' • ')) {
    const avgM = p.trim().match(/^([\d:]+\/km)\s*avg/i);
    const bestM = p.trim().match(/^([\d:]+\/km)\s*best/i);
    if (avgM) avg = avgM[1];
    if (bestM) best = bestM[1];
  }
  return { avg, best };
}

export const PaceStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const { avg, best } = parsePaceStats(section.content);
  const items: StatItem[] = [
    ...(avg ? [{ value: avg, label: 'Avg Pace', color: '#6366F1' }] : []),
    ...(best ? [{ value: best, label: 'Best Pace' }] : []),
  ];
  return <StatsBar items={items} />;
};

export const PaceSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <PaceStats section={section} />
  </SectionCard>
);
