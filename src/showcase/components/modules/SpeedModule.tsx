import React from 'react';
import type { SpeedSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: SpeedSummary;
}

export default function SpeedModule({ data }: Props): React.ReactElement | null {
  if (!data || data.avgSpeedKmh === 0) return null;

  return (
    <Module title="Speed" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">
            {data.avgSpeedKmh.toFixed(1)}
          </span>
          <span className="mini__label">AVG KM/H</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.maxSpeedKmh.toFixed(1)}</span>
          <span className="mini__label">MAX KM/H</span>
        </div>
      </div>
    </Module>
  );
}
