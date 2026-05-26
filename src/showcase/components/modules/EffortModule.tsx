import React from 'react';
import type { EffortScoreSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: EffortScoreSummary;
}

export default function EffortModule({ data }: Props): React.ReactElement | null {
  if (!data) return null;

  const factorsText = data.factors
    .map(f => `${f.label} ${f.ratioVsBaseline.toFixed(2)}×`)
    .join(' · ');

  return (
    <Module title="Effort" span={4}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.score}/100</span>
          <span className="mini__label">EFFORT SCORE</span>
        </div>
      </div>
      <div className="stamp">{data.band}</div>
      <div className="effort-bar">
        <div className="effort-bar__fill" style={{ width: `${data.score}%` }} />
      </div>
      {factorsText && <div className="effort-factors">{factorsText}</div>}
    </Module>
  );
}
