import { atom } from 'jotai';
import { UnsynchronizedEntry } from '../services/ActivitiesService';
import { PipelineRun } from '../../types/pb/user';

export const pipelineRunsAtom = atom<PipelineRun[]>([]);
export const activityStatsAtom = atom<{
  synchronizedCount: number;
  totalSynced?: number;
  monthlySynced?: number;
  weeklySynced?: number;
}>({ synchronizedCount: 0 });
export const unsynchronizedAtom = atom<UnsynchronizedEntry[]>([]);

// Last updated timestamps
export const pipelineRunsLastUpdatedAtom = atom<Date | null>(null);
export const unsynchronizedLastUpdatedAtom = atom<Date | null>(null);

// Loading states
export const isStatsLoadedAtom = atom<boolean>(false);
export const isUnsynchronizedLoadedAtom = atom<boolean>(false);
