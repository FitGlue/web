import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { HorizontalBar } from '../HorizontalBar';
import { splitLines } from '../../utils/section';

interface HRZone { zone: number; label: string; minutes: number }

function parseHRZoneLine(line: string): HRZone | null {
  const match = line.match(/^Zone\s+(\d)\s*\(([^)]+)\).*?(\d+)\s*min/i);
  if (!match) return null;
  return { zone: parseInt(match[1]), label: `Z${match[1]} ${match[2]}`, minutes: parseInt(match[3]) };
}

export const HRZonesSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const zones = splitLines(section.content).map((l) => parseHRZoneLine(l.trim())).filter((z): z is HRZone => z !== null);
  const maxMin = Math.max(...zones.map((z) => z.minutes), 1);

  return (
    <SectionCard section={section} idx={idx}>
      <div className="hr-zones-list">
        {zones.map((z, i) => (
          <HorizontalBar
            key={i}
            label={z.label}
            percentage={Math.max((z.minutes / maxMin) * 100, 2)}
            fillClass={`zone-${z.zone}`}
            rightContent={<span>{z.minutes} min</span>}
            animationDelay={`${idx * 0.1 + i * 0.05}s`}
          />
        ))}
      </div>
    </SectionCard>
  );
};
