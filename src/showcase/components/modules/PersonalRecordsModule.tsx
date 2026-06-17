import React from 'react';
import type { PersonalRecordsSummary } from '../../../types/pb/models/activity/enrichments';
import { buildPRGroupVMs } from '../../utils/roundup';
import { RoundupPRWall } from '../RoundupPRWall';
import { Module } from './index';

interface Props {
  data?: PersonalRecordsSummary;
}

export default function PersonalRecordsModule({ data }: Props): React.ReactElement | null {
  if (!data?.records?.length) return null;

  // Reuse the roundup's grouped wall: one card per exercise, every metric on it.
  const groups = buildPRGroupVMs(
    data.records.map((r) => ({
      recordType: r.recordType,
      value: r.newValue,
      previousValue: r.previousValue,
      unit: r.unit,
    })),
  );
  const total = data.records.length;

  return (
    <Module title="Personal Records" right={`${total} new`} span={12}>
      <RoundupPRWall groups={groups} />
    </Module>
  );
}
