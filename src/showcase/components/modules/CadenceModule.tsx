import React from 'react';
import type { CadenceSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: CadenceSummary;
}

export default function CadenceModule({ data }: Props): React.ReactElement | null {
  if (!data || data.avgRpm === 0) return null;

  return (
    <Module title="Cadence" span={4}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.avgRpm}</span>
          <span className="mini__label">AVG RPM</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.maxRpm}</span>
          <span className="mini__label">MAX RPM</span>
        </div>
      </div>
    </Module>
  );
}
