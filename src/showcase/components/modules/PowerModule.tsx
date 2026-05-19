import React from 'react';
import type { PowerSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: PowerSummary;
}

export default function PowerModule({ data }: Props): React.ReactElement | null {
  if (!data || data.avgWatts === 0) return null;

  return (
    <Module title="Power" span={12}>
      <div className="power-4up">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.avgWatts}</span>
          <span className="mini__label">AVG WATTS</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.normalizedPower}</span>
          <span className="mini__label">NORMALIZED POWER</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.intensityFactor.toFixed(2)}</span>
          <span className="mini__label">INTENSITY FACTOR</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.kilojoules}</span>
          <span className="mini__label">WORK KJ</span>
        </div>
      </div>
    </Module>
  );
}
