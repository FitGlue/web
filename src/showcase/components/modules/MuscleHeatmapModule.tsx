import React from 'react';
import type { MuscleHeatmapSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: MuscleHeatmapSummary;
  imageUrl?: string;
}

function formatMuscleName(m: string): string {
  return m.replace(/^MUSCLE_GROUP_/, '').replace(/_/g, ' ');
}

export default function MuscleHeatmapModule({ data, imageUrl }: Props): React.ReactElement | null {
  if (!data || (!data.primary?.length && !data.secondary?.length && !imageUrl)) return null;

  const resolvedImage = data.imageUrl || imageUrl;

  if (resolvedImage) {
    return (
      <Module title="Muscles" span={6}>
        <img className="muscle-heatmap-image" src={resolvedImage} alt="Muscle heatmap" />
      </Module>
    );
  }

  return (
    <Module title="Muscles" span={6}>
      <div className="zone-bars">
        {(data.primary ?? []).map(m => (
          <div key={m} className="zone-row">
            <span className="zone-row__label">{formatMuscleName(m)}</span>
            <div className="zone-row__bar-wrap">
              <div className="zone-row__bar zone-row__bar--muscle-primary" style={{ width: '100%' }} />
            </div>
            <span className="muscle-type-label muscle-type-label--primary">PRIMARY</span>
          </div>
        ))}
        {(data.secondary ?? []).map(m => (
          <div key={m} className="zone-row">
            <span className="zone-row__label">{formatMuscleName(m)}</span>
            <div className="zone-row__bar-wrap">
              <div className="zone-row__bar zone-row__bar--muscle-secondary" style={{ width: '40%' }} />
            </div>
            <span className="muscle-type-label muscle-type-label--secondary">SEC</span>
          </div>
        ))}
      </div>
    </Module>
  );
}
