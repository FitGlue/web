import React from 'react';
import type { HeartRateZonesSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: HeartRateZonesSummary;
}

export default function HRZonesModule({ data }: Props): React.ReactElement | null {
  if (!data || !data.zones?.length || data.zones.every(z => z.minutes === 0)) return null;

  return (
    <Module title="Heart Rate Zones" span={6}>
      <div className="zone-bars">
        {data.zones.map(z => (
          <div key={z.zoneIndex} className="zone-row">
            <span>{z.name}</span>
            <div className="zone-row__bar-wrap">
              <div
                className={`zone-row__bar zone-row__bar--z${z.zoneIndex}`}
                style={{ width: `${z.percentage}%` }}
              />
            </div>
            <span>{z.minutes}m</span>
          </div>
        ))}
      </div>
    </Module>
  );
}
