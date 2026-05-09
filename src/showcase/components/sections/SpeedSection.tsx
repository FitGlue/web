import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatsBar } from '../StatsBar';
import type { StatItem } from '../StatsBar';
import { normalizeToLines, stripBullet } from '../../utils/section';

function parseSpeed(content: string) {
  const lines = normalizeToLines(content);
  let avg = '', max = '', consistency = '', consistencyLabel = '';
  for (const line of lines) {
    const clean = stripBullet(line);
    const avgM = clean.match(/([\d.]+)\s*km\/h\s*avg/i);
    const maxM = clean.match(/([\d.]+)\s*km\/h\s*max/i);
    const consM = clean.match(/Consistency:\s*([\d.]+)%\s*\(([^)]+)\)/i);
    if (avgM) avg = avgM[1];
    if (maxM) max = maxM[1];
    if (consM) { consistency = consM[1]; consistencyLabel = consM[2]; }
  }
  return { avg, max, consistency, consistencyLabel };
}

export const SpeedStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const { avg, max, consistency, consistencyLabel } = parseSpeed(section.content);
  const items: StatItem[] = [
    ...(avg ? [{ value: avg, label: 'Avg km/h', color: '#06B6D4' }] : []),
    ...(max ? [{ value: max, label: 'Max km/h' }] : []),
    ...(consistency ? [{ value: `${consistency}%`, label: consistencyLabel || 'Consistency' }] : []),
  ];
  return <StatsBar items={items} />;
};

export const SpeedSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <SpeedStats section={section} />
  </SectionCard>
);
