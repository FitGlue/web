import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatBlock } from '../StatBlock';
import { extractEmojiPrefix } from '../../utils/section';

export const RunningDynamicsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const parts = section.content.trim().split(' • ').map((p) => p.trim()).filter(Boolean);

  const stats = parts.map((part) => {
    const { emoji: icon, rest } = extractEmojiPrefix(part);
    const ci = rest.indexOf(':');
    if (ci > 0) return { icon, label: rest.substring(0, ci).trim(), value: rest.substring(ci + 1).trim() };
    return { icon, label: '', value: rest };
  });

  return (
    <SectionCard section={section} idx={idx}>
      <div className="dynamics-grid">
        {stats.map((s, i) => (
          <StatBlock key={i} icon={s.icon || undefined} value={s.value} label={s.label} />
        ))}
      </div>
    </SectionCard>
  );
};
