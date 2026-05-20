import React from 'react';
import type { MuscleHeatmapSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: MuscleHeatmapSummary;
  imageUrl?: string;
}

export default function MuscleHeatmapModule({ data, imageUrl }: Props): React.ReactElement | null {
  if (!data || (!data.primary?.length && !data.secondary?.length && !imageUrl)) return null;

  const resolvedImage = data.imageUrl || imageUrl;

  return (
    <Module title="Muscles" span={6}>
      {resolvedImage
        ? (
          <img
            className="muscle-heatmap-image"
            src={resolvedImage}
            alt="Muscle heatmap"
          />
        )
        : (
          <div className="muscle-list">
            {data.primary.map(m => (
              <span key={m} className="muscle-chip muscle-chip--primary">{m}</span>
            ))}
            {data.secondary.map(m => (
              <span key={m} className="muscle-chip muscle-chip--secondary">{m}</span>
            ))}
          </div>
        )
      }
    </Module>
  );
}
