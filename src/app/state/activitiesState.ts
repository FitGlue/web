import { atom } from 'jotai';
import { SynchronizedActivity, UnsynchronizedEntry } from '../services/ActivitiesService';
import { PipelineRun } from '../../types/pb/user';

export const activitiesAtom = atom<SynchronizedActivity[]>([]);
export const pipelineRunsAtom = atom<PipelineRun[]>([]);
export const activityStatsAtom = atom<{
  synchronizedCount: number;
  totalSynced?: number;
  monthlySynced?: number;
  weeklySynced?: number;
}>({ synchronizedCount: 0 });
export const unsynchronizedAtom = atom<UnsynchronizedEntry[]>([]);

// Last updated timestamps
export const activitiesLastUpdatedAtom = atom<Date | null>(null);
export const unsynchronizedLastUpdatedAtom = atom<Date | null>(null);

// Separate loading states for different contexts could be better, but simple atoms for now
export const isLoadingActivitiesAtom = atom<boolean>(false);
export const isActivitiesLoadedAtom = atom<boolean>(false);
export const isStatsLoadedAtom = atom<boolean>(false);
export const isUnsynchronizedLoadedAtom = atom<boolean>(false);
