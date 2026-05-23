import React from 'react';
import type { HeartRateZonesSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: HeartRateZonesSummary;
}

function shortZoneName(name: string): string {
  const m = name.match(/\(([^)]+)\)/);
  return m ? m[1].toUpperCase() : name.replace(/^zone\s*\d+\s*/i, '').toUpperCase();
}

export default function HRZonesModule({ data }: Props): React.ReactElement | null {
  if (!data || !data.zones?.length || data.zones.every(z => z.minutes === 0)) return null;

  const maxMinutes = Math.max(...data.zones.map(z => z.minutes), 1);

  return (
    <Module title="Heart Rate Zones" span={6}>
      <div className="zone-bars">
        {data.zones.map(z => (
          <div key={z.zoneIndex} className="zone-row">
            <span className="zone-row__label">Z{z.zoneIndex} {shortZoneName(z.name)}</span>
            <div className="zone-row__bar-wrap">
              <div
                className={`zone-row__bar zone-row__bar--z${z.zoneIndex}`}
                style={{ width: `${Math.max((z.minutes / maxMinutes) * 100, z.minutes > 0 ? 2 : 0)}%` }}
              />
            </div>
            <span>{z.minutes}m</span>
          </div>
        ))}
      </div>
    </Module>
  );
}
