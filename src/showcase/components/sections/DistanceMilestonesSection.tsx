import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { splitLines, stripBullet } from '../../utils/section';

function parseKm(s: string): number | null {
  const m = s.match(/([\d.]+)\s*km/i);
  return m ? parseFloat(m[1]) : null;
}

function parseMilestones(content: string) {
  const lines = splitLines(content);
  const milestoneLine = lines.find((l) => /MILESTONE:/i.test(l));
  const isMilestone = !!milestoneLine;
  const milestoneKm = milestoneLine?.match(/MILESTONE:\s*(.+)/i)?.[1]?.trim() ?? '';

  let total = '', thisActivity = '', nextMilestone = '';
  for (const line of lines) {
    const clean = stripBullet(line);
    const totalM = clean.match(/^([\d.]+\s*km)\s*total/i) ?? clean.match(/^Total:\s*([\d.]+\s*km)/i);
    const thisM  = clean.match(/^This\s+\w+:\s*(\+[\d.]+\s*km)/i);
    const nextM  = clean.match(/^Next\s*milestone:\s*(.+)/i);
    if (totalM) total = totalM[1];
    if (thisM)  thisActivity = thisM[1];
    if (nextM)  nextMilestone = nextM[1];
  }
  return { isMilestone, milestoneKm, total, thisActivity, nextMilestone };
}

export const DistanceMilestonesSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const { isMilestone, milestoneKm, total, thisActivity, nextMilestone } = parseMilestones(section.content);

  const totalKm    = total       ? parseKm(total)          : null;
  const nextKm     = nextMilestone ? parseKm(nextMilestone) : null;
  // Previous milestone is the one just hit (for progress bar lower bound)
  const hitKm      = milestoneKm  ? parseKm(milestoneKm)   : null;

  // Progress bar: how far from last milestone toward next
  let progressPct = 0;
  if (totalKm !== null && nextKm !== null) {
    const base = hitKm ?? 0;
    const span = nextKm - base;
    progressPct = span > 0 ? Math.min(((totalKm - base) / span) * 100, 100) : 100;
  }

  return (
    <SectionCard section={section} idx={idx}>
      {isMilestone ? (
        <div className="milestone-hit">
          <div className="milestone-confetti-row">🎉</div>
          <div className="milestone-hit-km">{milestoneKm}</div>
          <div className="milestone-hit-sub">Lifetime milestone reached!</div>
          <div className="milestone-hit-stats">
            {total        && <span className="milestone-hit-stat">{total} total</span>}
            {thisActivity && <span className="milestone-hit-delta">{thisActivity} this activity</span>}
          </div>
        </div>
      ) : (
        <div className="milestone-progress-body">
          {total && <div className="milestone-total-km">{total}</div>}
          {nextMilestone && (
            <>
              <div className="milestone-progress-bar">
                <div className="milestone-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="milestone-next-label">🎯 Next: {nextMilestone}</div>
            </>
          )}
          {thisActivity && <div className="milestone-delta">{thisActivity} this activity</div>}
        </div>
      )}
    </SectionCard>
  );
};
