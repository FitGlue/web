import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatsBar } from '../StatsBar';
import type { StatItem } from '../StatsBar';
import { normalizeToLines, stripBullet } from '../../utils/section';

function parsePower(content: string) {
  const lines = normalizeToLines(content);
  let avg = '', max = '', ftp = '';
  const peaks: { label: string; value: string }[] = [];
  for (const line of lines) {
    const clean = stripBullet(line);
    const avgM = clean.match(/([\d.]+)W\s*avg/i);
    const maxM = clean.match(/([\d.]+)W\s*max/i);
    const ftpM = clean.match(/Est\.\s*FTP:\s*([\d.]+)W/i);
    const peakM = clean.match(/Peak\s+([\w]+):\s*([\d.]+)W/i);
    if (avgM) avg = avgM[1];
    if (maxM) max = maxM[1];
    if (ftpM) ftp = ftpM[1];
    if (peakM) peaks.push({ label: peakM[1], value: peakM[2] });
  }
  return { avg, max, ftp, peaks };
}

export const PowerStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const { avg, max, ftp, peaks } = parsePower(section.content);
  const items: StatItem[] = [
    ...(avg ? [{ value: `${avg}W`, label: 'Avg', color: '#F59E0B' }] : []),
    ...(max ? [{ value: `${max}W`, label: 'Max' }] : []),
    ...(ftp ? [{ value: `${ftp}W`, label: 'Est. FTP', color: '#F59E0B' }] : []),
    ...peaks.map((p) => ({ value: `${p.value}W`, label: `Peak ${p.label}` })),
  ];
  return <StatsBar items={items} />;
};

export const PowerSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <PowerStats section={section} />
  </SectionCard>
);
