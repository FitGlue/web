import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatsBar } from '../StatsBar';
import type { StatItem } from '../StatsBar';
import { splitLines } from '../../utils/section';

function parseElevation(content: string) {
  const parts = (splitLines(content)[0] ?? '').split(' • ').map((p) => p.trim()).filter(Boolean);
  return parts.map((part) => {
    const m = part.match(/^([+-]?[\d.]+\w*)\s+(.+)$/);
    if (m) {
      const label = m[2].toLowerCase();
      const color = label.includes('gain') ? '#4ade80' : label.includes('loss') ? '#fb923c' : '#fff';
      return { value: m[1], label: m[2], color };
    }
    return { value: part, label: '', color: '#fff' as string };
  });
}

export const ElevationStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const stats = parseElevation(section.content);
  const items: StatItem[] = stats.map((s) => ({ value: s.value, label: s.label, color: s.color }));
  return <StatsBar items={items} />;
};

export const ElevationSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <ElevationStats section={section} />
  </SectionCard>
);
