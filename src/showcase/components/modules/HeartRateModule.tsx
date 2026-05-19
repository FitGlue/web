import React from 'react';
import type { HeartRateSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: HeartRateSummary;
}

export default function HeartRateModule({ data }: Props): React.ReactElement | null {
  if (!data || data.avgBpm === 0) return null;

  return (
    <Module title="Heart Rate" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value">{data.minBpm}</span>
          <span className="mini__label">MIN BPM</span>
        </div>
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.avgBpm}</span>
          <span className="mini__label">AVG BPM</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.maxBpm}</span>
          <span className="mini__label">MAX BPM</span>
        </div>
      </div>
      {data.driftWarning && (
        <div className="warning-band">
          +{data.driftBpm} bpm drift · hydrate
        </div>
      )}
    </Module>
  );
}
