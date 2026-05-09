import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatsBar } from '../StatsBar';
import type { StatItem } from '../StatsBar';
import { normalizeToLines, stripBullet } from '../../utils/section';

function parseCadence(content: string) {
  const lines = normalizeToLines(content);
  let avg = '', max = '', correlation = '';
  for (const line of lines) {
    const clean = stripBullet(line);
    const avgM = clean.match(/([\d.]+)\s*(?:spm|rpm|steps\/min)\s*avg/i);
    const maxM = clean.match(/([\d.]+)\s*(?:spm|rpm|steps\/min)\s*max/i);
    const corrM = clean.match(/Pace\s*Correlation:\s*([^(]+)/i);
    if (avgM) avg = avgM[1];
    if (maxM) max = maxM[1];
    if (corrM) correlation = corrM[1].trim();
  }
  return { avg, max, correlation };
}

export const CadenceStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const { avg, max, correlation } = parseCadence(section.content);
  const items: StatItem[] = [
    ...(avg ? [{ value: avg, label: 'Avg spm', color: '#8B5CF6' }] : []),
    ...(max ? [{ value: max, label: 'Max spm' }] : []),
    ...(correlation ? [{ value: correlation, note: true }] : []),
  ];
  return <StatsBar items={items} />;
};

export const CadenceSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <CadenceStats section={section} />
  </SectionCard>
);
