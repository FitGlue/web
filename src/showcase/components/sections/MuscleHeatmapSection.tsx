import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';

interface MuscleBar { name: string; filled: number; total: number }

function parseMuscleBars(content: string): MuscleBar[] {
  return content
    .split('\n')
    .filter((l) => l.trim())
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

export const MuscleHeatmapSection: React.FC<{ section: DescriptionSection; idx: number }> = ({
  section,
  idx,
}) => {
  const muscles = parseMuscleBars(section.content);

  if (muscles.length === 0) {
    const parts = section.content.split(' • ').map((p) => p.trim()).filter(Boolean);
    return (
      <div className="showcase-section glass-card description-section-card" style={{ animationDelay: `${idx * 0.1}s` }}>
        <div className="section-header"><h2>{section.emoji} {section.title}</h2></div>
        <div className="enhanced-pills">
          {parts.map((p, i) => <span key={i} className="stat-pill"><span className="stat-pill-value">{p}</span></span>)}
        </div>
      </div>
    );
  }

  return (
    <div className="showcase-section glass-card description-section-card" style={{ animationDelay: `${idx * 0.1}s` }}>
      <div className="section-header"><h2>{section.emoji} {section.title}</h2></div>
      <div className="muscle-heatmap-grid">
        {muscles.map((m, i) => {
          const pct = (m.filled / m.total) * 100;
          return (
            <div key={i} className="muscle-bar-row" style={{ animationDelay: `${idx * 0.1 + i * 0.04}s` }}>
              <span className="muscle-bar-label">{m.name}</span>
              <div className="muscle-bar-track">
                <div className="muscle-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="muscle-bar-level">{m.filled}/{m.total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
