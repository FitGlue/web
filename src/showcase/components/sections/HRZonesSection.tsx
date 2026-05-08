import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';

interface HRZone { zone: number; label: string; minutes: number }

function parseHRZoneLine(line: string): HRZone | null {
  const match = line.match(/^Zone\s+(\d)\s*\(([^)]+)\).*?(\d+)\s*min/i);
  if (!match) return null;
  return { zone: parseInt(match[1]), label: `Z${match[1]} ${match[2]}`, minutes: parseInt(match[3]) };
}

export const HRZonesSection: React.FC<{ section: DescriptionSection; idx: number }> = ({
  section,
  idx,
}) => {
  const lines = section.content.split('\n').filter((l) => l.trim());
  const zones = lines.map((l) => parseHRZoneLine(l.trim())).filter((z): z is HRZone => z !== null);
  const maxMin = Math.max(...zones.map((z) => z.minutes), 1);

  return (
    <div className="showcase-section glass-card description-section-card" style={{ animationDelay: `${idx * 0.1}s` }}>
      <div className="section-header"><h2>{section.emoji} {section.title}</h2></div>
      <div className="hr-zones-list">
        {zones.map((z, i) => {
          const pct = Math.max((z.minutes / maxMin) * 100, 2);
          return (
            <div key={i} className="hr-zone-row" style={{ animationDelay: `${idx * 0.1 + i * 0.05}s` }}>
              <span className="hr-zone-label">{z.label}</span>
              <div className="hr-zone-bar">
                <div className={`hr-zone-fill zone-${z.zone}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="hr-zone-duration">{z.minutes} min</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
