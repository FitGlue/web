import React from 'react';
import type { IntervalsSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: IntervalsSummary;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function formatPaceSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(2)}km`;
}

export default function IntervalsModule({ data }: Props): React.ReactElement | null {
  if (!data || !data.segments?.length) return null;

  return (
    <Module title="Intervals" right={data.workoutName || undefined} span={12}>
      <div className="intervals-table">
        <div className="intervals-table__header">
          <span>TYPE</span>
          <span>DURATION</span>
          <span>DISTANCE</span>
          <span>HR</span>
          <span>PACE</span>
        </div>
        {data.segments.map((seg, i) => (
          <div key={i} className="intervals-table__row">
            <span className={`interval-type--${seg.type}`}>{seg.label}</span>
            <span>{formatDuration(seg.durationSeconds)}</span>
            <span>{formatDistance(seg.distanceMeters)}</span>
            <span>{seg.avgHr > 0 ? `${Math.round(seg.avgHr)} bpm` : '—'}</span>
            <span>
              {seg.avgSpeedMs > 0
                ? `${formatPaceSeconds(1000 / seg.avgSpeedMs)}/km`
                : '—'}
            </span>
          </div>
        ))}
      </div>
    </Module>
  );
}
