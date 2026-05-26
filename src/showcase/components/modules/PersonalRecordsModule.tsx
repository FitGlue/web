import React from 'react';
import type { PersonalRecordsSummary, PersonalRecord } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: PersonalRecordsSummary;
}

const PR_SUFFIXES = ['_1rm', '_set_volume', '_volume', '_reps'];

function parseRecordType(recordType: string): { exercise: string; prType: string } {
  for (const suffix of PR_SUFFIXES) {
    if (recordType.endsWith(suffix)) {
      return {
        exercise: recordType.slice(0, -suffix.length),
        prType: suffix.slice(1).toUpperCase().replace(/_/g, ' '),
      };
    }
  }
  return { exercise: recordType, prType: 'PR' };
}

function prValue(r: PersonalRecord): string {
  if (r.unit === 'seconds') {
    if (r.newValue >= 3600) {
      const h = Math.floor(r.newValue / 3600);
      const m = Math.floor((r.newValue % 3600) / 60);
      const s = Math.floor(r.newValue % 60);
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const m = Math.floor(r.newValue / 60);
    const s = Math.floor(r.newValue % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  if (r.unit === 'kg') return `${Math.round(r.newValue)} kg`;
  if (r.unit === 'meters') {
    return r.newValue >= 1000
      ? `${(r.newValue / 1000).toFixed(1)} km`
      : `${Math.round(r.newValue)} m`;
  }
  return `${Math.round(r.newValue)} ${r.unit}`;
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
  return `+${Math.round(delta)} ${r.unit}`;
}

interface ExerciseGroup {
  name: string;
  records: Array<{ prType: string; value: string; delta: string | null }>;
}

function groupByExercise(records: PersonalRecord[]): ExerciseGroup[] {
  const order: string[] = [];
  const groups: Record<string, ExerciseGroup> = {};

  for (const r of records) {
    const { exercise, prType } = parseRecordType(r.recordType);
    if (!groups[exercise]) {
      order.push(exercise);
      groups[exercise] = { name: exercise, records: [] };
    }
    groups[exercise].records.push({
      prType,
      value: prValue(r),
      delta: prDelta(r),
    });
  }

  return order.map(name => groups[name]);
}

export default function PersonalRecordsModule({ data }: Props): React.ReactElement | null {
  if (!data?.records?.length) return null;

  const groups = groupByExercise(data.records);
  const total = data.records.length;

  return (
    <Module title="Personal Records" right={`${total} new`} span={12}>
      <div className="pr-list">
        {groups.map((group, gi) => (
          <div key={gi} className="pr-ex-row">
            <div className="pr-ex-row__name">{group.name.toUpperCase()}</div>
            <div className="pr-ex-row__types">
              {group.records.map((rec, ri) => (
                <span key={ri} className="pr-type-chip">
                  <span className="pr-type-chip__label">{rec.prType}</span>
                  <span className="pr-type-chip__val">{rec.value}</span>
                  {rec.delta && <span className="pr-type-chip__delta">{rec.delta}</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Module>
  );
}
