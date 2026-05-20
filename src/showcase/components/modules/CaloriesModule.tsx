import React from 'react';
import type { CaloriesSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: CaloriesSummary;
}

export default function CaloriesModule({ data }: Props): React.ReactElement | null {
  if (!data || data.kcal === 0) return null;

  return (
    <Module title="Calories" span={4}>
      <div className="mini">
        <span className="mini__value mini__value--aurora">{data.kcal}</span>
        <span className="mini__label">KCAL</span>
      </div>
      {data.comparisonText && (
        <small>{data.comparisonText}</small>
      )}
    </Module>
  );
}
