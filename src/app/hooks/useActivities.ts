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
    // Check if already in list
    const existing = activities.find(a => a.activity_id === id);
    if (existing) return;

    setLoading(true);
    try {
      const activity = await ActivitiesService.get(id);
      if (activity) {
        // Update list with this single activity if not present
        setActivities(prev => {
          if (prev.find(p => p.activity_id === activity.activity_id)) return prev;
          return [...prev, activity];
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, activities, setActivities, setLoading]);

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
