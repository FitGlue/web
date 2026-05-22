import React from 'react';
import type { PersonalRecordsSummary, PersonalRecord } from '../../../types/pb/models/activity/enrichments';

interface Props {
  data?: PersonalRecordsSummary;
}

function prDisplayLabel(r: PersonalRecord): string {
  return r.recordType.replace(/_/g, ' ').toUpperCase();
}

function prDelta(r: PersonalRecord): string | null {
  if (r.previousValue == null || r.previousValue <= 0) return null;
  if (r.unit === 'seconds') {
    const delta = r.previousValue - r.newValue;
    if (delta <= 0) return null;
    const m = Math.floor(delta / 60);
    const s = Math.floor(delta % 60);
    return m > 0 ? `−${m}:${String(s).padStart(2, '0')}` : `−${s}s`;
  }
  const delta = r.newValue - r.previousValue;
  if (delta <= 0) return null;
  return `+${Math.round(delta)} ${r.unit.toUpperCase()}`;
}

function prValue(r: PersonalRecord): { val: string; unit: string } {
  if (r.unit === 'seconds') {
    if (r.newValue >= 3600) {
      const h = Math.floor(r.newValue / 3600);
      const m = Math.floor((r.newValue % 3600) / 60);
      const s = Math.floor(r.newValue % 60);
      return { val: `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, unit: '' };
    }
    const m = Math.floor(r.newValue / 60);
    const s = Math.floor(r.newValue % 60);
    return { val: `${m}:${String(s).padStart(2, '0')}`, unit: '' };
  }
  if (r.unit === 'kg') return { val: `${Math.round(r.newValue)}`, unit: 'kg' };
  if (r.unit === 'meters') {
    return r.newValue >= 1000
      ? { val: `${(r.newValue / 1000).toFixed(1)}`, unit: 'km' }
      : { val: `${Math.round(r.newValue)}`, unit: 'm' };
  }
  return { val: `${Math.round(r.newValue)}`, unit: r.unit };
}

export default function PersonalRecordsCallout({ data }: Props): React.ReactElement | null {
  if (!data?.records?.length) return null;

  const primary = data.records[0];
  const rest = data.records.slice(1);
  const { val, unit } = prValue(primary);
  const delta = prDelta(primary);

  return (
    <div className="pr-band">
      <div className="pr-band__inner">
        <span className="pr-band__icon">🏆</span>
        <div>
          <div className="pr-band__title">{prDisplayLabel(primary)}</div>
          {primary.displayMessage && (
            <div className="pr-band__sub">{primary.displayMessage}</div>
          )}
        </div>
        <div className="pr-band__n">
          {val}
          {unit && <span style={{ fontSize: '1rem', opacity: 0.5 }}> {unit}</span>}
        </div>
        {delta && <span className="pr-band__delta">{delta}</span>}
      </div>

      {rest.length > 0 && (
        <div className="pr-band__extra">
          {rest.map((r, i) => {
            const rv = prValue(r);
            const rd = prDelta(r);
            return (
              <span key={i} className="pr-band__extra-item">
                <b>{prDisplayLabel(r)}</b>{' '}{rv.val}{rv.unit && ` ${rv.unit}`}
                {rd && <span className="pr-band__extra-delta"> {rd}</span>}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
