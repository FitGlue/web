import React from 'react';
import type { DistanceMilestoneSummary } from '../../../types/pb/models/activity/enrichments';

interface Props {
  data?: DistanceMilestoneSummary;
}

// Full-width pre-grid callout showing lifetime distance for an activity type,
// progress toward the next milestone, and any milestone crossed on this activity.
export default function MilestoneCallout({ data }: Props): React.ReactElement | null {
  if (!data || data.lifetimeDistanceKm === 0) return null;

  const toGo = data.nextMilestoneKm ? data.nextMilestoneKm - data.lifetimeDistanceKm : null;

  return (
    <div className="milestone-callout">
      <span className="milestone-callout__label">
        📊 Lifetime {data.activityTypeLabel}
      </span>
      <span className="milestone-callout__value">
        {data.lifetimeDistanceKm.toFixed(1)} km
      </span>
      {data.nextMilestoneKm && toGo !== null && toGo > 0 && (
        <span className="milestone-callout__next">
          Next milestone: {data.nextMilestoneKm} km · {toGo.toFixed(1)} km to go
        </span>
      )}
      {data.milestoneKm > 0 && (
        <span className="milestone-callout__achieved">
          🎉 {data.milestoneKm} km milestone reached!
        </span>
      )}
    </div>
  );
}
