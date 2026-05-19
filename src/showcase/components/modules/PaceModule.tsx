import React from 'react';
import type { PaceSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: PaceSummary;
}

function formatPaceSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function PaceModule({ data }: Props): React.ReactElement | null {
  if (!data || data.avgPaceSecondsPerKm === 0) return null;

  const splits = data.splits.slice(0, 8);
  const slowest = splits.reduce((max, sp) => Math.max(max, sp.seconds), 0);

  return (
    <Module title="Pace" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">
            {formatPaceSeconds(data.avgPaceSecondsPerKm)}/km
          </span>
          <span className="mini__label">AVG PACE</span>
        </div>
      </div>
      {splits.length > 0 && (
        <div className="pace-splits">
          {splits.map(sp => (
            <div key={sp.km} className="split-row">
              <span>{sp.km} km</span>
              <div className="split-row__bar-wrap">
                <div
                  className="split-row__bar"
                  style={{ width: slowest > 0 ? `${(sp.seconds / slowest) * 100}%` : '0%' }}
                />
              </div>
              <span>{formatPaceSeconds(sp.seconds)}/km</span>
            </div>
          ))}
        </div>
      )}
    </Module>
  );
}
