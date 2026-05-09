import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { StatBlock } from '../StatBlock';
import { IntensityBadge } from '../IntensityBadge';
import { splitLines, stripBullet } from '../../utils/section';

export const RecoveryAdvisorSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  let sessionVal = '', sessionTag = '', weekVal = '', chronicVal = '', acwrVal = '', acwrLabel = '', suggestion = '', fatigueWarning = '';

  for (const line of splitLines(section.content)) {
    const clean = stripBullet(line);
    const sessionM = clean.match(/Session\s*load:\s*([\d.]+\s*TRIMP)\s*\(([\w\s]+)\)/i);
    const loadM = clean.match(/7-day\s*load:\s*([\d.]+\s*TRIMP)\s*•\s*28-day\s*avg:\s*([\d.]+\s*TRIMP)/i);
    const weekOnlyM = !loadM && clean.match(/7-day\s*load:\s*([\d.]+\s*TRIMP)/i);
    const acwrM = clean.match(/ACWR:\s*([\d.]+)\s*\(([^)]+)/i);
    const sugM = clean.match(/Suggested\s*recovery:\s*(.+)/i);
    const fatigueM = clean.match(/(\d+)\s*consecutive\s*hard\s*days/i);
    if (sessionM) { sessionVal = sessionM[1]; sessionTag = sessionM[2].trim(); }
    if (loadM) { weekVal = loadM[1]; chronicVal = loadM[2]; }
    if (weekOnlyM) weekVal = weekOnlyM[1];
    if (acwrM) { acwrVal = acwrM[1]; acwrLabel = acwrM[2].trim(); }
    if (sugM) suggestion = sugM[1].replace(/^💡\s*/, '');
    if (fatigueM) fatigueWarning = clean.replace(/^⚠️\s*/, '');
  }

  const hasACWR = acwrVal !== '';

  return (
    <SectionCard section={section} idx={idx}>
      <div className={`recovery-grid${hasACWR ? ' has-acwr' : ''}`}>
        <StatBlock
          value={<>{sessionVal}{sessionTag && <IntensityBadge label={sessionTag} />}</>}
          label="Session Load"
          hint="How hard this session was"
        />
        <StatBlock
          value={weekVal}
          sub={chronicVal ? `28d: ${chronicVal}` : undefined}
          label="7-Day Load"
          hint="Cumulative training this week"
        />
        {hasACWR && (
          <StatBlock
            value={<>{acwrVal}{acwrLabel && <IntensityBadge label={acwrLabel} />}</>}
            label="Workload Ratio"
            hint="Recent vs long-term training balance"
          />
        )}
      </div>
      {fatigueWarning && (
        <div className="recovery-fatigue-warning">
          <span>⚠️</span><span>{fatigueWarning}</span>
        </div>
      )}
      {suggestion && (
        <div className="recovery-suggestion">
          <span className="icon">🕐</span>
          <span>Suggested recovery: <span className="value">{suggestion}</span></span>
        </div>
      )}
    </SectionCard>
  );
};
