import React from 'react';
import type { RunningDynamicsSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: RunningDynamicsSummary;
}

export default function RunningDynamicsModule({ data }: Props): React.ReactElement | null {
  if (!data || data.avgGroundContactMs === 0) return null;

  return (
    <Module title="Running Dynamics" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">
            {Math.round(data.avgGroundContactMs)}ms
          </span>
          <span className="mini__label">GCT</span>
        </div>
        <div className="mini">
          <span className="mini__value">
            {data.avgVerticalOscillationCm.toFixed(1)}cm
          </span>
          <span className="mini__label">VERT OSC</span>
        </div>
        <div className="mini">
          <span className="mini__value">
            {data.avgStepLengthM.toFixed(2)}m
          </span>
          <span className="mini__label">STRIDE</span>
        </div>
      </div>
    </Module>
  );
}
