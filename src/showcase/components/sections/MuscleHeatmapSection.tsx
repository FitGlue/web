import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { HorizontalBar } from '../HorizontalBar';
import { StatPills } from '../StatPills';
import { splitLines } from '../../utils/section';

interface MuscleBar { name: string; filled: number; total: number }

function parseMuscleBars(content: string): MuscleBar[] {
  return splitLines(content)
    .map((line) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx < 0) return null;
      const name = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();

      const filledCount = [...value].filter((c) => c === '🟪').length;
      const totalCount = [...value].filter((c) => c === '🟪' || c === '⬜').length;
      if (totalCount > 0) return { name, filled: filledCount, total: totalCount };

      const pctMatch = value.match(/^(\d+)%$/);
      if (pctMatch) return { name, filled: parseInt(pctMatch[1]), total: 100 };

      const textLevels: Record<string, number> = { 'Very High': 100, High: 75, Medium: 50, Low: 25 };
      if (Object.prototype.hasOwnProperty.call(textLevels, value)) {
        return { name, filled: textLevels[value], total: 100 };
      }
      return null;
    })
    .filter((x): x is MuscleBar => x !== null);
}

export const MuscleHeatmapSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const muscles = parseMuscleBars(section.content);

  if (muscles.length === 0) {
    return (
      <SectionCard section={section} idx={idx}>
        <StatPills items={section.content.split(' • ').map((p) => p.trim()).filter(Boolean)} />
      </SectionCard>
    );
  }

  return (
    <SectionCard section={section} idx={idx}>
      <div className="muscle-heatmap-grid">
        {muscles.map((m, i) => (
          <HorizontalBar
            key={i}
            label={m.name}
            percentage={(m.filled / m.total) * 100}
            rightContent={<span>{m.filled}/{m.total}</span>}
            animationDelay={`${idx * 0.1 + i * 0.04}s`}
          />
        ))}
      </div>
    </SectionCard>
  );
};
