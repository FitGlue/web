import React from 'react';
import type { PersonalRecordsSummary, PersonalRecord } from '../../../types/pb/models/activity/enrichments';

interface Props {
  data?: PersonalRecordsSummary;
}

const PRIORITY_SUFFIXES = ['_1rm', '_set_volume', '_volume', '_reps'];

function topPR(records: PersonalRecord[]): PersonalRecord {
  return [...records].sort((a, b) => {
    const ai = PRIORITY_SUFFIXES.findIndex(s => a.recordType.endsWith(s));
    const bi = PRIORITY_SUFFIXES.findIndex(s => b.recordType.endsWith(s));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  })[0];
}

function parseRecordType(recordType: string): { exercise: string; prType: string } {
  for (const suffix of PRIORITY_SUFFIXES) {
    if (recordType.endsWith(suffix)) {
      return {
        exercise: recordType.slice(0, -suffix.length).replace(/_/g, ' ').toUpperCase(),
        prType: suffix.slice(1).toUpperCase().replace(/_/g, ' '),
      };
    }
  }
  return { exercise: recordType.toUpperCase(), prType: 'PR' };
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

export default function PersonalRecordsCallout({ data }: Props): React.ReactElement | null {
  if (!data?.records?.length) return null;

  const primary = topPR(data.records);
  const { exercise, prType } = parseRecordType(primary.recordType);
  const { val, unit } = prValue(primary);
  const delta = prDelta(primary);
  const extraCount = data.records.length - 1;

  return (
    <div className="pr-band">
      <div className="pr-band__inner">
        <span className="pr-band__icon">🏆</span>
        <div>
          <div className="pr-band__title">{exercise}</div>
          <div className="pr-band__sub">
            {prType} · NEW PERSONAL RECORD
            {extraCount > 0 && ` · +${extraCount} MORE RECORD${extraCount !== 1 ? 'S' : ''} BELOW`}
          </div>
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
