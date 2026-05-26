import React from 'react';
import type { PersonalRecordsSummary, PersonalRecord } from '../../../types/pb/models/activity/enrichments';
import { parseRecordType, prValueString, prDeltaString } from '../../utils/prFormat';
import { Module } from './index';

interface Props {
  data?: PersonalRecordsSummary;
}

interface ExerciseGroup {
  label: string;
  records: Array<{ prType: string; value: string; unit: string; delta: string | null }>;
}

function groupByExercise(records: PersonalRecord[]): ExerciseGroup[] {
  const order: string[] = [];
  const groups: Record<string, ExerciseGroup> = {};

  for (const r of records) {
    const { label, prType } = parseRecordType(r.recordType);
    const key = label;
    if (!groups[key]) {
      order.push(key);
      groups[key] = { label, records: [] };
    }
    const { val, unit } = prValueString(r.newValue, r.unit);
    groups[key].records.push({
      prType,
      value: val,
      unit,
      delta: prDeltaString(r.newValue, r.previousValue, r.unit),
    });
  }

  return order.map(key => groups[key]);
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
            <div className="pr-ex-row__name">{group.label.toUpperCase()}</div>
            <div className="pr-ex-row__types">
              {group.records.map((rec, ri) => (
                <span key={ri} className="pr-type-chip">
                  {rec.prType && <span className="pr-type-chip__label">{rec.prType}</span>}
                  <span className="pr-type-chip__val">
                    {rec.value}{rec.unit && ` ${rec.unit}`}
                  </span>
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
