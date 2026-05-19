import React from 'react';
import type { ElevationSummary } from '../../../types/pb/models/activity/enrichments';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Rec = components['schemas']['Record'];

function downsample(arr: number[], n: number): number[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

function ElevationSparkline({ values }: { values: number[] }) {
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
      style={{ display: 'block', width: '100%', height: 60, marginTop: 'var(--space-sm)' }}
    >
      <path d={area} fill="var(--fg-paper)" opacity=".08" />
      <path d={line} stroke="var(--fg-paper)" strokeWidth="1.5" strokeOpacity=".5" fill="none" />
    </svg>
  );
}

interface Props {
  data?: ElevationSummary;
  records?: Rec[];
}

export default function ElevationModule({ data, records }: Props): React.ReactElement | null {
  if (!data || (data.totalGainM === 0 && data.totalLossM === 0)) return null;

  const elevValues = downsample(
    (records ?? []).map((r) => r.altitude ?? -1).filter((v) => v >= 0),
    80,
  );

  return (
    <Module title="Elevation" span={4}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">
            {Math.round(data.totalGainM ?? 0)}m ↑
          </span>
          <span className="mini__label">GAIN</span>
        </div>
        <div className="mini">
          <span className="mini__value">{Math.round(data.totalLossM ?? 0)}m ↓</span>
          <span className="mini__label">LOSS</span>
        </div>
      </div>
      <ElevationSparkline values={elevValues} />
    </Module>
  );
}
