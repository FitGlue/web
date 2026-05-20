import React from 'react';
import type { PersonalRecordsSummary } from '../../../types/pb/models/activity/enrichments';

interface Props {
  data?: PersonalRecordsSummary;
}

export default function PersonalRecordsCallout({ data }: Props): React.ReactElement | null {
  if (!data || !data.records?.length) return null;

  return (
    <div className="pr-callout">
      <div className="callout-band">
        <span>🏆</span>
        <strong>Personal Records</strong>
        <ul>
          {data.records.map((r, i) => (
            <li key={i}>{r.displayMessage}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
