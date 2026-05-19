import React from 'react';
import type { RecoverySummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: RecoverySummary;
}

export default function RecoveryModule({ data }: Props): React.ReactElement | null {
  if (!data || data.sessionLoad === 0) return null;

  return (
    <Module title="Recovery" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.sessionLoad}</span>
          <span className="mini__label">SESSION LOAD</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.acuteChronicRatio.toFixed(2)}</span>
          <span className="mini__label">ACWR</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.hoursToRecover}h</span>
          <span className="mini__label">RECOVERY HRS</span>
        </div>
      </div>
      {data.alert
        ? <div className="recovery-alert">{data.alertText}</div>
        : <div className="recovery-ok">Healthy load</div>
      }
    </Module>
  );
}
