import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { splitLines, stripBullet } from '../../utils/section';

export const BulletListSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => (
  <SectionCard section={section} idx={idx}>
    <div className="bullet-list-rows">
      {splitLines(section.content).map((line, i) => {
        const clean = stripBullet(line);
        const colonIdx = clean.indexOf(':');
        if (colonIdx > 0) {
          return (
            <div key={i} className="bullet-stat-row">
              <span className="bullet-stat-label">{clean.slice(0, colonIdx).trim()}</span>
              <span className="bullet-stat-value">{clean.slice(colonIdx + 1).trim()}</span>
            </div>
          );
        }
        return <div key={i} className="bullet-stat-row-simple">• {clean}</div>;
      })}
    </div>
  </SectionCard>
);
