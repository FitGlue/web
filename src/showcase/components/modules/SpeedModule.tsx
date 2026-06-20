import React from 'react';
import type { SpeedSummary } from '../../../types/pb/models/activity/enrichments';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Rec = components['schemas']['Record'];

const MS_TO_KMH = 3.6;

function downsample(arr: number[], n: number): number[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

interface KmSplit {
  km: number;
  kmh: number;
}

// Compute a genuine average speed for each kilometre from the raw records,
// bucketed by cumulative distance. Because records are ~1Hz (evenly spaced in
// time), the mean of instantaneous speed over a bucket equals distance/time —
// i.e. the real split speed — so every km gets its own value rather than the
// activity-wide average repeated across all splits.
function computeKmSplits(records: Rec[]): KmSplit[] {
  const buckets = new Map<number, { sum: number; n: number }>();
  for (const r of records) {
    if (r.distance === undefined || r.distance < 0) continue;
    if (r.speed === undefined || r.speed <= 0) continue;
    const km = Math.floor(r.distance / 1000) + 1; // first 1000m → km 1
    const b = buckets.get(km) ?? { sum: 0, n: 0 };
    b.sum += r.speed;
    b.n += 1;
    buckets.set(km, b);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([km, b]) => ({ km, kmh: (b.sum / b.n) * MS_TO_KMH }));
}

// Higher speed sits higher on the chart (smaller SVG y).
function SparklineChart({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = ((i / (values.length - 1)) * 100).toFixed(1);
    const y = (((max - v) / range) * 88 + 6).toFixed(1);
    return `${x},${y}`;
  });
  const line = `M ${pts.join(' L ')}`;
  const area = `${line} L 100,100 L 0,100 Z`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: 80, marginTop: 'var(--space-sm)' }}
    >
      <defs>
        <linearGradient id="speed-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset=".5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ff3da6" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#speed-grad)" opacity=".18" />
      <path d={line} stroke="url(#speed-grad)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

interface Props {
  data?: SpeedSummary;
  records?: Rec[];
}

export default function SpeedModule({ data, records }: Props): React.ReactElement | null {
  if (!data || data.avgSpeedKmh === 0) return null;

  // Speed sparkline from raw per-second speed records (m/s → km/h).
  const speedValues = downsample(
    (records ?? [])
      .map((r) => (r.speed && r.speed > 0 ? r.speed * MS_TO_KMH : 0))
      .filter((v) => v > 0),
    100,
  );

  const splits = computeKmSplits(records ?? []);
  const fastest = splits.reduce((max, sp) => Math.max(max, sp.kmh), 0);

  return (
    <Module title="Speed" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">
            {data.avgSpeedKmh.toFixed(1)}
          </span>
          <span className="mini__label">AVG KM/H</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.maxSpeedKmh.toFixed(1)}</span>
          <span className="mini__label">MAX KM/H</span>
        </div>
      </div>
      <SparklineChart values={speedValues} />
      {splits.length > 0 && (
        <div className="pace-splits">
          {splits.map((sp) => (
            <div key={sp.km} className="split-row">
              <span>{sp.km} km</span>
              <div className="split-row__bar-wrap">
                <div
                  className="split-row__bar"
                  style={{ width: fastest > 0 ? `${(sp.kmh / fastest) * 100}%` : '0%' }}
                />
              </div>
              <span>{sp.kmh.toFixed(1)} km/h</span>
            </div>
          ))}
        </div>
      )}
    </Module>
  );
}
