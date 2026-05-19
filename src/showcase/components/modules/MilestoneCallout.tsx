import React from 'react';
import type { DistanceMilestoneSummary } from '../../../types/pb/models/activity/enrichments';

interface Props {
  data?: DistanceMilestoneSummary;
}

export default function MilestoneCallout({ data }: Props): React.ReactElement | null {
  if (!data || data.milestoneKm === 0) return null;

  return (
    <div className="milestone-callout">
      <div className="callout-band">
        <span>🏅</span>
        <strong>{data.milestoneKm} km lifetime · crossed today</strong>
        <p>Total: {data.lifetimeDistanceKm.toFixed(1)} km</p>
      </div>
    </div>
  );
}
