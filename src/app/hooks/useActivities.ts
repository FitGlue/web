import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  activitiesAtom,
  activityStatsAtom,
  isLoadingActivitiesAtom,
  isActivitiesLoadedAtom,
  isStatsLoadedAtom
} from '../state/activitiesState';
import { ActivitiesService } from '../services/ActivitiesService';

type FetchMode = 'stats' | 'list' | 'single';

export const useActivities = (mode: FetchMode = 'list', id?: string) => {
  const [activities, setActivities] = useAtom(activitiesAtom);
  const [stats, setStats] = useAtom(activityStatsAtom);
  const [loading, setLoading] = useAtom(isLoadingActivitiesAtom);
  const [loaded, setLoaded] = useAtom(isActivitiesLoadedAtom);
  const [statsLoaded, setStatsLoaded] = useAtom(isStatsLoadedAtom);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loaded, setActivities, setLoaded, setLoading]);

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

  useEffect(() => {
    if (mode === 'stats') {
      fetchStats();
    } else if (mode === 'list') {
      fetchList();
    } else if (mode === 'single' && id) {
      fetchSingle();
    }
  }, [mode, id, fetchStats, fetchList, fetchSingle]);


  return {
    activities,
    stats,
    loading,
    refresh: () => {
      if (mode === 'stats') fetchStats(true);
      if (mode === 'list') fetchList(true);
      if (mode === 'single') fetchSingle();
    }
  };
};
