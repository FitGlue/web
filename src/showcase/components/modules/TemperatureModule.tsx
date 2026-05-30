import React from 'react';
import type { TemperatureSummary } from '../../../types/pb/models/activity/enrichments';
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
        <linearGradient id="temp-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset=".5" stopColor="#a3e635" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#temp-grad)" opacity=".18" />
      <path d={line} stroke="url(#temp-grad)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

interface Props {
  data?: TemperatureSummary;
  records?: Rec[];
}

export default function TemperatureModule({ data, records }: Props): React.ReactElement | null {
  if (!data || data.avgC === undefined) return null;

  const tempValues = downsample(
    (records ?? [])
      .map((r) => r.temperature ?? null)
      .filter((v): v is number => v !== null),
    100,
  );

  return (
    <Module title="Temperature" span={6}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value">{data.minC}°C</span>
          <span className="mini__label">MIN</span>
        </div>
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.avgC}°C</span>
          <span className="mini__label">AVG</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.maxC}°C</span>
          <span className="mini__label">MAX</span>
        </div>
      </div>
      <SparklineChart values={tempValues} />
    </Module>
  );
}
