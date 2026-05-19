import React from 'react';
import type { TrainingLoadSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: TrainingLoadSummary;
}

const BUCKETS = ['Recovery', 'Easy', 'Moderate', 'Hard', 'Very Hard'];

export default function TrainingLoadModule({ data }: Props): React.ReactElement | null {
  if (!data || data.trimp === 0) return null;

  return (
    <Module title="Training Load" span={4}>
      <div className="mini">
        <span className="mini__value mini__value--aurora">{data.trimp}</span>
        <span className="mini__label">TRIMP</span>
      </div>
      <div className="stamp">{data.bucket}</div>
      <div className="load-pills">
        {BUCKETS.map(b => (
          <div
            key={b}
            className={`load-pill${data.bucket === b ? ' load-pill--active' : ''}`}
          >
            {b}
          </div>
        ))}
      </div>
      {data.hint && <small>{data.hint}</small>}
    </Module>
  );
}
