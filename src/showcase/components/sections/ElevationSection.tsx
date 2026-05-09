import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { splitLines } from '../../utils/section';

function parseElevation(content: string) {
  const lines = splitLines(content);
  const firstLine = lines[0] ?? '';
  const sparkline = lines.length > 1 ? lines[1].replace(/^📈\s*/, '') : '';
  const parts = firstLine.split(' • ').map((p) => p.trim()).filter(Boolean);
  const stats = parts.map((part) => {
    const m = part.match(/^([+-]?[\d.]+\w*)\s+(.+)$/);
    if (m) {
      const label = m[2].toLowerCase();
      const arrow = label.includes('gain') ? '↑' : label.includes('loss') ? '↓' : '▲';
      const color = label.includes('gain') ? '#4ade80' : label.includes('loss') ? '#fb923c' : '#fff';
      return { value: m[1], label: m[2], arrow, color };
    }
    return { value: part, label: '', arrow: '', color: '#fff' };
  });
  return { stats, sparkline };
}

export const ElevationStats: React.FC<{ section: DescriptionSection }> = ({ section }) => {
  const { stats, sparkline } = parseElevation(section.content);
  return (
    <>
      <div className="elevation-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="elevation-stat">
            <span className="elevation-stat-arrow">{s.arrow}</span>
            <span className="elevation-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="elevation-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      {sparkline && <div className="elevation-sparkline">{sparkline}</div>}
    </>
  );
};

export const ElevationSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <ElevationStats section={section} />
  </SectionCard>
);
