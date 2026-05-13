import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatsBar } from '../StatsBar';
import type { StatItem } from '../StatsBar';
import { splitLines, stripBullet } from '../../utils/section';

function parseHR(content: string) {
  let min = '', avg = '', max = '', driftText = '', driftNote = '';
  for (const line of splitLines(content)) {
    const clean = stripBullet(line);
    const minM  = clean.match(/(\d+)\s*bpm\s*min/i);
    const avgM  = clean.match(/(\d+)\s*bpm\s*avg/i);
    const maxM  = clean.match(/(\d+)\s*bpm\s*max/i);
    const driftM = clean.match(/Drift:\s*([+-]?\d+\s*bpm)\s*\(([^)]+)\)/i);
    if (minM)  min  = minM[1];
    if (avgM)  avg  = avgM[1];
    if (maxM)  max  = maxM[1];
    if (driftM) { driftText = driftM[1]; driftNote = driftM[2]; }
  }
  return { min, avg, max, driftText, driftNote };
}

export const HeartRateStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const { min, avg, max, driftText, driftNote } = parseHR(section.content);
  const driftVal = parseInt(driftText);
  const driftColor = Math.abs(driftVal) > 15 ? '#fb923c' : 'rgba(255,255,255,0.5)';

  const items: StatItem[] = [
    ...(min ? [{ value: min, label: 'Min bpm', color: '#60a5fa' }] : []),
    ...(avg ? [{ value: avg, label: 'Avg bpm' }] : []),
    ...(max ? [{ value: max, label: 'Max bpm', color: '#f87171' }] : []),
    ...(driftText ? [{ value: driftText.replace(/\s*bpm/, ''), label: driftNote ? `Drift · ${driftNote}` : 'Drift bpm', color: driftColor }] : []),
  ];
  return <StatsBar items={items} />;
};

export const HeartRateSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <HeartRateStats section={section} />
  </SectionCard>
);
