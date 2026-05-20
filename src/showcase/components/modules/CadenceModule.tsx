import React from 'react';
import type { CadenceSummary } from '../../../types/pb/models/activity/enrichments';
import type { components } from '../../../shared/api/schema-public';
import { Module } from './index';

type Rec = components['schemas']['Record'];

function downsample(arr: number[], n: number): number[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

function BarSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 40, marginTop: 'var(--space-sm)' }}>
      {values.map((v, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: 'var(--fg-paper)',
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  );
}

interface Props {
  data?: CadenceSummary;
  records?: Rec[];
}

export default function CadenceModule({ data, records }: Props): React.ReactElement | null {
  if (!data || !data.avgRpm) return null;

  const cadValues = downsample(
    (records ?? []).map((r) => r.cadence ?? 0).filter((v) => v > 0),
    40,
  );

  return (
    <Module title="Cadence" span={4}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.avgRpm}</span>
          <span className="mini__label">AVG RPM</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.maxRpm}</span>
          <span className="mini__label">MAX RPM</span>
        </div>
      </div>
      <BarSparkline values={cadValues} />
    </Module>
  );
}
