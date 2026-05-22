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
          <span className="mini__label">SESSION TRIMP</span>
        </div>
        {(data.sevenDayLoad ?? 0) > 0 && (
          <div className="mini">
            <span className="mini__value">{data.sevenDayLoad}</span>
            <span className="mini__label">7-DAY LOAD</span>
          </div>
        )}
        {(data.twentyEightDayAvgLoad ?? 0) > 0 && (
          <div className="mini">
            <span className="mini__value">{data.twentyEightDayAvgLoad}</span>
            <span className="mini__label">28-DAY AVG/DAY</span>
          </div>
        )}
        <div className="mini">
          <span className="mini__value">{data.acuteChronicRatio.toFixed(2)}</span>
          <span className="mini__label">ACWR</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.hoursToRecover}h</span>
          <span className="mini__label">RECOVERY</span>
        </div>
      </div>
      {data.alert
        ? <div className="recovery-alert">{data.alertText}</div>
        : <div className="recovery-ok">{data.alertText || 'Healthy load'}</div>
      }
    </Module>
  );
}
