import React from 'react';
import type { HeartRateSummary } from '../../../types/pb/models/activity/enrichments';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Rec = components['schemas']['Record'];

function downsample(arr: number[], n: number): number[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

function SparklineChart({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1) * 100).toFixed(1);
    const y = (100 - (v - min) / range * 88 - 6).toFixed(1);
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
        <linearGradient id="hr-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff3da6" />
          <stop offset=".5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#hr-grad)" opacity=".18" />
      <path d={line} stroke="url(#hr-grad)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

interface Props {
  data?: HeartRateSummary;
  records?: Rec[];
}

export default function HeartRateModule({ data, records }: Props): React.ReactElement | null {
  if (!data || !data.avgBpm) return null;

  const hrValues = downsample(
    (records ?? []).map((r) => r.heartRate ?? 0).filter((v) => v > 0),
    100,
  );

  return (
    <Module title="Heart Rate" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value">{data.minBpm}</span>
          <span className="mini__label">MIN BPM</span>
        </div>
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.avgBpm}</span>
          <span className="mini__label">AVG BPM</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.maxBpm}</span>
          <span className="mini__label">MAX BPM</span>
        </div>
        {data.driftWarning && (
          <div style={{ marginLeft: 'auto', padding: '3px 8px', border: '1.5px solid var(--fg-rose)', color: 'var(--fg-rose)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', alignSelf: 'center' }}>
            +{data.driftBpm} DRIFT
          </div>
        )}
      </div>
      <SparklineChart values={hrValues} />
    </Module>
  );
}
