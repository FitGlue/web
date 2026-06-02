import React from 'react';
import type { BestEffortsSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '—';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface Props {
  data?: BestEffortsSummary;
}

export default function BestEffortsModule({ data }: Props): React.ReactElement | null {
  if (!data?.efforts?.length) return null;

  return (
    <Module title="Best Efforts" span={6}>
      <div className="best-efforts">
        {data.efforts.map((effort) => (
          <div key={effort.distanceKey} className="best-efforts__row">
            <span className="best-efforts__distance">{effort.display}</span>
            <span className="best-efforts__time mini__value--aurora">
              {formatTime(effort.timeSeconds)}
            </span>
          </div>
        ))}
      </div>
    </Module>
  );
}
