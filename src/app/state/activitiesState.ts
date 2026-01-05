import { atom } from 'jotai';
import { SynchronizedActivity } from '../services/ActivitiesService';

export const activitiesAtom = atom<SynchronizedActivity[]>([]);
export const activityStatsAtom = atom<{ synchronized_count: number }>({ synchronized_count: 0 });

// Separate loading states for different contexts could be better, but simple atoms for now
export const isLoadingActivitiesAtom = atom<boolean>(false);
export const isActivitiesLoadedAtom = atom<boolean>(false);
export const isStatsLoadedAtom = atom<boolean>(false);
