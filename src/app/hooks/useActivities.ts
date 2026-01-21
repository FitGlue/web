import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import {
  activitiesAtom,
  activityStatsAtom,
  isLoadingActivitiesAtom,
  isActivitiesLoadedAtom,
  isStatsLoadedAtom,
  unsynchronizedAtom,
  isUnsynchronizedLoadedAtom,
  activitiesLastUpdatedAtom,
  unsynchronizedLastUpdatedAtom
} from '../state/activitiesState';
import { ActivitiesService, ExecutionRecord } from '../services/ActivitiesService';

type FetchMode = 'stats' | 'list' | 'single' | 'unsynchronized' | 'unsynchronized-trace' | 'dashboard';

export const useActivities = (mode: FetchMode = 'list', id?: string) => {
  const [activities, setActivities] = useAtom(activitiesAtom);
  const [stats, setStats] = useAtom(activityStatsAtom);
  const [loading, setLoading] = useAtom(isLoadingActivitiesAtom);
  const [loaded, setLoaded] = useAtom(isActivitiesLoadedAtom);
  const [statsLoaded, setStatsLoaded] = useAtom(isStatsLoadedAtom);
  const [unsynchronized, setUnsynchronized] = useAtom(unsynchronizedAtom);
  const [unsyncLoaded, setUnsyncLoaded] = useAtom(isUnsynchronizedLoadedAtom);

  const [activitiesLastUpdated, setActivitiesLastUpdated] = useAtom(activitiesLastUpdatedAtom);
  const [unsynchronizedLastUpdated, setUnsynchronizedLastUpdated] = useAtom(unsynchronizedLastUpdatedAtom);

  const fetchStats = useCallback(async (force = false) => {
    if (!force && statsLoaded) return;

    setLoading(true);
    try {
      const data = await ActivitiesService.getStats();
      setStats(data);
      setStatsLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statsLoaded, setStats, setStatsLoaded, setLoading]);

  const fetchList = useCallback(async (force = false) => {
    if (!force && loaded) return;

    setLoading(true);
    try {
      const data = await ActivitiesService.list();
      setActivities(data);
      setLoaded(true);
      setActivitiesLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loaded, setActivities, setLoaded, setLoading, setActivitiesLastUpdated]);

  // Dashboard mode: fetch with includeExecution=true for rich enrichment data
  // Also fetches unsynchronized and stats in parallel to populate everything
  const fetchDashboard = useCallback(async (force = false) => {
    if (!force && loaded && unsyncLoaded && statsLoaded) return;

    setLoading(true);
    try {
      // Fetch activities, unsynchronized, and stats in parallel
      const [activitiesData, unsyncData, statsData] = await Promise.all([
        (!force && loaded) ? Promise.resolve(null) : ActivitiesService.list(20, true),
        (!force && unsyncLoaded) ? Promise.resolve(null) : ActivitiesService.listUnsynchronized(20),
        (!force && statsLoaded) ? Promise.resolve(null) : ActivitiesService.getStats()
      ]);

      if (activitiesData) {
        setActivities(activitiesData);
        setLoaded(true);
        setActivitiesLastUpdated(new Date());
      }
      if (unsyncData) {
        setUnsynchronized(unsyncData);
        setUnsyncLoaded(true);
        setUnsynchronizedLastUpdated(new Date());
      }
      if (statsData) {
        setStats(statsData);
        setStatsLoaded(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loaded, unsyncLoaded, statsLoaded, setActivities, setLoaded, setLoading, setActivitiesLastUpdated, setUnsynchronized, setUnsyncLoaded, setUnsynchronizedLastUpdated, setStats, setStatsLoaded]);

  const fetchSingle = useCallback(async () => {
    if (!id) return;

    // Always fetch fresh data for single activity view to get pipelineExecution
    setLoading(true);
    try {
      const activity = await ActivitiesService.get(id);
      if (activity) {
        // Update list with this single activity (replace if exists, add if not)
        // Re-sort by syncedAt (most recent first) to preserve chronological order
        setActivities(prev => {
          const filtered = prev.filter(p => p.activityId !== activity.activityId);
          const updated = [...filtered, activity];
          return updated.sort((a, b) => {
            const dateA = a.syncedAt ? new Date(a.syncedAt).getTime() : 0;
            const dateB = b.syncedAt ? new Date(b.syncedAt).getTime() : 0;
            return dateB - dateA;
          });
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, setActivities, setLoading]);

  const fetchUnsynchronized = useCallback(async (force = false) => {
    if (!force && unsyncLoaded) return;

    setLoading(true);
    try {
      const data = await ActivitiesService.listUnsynchronized();
      setUnsynchronized(data);
      setUnsyncLoaded(true);
      setUnsynchronizedLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [unsyncLoaded, setUnsynchronized, setUnsyncLoaded, setLoading, setUnsynchronizedLastUpdated]);

  useEffect(() => {
    if (mode === 'stats') {
      fetchStats();
    } else if (mode === 'list') {
      fetchList();
    } else if (mode === 'single' && id) {
      fetchSingle();
    } else if (mode === 'unsynchronized') {
      fetchUnsynchronized();
    } else if (mode === 'dashboard') {
      fetchDashboard();
    }
  }, [mode, id, fetchStats, fetchList, fetchSingle, fetchUnsynchronized, fetchDashboard]);

  // Determine which lastUpdated to return
  let lastUpdated: Date | null = null;
  if (mode === 'list' || mode === 'dashboard') lastUpdated = activitiesLastUpdated;
  if (mode === 'unsynchronized') lastUpdated = unsynchronizedLastUpdated;

  // Refresh all data - useful when user wants to refresh everything
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [activitiesData, unsyncData, statsData] = await Promise.all([
        ActivitiesService.list(20, true),
        ActivitiesService.listUnsynchronized(20),
        ActivitiesService.getStats()
      ]);

      setActivities(activitiesData);
      setLoaded(true);
      setActivitiesLastUpdated(new Date());

      setUnsynchronized(unsyncData);
      setUnsyncLoaded(true);
      setUnsynchronizedLastUpdated(new Date());

      setStats(statsData);
      setStatsLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [setActivities, setLoaded, setLoading, setActivitiesLastUpdated, setUnsynchronized, setUnsyncLoaded, setUnsynchronizedLastUpdated, setStats, setStatsLoaded]);

  return {
    activities,
    stats,
    loading,
    unsynchronized,
    lastUpdated,
    refresh: () => {
      if (mode === 'stats') fetchStats(true);
      if (mode === 'list') fetchList(true);
      if (mode === 'single') fetchSingle();
      if (mode === 'unsynchronized') fetchUnsynchronized(true);
      if (mode === 'dashboard') fetchDashboard(true);
    },
    refreshAll
  };
};

// Separate hook for fetching unsynchronized trace (not cached in global state)
export const useUnsynchronizedTrace = (pipelineExecutionId?: string) => {
  const [loading, setLoading] = useAtom(isLoadingActivitiesAtom);
  const [trace, setTrace] = useState<{ pipelineExecutionId: string; pipelineExecution: ExecutionRecord[] } | null>(null);

  const fetchTrace = useCallback(async () => {
    if (!pipelineExecutionId) return;
    setLoading(true);
    try {
      const data = await ActivitiesService.getUnsynchronizedTrace(pipelineExecutionId);
      setTrace(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pipelineExecutionId, setLoading, setTrace]);

  useEffect(() => {
    if (pipelineExecutionId) {
      fetchTrace();
    }
  }, [pipelineExecutionId, fetchTrace]);

  return { trace, loading, refresh: fetchTrace };
};
