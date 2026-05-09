import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { splitLines, stripBullet } from '../../utils/section';

function parseMilestones(content: string) {
  const lines = splitLines(content);
  const milestoneLine = lines.find((l) => /MILESTONE:/i.test(l));
  const isMilestone = !!milestoneLine;
  const milestoneKm = milestoneLine?.match(/MILESTONE:\s*(.+)/i)?.[1]?.trim() ?? '';

  let total = '', thisActivity = '', nextMilestone = '';
  for (const line of lines) {
    const clean = stripBullet(line);
    const totalM = clean.match(/^([\d.]+\s*km)\s*total/i) ?? clean.match(/^Total:\s*([\d.]+\s*km)/i);
    const thisM = clean.match(/^This\s+\w+:\s*(\+[\d.]+\s*km)/i);
    const nextM = clean.match(/^Next\s*milestone:\s*(.+)/i);
    if (totalM) total = totalM[1];
    if (thisM) thisActivity = thisM[1];
    if (nextM) nextMilestone = nextM[1];
  }
  return { isMilestone, milestoneKm, total, thisActivity, nextMilestone };
}

export const DistanceMilestonesSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const { isMilestone, milestoneKm, total, thisActivity, nextMilestone } = parseMilestones(section.content);

  return (
    <SectionCard section={section} idx={idx}>
      {isMilestone ? (
        <div className="milestone-celebration">
          <div className="milestone-badge">🎉 {milestoneKm}</div>
          <div className="milestone-stats">
            {total && <span className="milestone-stat">{total}</span>}
            {thisActivity && <span className="milestone-sub">{thisActivity}</span>}
          </div>
        </div>
      ) : (
        <div className="milestone-progress">
          {total && <div className="milestone-total">{total}</div>}
          {nextMilestone && <div className="milestone-next">🎯 {nextMilestone}</div>}
        </div>
      )}
    </SectionCard>
  );
};
