import React from 'react';
import type { ElevationSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: ElevationSummary;
}

export default function ElevationModule({ data }: Props): React.ReactElement | null {
  if (!data || (data.totalGainM === 0 && data.totalLossM === 0)) return null;

  return (
    <Module title="Elevation" span={4}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">
            {Math.round(data.totalGainM)}m ↑
          </span>
          <span className="mini__label">GAIN</span>
        </div>
        <div className="mini">
          <span className="mini__value">{Math.round(data.totalLossM)}m ↓</span>
          <span className="mini__label">LOSS</span>
        </div>
      </div>
    </Module>
  );
}
