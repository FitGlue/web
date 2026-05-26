import React from 'react';
import type { PersonalRecordsSummary } from '../../../types/pb/models/activity/enrichments';
import { topPR, parseRecordType, prValueString, prDeltaString } from '../../utils/prFormat';

interface Props {
  data?: PersonalRecordsSummary;
}

export default function PersonalRecordsCallout({ data }: Props): React.ReactElement | null {
  if (!data?.records?.length) return null;

  const primary = topPR(data.records);
  const { label, prType } = parseRecordType(primary.recordType);
  const { val, unit } = prValueString(primary.newValue, primary.unit);
  const delta = prDeltaString(primary.newValue, primary.previousValue, primary.unit);
  const extraCount = data.records.length - 1;

  const subLine = [
    prType || null,
    'NEW PERSONAL RECORD',
    extraCount > 0 ? `+${extraCount} MORE RECORD${extraCount !== 1 ? 'S' : ''} BELOW` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="pr-band">
      <div className="pr-band__inner">
        <span className="pr-band__icon">🏆</span>
        <div>
          <div className="pr-band__title">{label.toUpperCase()}</div>
          <div className="pr-band__sub">{subLine}</div>
        </div>
        <div className="pr-band__n">
          {val}
          {unit && <span style={{ fontSize: '1rem', opacity: 0.5 }}> {unit}</span>}
        </div>
        {delta && <span className="pr-band__delta">{delta}</span>}
      </div>
    </div>
  );
}
