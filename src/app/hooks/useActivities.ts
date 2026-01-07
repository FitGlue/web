import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
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

type FetchMode = 'stats' | 'list' | 'single' | 'unsynchronized' | 'unsynchronized-trace';

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

  const fetchSingle = useCallback(async () => {
    if (!id) return;

    // Always fetch fresh data for single activity view to get pipelineExecution
    setLoading(true);
    try {
      const activity = await ActivitiesService.get(id);
      if (activity) {
        // Update list with this single activity (replace if exists, add if not)
        setActivities(prev => {
          const filtered = prev.filter(p => p.activityId !== activity.activityId);
          return [...filtered, activity];
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
    }
  }, [mode, id, fetchStats, fetchList, fetchSingle, fetchUnsynchronized]);

  // Determine which lastUpdated to return
  let lastUpdated: Date | null = null;
  if (mode === 'list') lastUpdated = activitiesLastUpdated;
  if (mode === 'unsynchronized') lastUpdated = unsynchronizedLastUpdated;

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
    }
  };
};

// Separate hook for fetching unsynchronized trace (not cached in global state)
export const useUnsynchronizedTrace = (pipelineExecutionId?: string) => {
  const [loading, setLoading] = useAtom(isLoadingActivitiesAtom);
  const [trace, setTrace] = useAtom<{ pipelineExecutionId: string; pipelineExecution: ExecutionRecord[] } | null>(
    () => null as { pipelineExecutionId: string; pipelineExecution: ExecutionRecord[] } | null
  );

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
