import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestoreListener } from './useFirestoreListener';
import { activitiesAtom, activityStatsAtom, activitiesLastUpdatedAtom } from '../state/activitiesState';
import { SynchronizedActivity } from '../services/ActivitiesService';
import { getFirebaseFirestore, getFirebaseAuth } from '../../shared/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Helper to convert Firestore Timestamp to Date string
const toDateString = (value: unknown): string | undefined => {
  if (!value) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = value as any;
  if (v.toDate && typeof v.toDate === 'function') {
    return v.toDate().toISOString();
  }
  if (v instanceof Date) {
    return v.toISOString();
  }
  if (typeof v === 'string') {
    return v;
  }
  return undefined;
};

/**
 * useRealtimeActivities - Firebase SDK Real-time Hook
 *
 * Listens to `users/{userId}/activities` via onSnapshot.
 * Uses the shared useFirestoreListener for common functionality.
 * 
 * Architecture: Firebase SDK for reads, REST for mutations only.
 * Execution traces (boosts) are loaded on-demand via useActivityTrace.
 */
export const useRealtimeActivities = (initialEnabled = true, activityLimit = 10) => {
  const [activities, setActivities] = useAtom(activitiesAtom);
  const [, setActivitiesLastUpdated] = useAtom(activitiesLastUpdatedAtom);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  const queryFactory = useCallback(
    (firestore: ReturnType<typeof import('../../shared/firebase').getFirebaseFirestore>, userId: string) => {
      if (!firestore || !isEnabled) return null;
      const activitiesRef = collection(firestore, 'users', userId, 'activities');
      return query(
        activitiesRef,
        orderBy('synced_at', 'desc'),
        limit(activityLimit)
      );
    },
    [activityLimit, isEnabled]
  );

  const mapper = useCallback((snapshot: unknown): SynchronizedActivity[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const querySnapshot = snapshot as any;
    return querySnapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => {
      const data = doc.data();
      const activity: SynchronizedActivity = {
        activityId: doc.id,
        title: data.title as string,
        description: data.description as string | undefined,
        type: data.type as number | undefined,
        source: data.source as string | undefined,
        startTime: toDateString(data.start_time) || toDateString(data.startTime),
        syncedAt: toDateString(data.synced_at) || toDateString(data.syncedAt),
        pipelineId: data.pipeline_id as string | undefined,
        pipelineExecutionId: data.pipeline_execution_id as string | undefined,
        destinations: (data.destinations || {}) as Record<string, string>
      };
      return activity;
    });
  }, []);

  const handleData = useCallback((data: SynchronizedActivity[]) => {
    // Merge with existing data to preserve pipelineExecution if loaded
    setActivities(prev => {
      const existingMap = new Map(prev.map(a => [a.activityId, a]));
      for (const activity of data) {
        const existing = existingMap.get(activity.activityId);
        if (existing) {
          existingMap.set(activity.activityId, {
            ...activity,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pipelineExecution: (existing as any).pipelineExecution,
          });
        } else {
          existingMap.set(activity.activityId, activity);
        }
      }
      const merged = Array.from(existingMap.values());
      return merged.sort((a, b) => {
        const dateA = a.syncedAt ? new Date(a.syncedAt).getTime() : 0;
        const dateB = b.syncedAt ? new Date(b.syncedAt).getTime() : 0;
        return dateB - dateA;
      }).slice(0, activityLimit);
    });
    setActivitiesLastUpdated(new Date());
  }, [setActivities, setActivitiesLastUpdated, activityLimit]);

  const { loading, error, isListening, refresh } = useFirestoreListener({
    queryFactory,
    mapper,
    onData: handleData,
    enabled: isEnabled,
  });

  const toggleRealtime = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  return {
    activities,
    loading,
    isEnabled,
    isListening,
    error,
    forceRefresh: refresh,
    toggleRealtime,
  };
};

/**
 * useRealtimeStats - Live Statistics Hook
 *
 * Watches the user document for activityCounts changes and updates stats in real-time.
 */
export const useRealtimeStats = (enabled = true) => {
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  const [, setStats] = useAtom(activityStatsAtom);

  // This hook doesn't use useFirestoreListener because it's a simple
  // document listener that just extracts a specific nested field
  const firestore = getFirebaseFirestore();

  if (enabled && currentUser?.uid && firestore) {
    const userRef = doc(firestore, 'users', currentUser.uid);

    onSnapshot(
      userRef,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (snapshot: any) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.activityCounts?.weeklySync !== undefined) {
            setStats({ synchronizedCount: data.activityCounts.weeklySync });
          }
        }
      },
      (err: Error) => {
        console.error('Realtime stats listener error:', err);
      }
    );
  }
};
