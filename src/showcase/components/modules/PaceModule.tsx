import React from 'react';
import type { PaceSummary } from '../../../types/pb/models/activity/enrichments';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Rec = components['schemas']['Record'];

function formatPaceSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function downsample(arr: number[], n: number): number[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

function SparklineChart({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  // Invert Y: lower pace (faster) = higher on chart
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1) * 100).toFixed(1);
    const y = ((v - min) / range * 88 + 6).toFixed(1);
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
        <linearGradient id="pace-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset=".5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ff3da6" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#pace-grad)" opacity=".18" />
      <path d={line} stroke="url(#pace-grad)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

interface Props {
  data?: PaceSummary;
  records?: Rec[];
}

export default function PaceModule({ data, records }: Props): React.ReactElement | null {
  if (!data || data.avgPaceSecondsPerKm === 0) return null;

  const splits = data.splits ?? [];
  const slowest = splits.reduce((max, sp) => Math.max(max, sp.seconds), 0);

  // Build pace sparkline from raw per-second speed records (m/s → sec/km)
  const paceValues = downsample(
    (records ?? [])
      .map((r) => (r.speed && r.speed > 0 ? 1000 / r.speed : 0))
      .filter((v) => v > 0 && v < 1800), // filter out stationary/invalid
    100,
  );

  return (
    <Module title="Pace" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">
            {formatPaceSeconds(data.avgPaceSecondsPerKm)}/km
          </span>
          <span className="mini__label">AVG PACE</span>
        </div>
        {data.bestSplitSecondsPerKm > 0 && (
          <div className="mini">
            <span className="mini__value">{formatPaceSeconds(data.bestSplitSecondsPerKm)}/km</span>
            <span className="mini__label">BEST SPLIT</span>
          </div>
        )}
      </div>
      <SparklineChart values={paceValues} />
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
