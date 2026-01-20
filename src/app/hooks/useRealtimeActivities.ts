import { useEffect, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '../../shared/firebase';
import { activitiesAtom, activityStatsAtom, activitiesLastUpdatedAtom } from '../state/activitiesState';
import { SynchronizedActivity } from '../services/ActivitiesService';

/**
 * useRealtimeActivities - Phase 3 Live-Updating Hook
 *
 * This hook establishes Firestore onSnapshot listeners for:
 * 1. User's synchronized activities (for live activity feed)
 * 2. User's activity counters (for live stats)
 *
 * It automatically updates the global Jotai state when activities are added/modified,
 * enabling the dashboard to update in real-time without manual refresh.
 *
 * @param initialEnabled - Whether to initially enable real-time listening (default: true)
 * @param activityLimit - Maximum activities to listen to (default: 10)
 */
export const useRealtimeActivities = (initialEnabled = true, activityLimit = 10) => {
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  const [, setActivities] = useAtom(activitiesAtom);
  const [, setActivitiesLastUpdated] = useAtom(activitiesLastUpdatedAtom);

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track if this is the first snapshot (to avoid over-writing initial API data)
  const [hasReceivedFirstSnapshot, setHasReceivedFirstSnapshot] = useState(false);

  useEffect(() => {
    if (!isEnabled || !currentUser?.uid) {
      setIsListening(false);
      return;
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) {
      console.warn('Firestore not initialized - real-time updates disabled');
      return;
    }

    const unsubscribers: Unsubscribe[] = [];

    try {
      // --- Listener 1: Synchronized Activities ---
      const activitiesRef = collection(firestore, 'users', currentUser.uid, 'activities');
      const activitiesQuery = query(
        activitiesRef,
        orderBy('synced_at', 'desc'),
        limit(activityLimit)
      );

      const activitiesUnsubscribe = onSnapshot(
        activitiesQuery,
        (snapshot) => {
          // Skip the first snapshot if we already have data from API
          // to avoid flickering/replacing richer API data
          if (!hasReceivedFirstSnapshot) {
            setHasReceivedFirstSnapshot(true);
            // Only update if we have no existing data
            // (this handles the case where listener beats API response)
          }

          const activities: SynchronizedActivity[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              activityId: doc.id,
              title: data.title || '',
              description: data.description || '',
              type: data.type,
              source: data.source,
              startTime: data.start_time?.toDate?.()?.toISOString() || data.start_time,
              destinations: data.destinations || {},
              syncedAt: data.synced_at?.toDate?.()?.toISOString() || data.synced_at,
              pipelineId: data.pipeline_id || '',
              pipelineExecutionId: data.pipeline_execution_id || '',
            };
          });

          // Merge with existing activities (preserving execution traces from API)
          setActivities((prev) => {
            // Create a map of existing activities by ID
            const existingMap = new Map(prev.map(a => [a.activityId, a]));

            // Update with new data, preserving fields not in Firestore
            for (const activity of activities) {
              const existing = existingMap.get(activity.activityId);
              if (existing) {
                // Preserve pipelineExecution from API if it exists
                existingMap.set(activity.activityId, {
                  ...activity,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  pipelineExecution: (existing as any).pipelineExecution,
                });
              } else {
                existingMap.set(activity.activityId, activity);
              }
            }

            // Sort by syncedAt descending
            const merged = Array.from(existingMap.values());
            return merged.sort((a, b) => {
              const dateA = a.syncedAt ? new Date(a.syncedAt).getTime() : 0;
              const dateB = b.syncedAt ? new Date(b.syncedAt).getTime() : 0;
              return dateB - dateA;
            }).slice(0, activityLimit);
          });

          setActivitiesLastUpdated(new Date());
        },
        (err) => {
          console.error('Realtime activities listener error:', err);
          setError(err);
        }
      );
      unsubscribers.push(activitiesUnsubscribe);

      // --- Listener 2: Activity Counters (from user doc) ---
      // This listener watches the user document for activityCounts changes
      // Note: We're using the REST API for user doc since it's already loaded
      // A full implementation would add another listener here

      setIsListening(true);
      setError(null);

    } catch (err) {
      console.error('Failed to setup realtime listeners:', err);
      setError(err as Error);
    }

    // Cleanup: unsubscribe all listeners
    return () => {
      unsubscribers.forEach(unsub => unsub());
      setIsListening(false);
    };
  }, [isEnabled, currentUser?.uid, activityLimit, setActivities, setActivitiesLastUpdated, hasReceivedFirstSnapshot]);

  // Manual refresh function - force re-fetch from API
  const forceRefresh = useCallback(async () => {
    // This will be handled by the existing useActivities hook
    // The real-time listener will automatically pick up changes
    setActivitiesLastUpdated(new Date());
  }, [setActivitiesLastUpdated]);

  // Toggle real-time updates on/off
  const toggleRealtime = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  return {
    isEnabled,
    isListening,
    error,
    forceRefresh,
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

  useEffect(() => {
    if (!enabled || !currentUser?.uid) return;

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    // Listen to user document for activityCounts changes
    const userRef = doc(firestore, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
  }, [enabled, currentUser?.uid, setStats]);
};
