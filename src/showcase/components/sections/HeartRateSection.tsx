import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatBlock } from '../StatBlock';
import { splitLines, stripBullet } from '../../utils/section';

function parseHR(content: string) {
  let min = '', avg = '', max = '', driftText = '', driftNote = '';
  for (const line of splitLines(content)) {
    const clean = stripBullet(line);
    if (clean.match(/(\d+)\s*bpm\s*min/i)) min = clean.match(/(\d+)\s*bpm\s*min/i)![1];
    if (clean.match(/(\d+)\s*bpm\s*avg/i)) avg = clean.match(/(\d+)\s*bpm\s*avg/i)![1];
    if (clean.match(/(\d+)\s*bpm\s*max/i)) max = clean.match(/(\d+)\s*bpm\s*max/i)![1];
    const driftM = clean.match(/Drift:\s*([+-]?\d+\s*bpm)\s*\(([^)]+)\)/i);
    if (driftM) { driftText = driftM[1]; driftNote = driftM[2]; }
  }
  return { min, avg, max, driftText, driftNote };
}

export const HeartRateStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const { min, avg, max, driftText, driftNote } = parseHR(section.content);
  const driftVal = parseInt(driftText);
  const badgeClass = Math.abs(driftVal) > 15 ? 'warning' : 'normal';
  return (
    <div className="hr-dashboard">
      {min && <StatBlock value={min} label="Min" unit="bpm" valueClassName="min" />}
      {avg && <StatBlock value={avg} label="Avg" unit="bpm" valueClassName="avg" />}
      {max && <StatBlock value={max} label="Max" unit="bpm" valueClassName="max" />}
      {driftText && (
        <StatBlock value={driftText.replace(/\s*bpm/, '')} label="Drift">
          <span className={`hr-drift-badge ${badgeClass}`}>{driftNote}</span>
        </StatBlock>
      )}
    </div>
  );
};

export const HeartRateSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <HeartRateStats section={section} />
  </SectionCard>
);
