import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useApi } from './useApi';
import {
  pipelinesAtom,
  pipelinesLastUpdatedAtom,
  isLoadingPipelinesAtom,
  isPipelinesLoadedAtom,
  PipelineConfig
} from '../state/pipelinesState';

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for pipelines with Jotai caching
 * Only fetches if data is stale or not loaded
 */
export const usePipelines = () => {
  const api = useApi();
  const [pipelines, setPipelines] = useAtom(pipelinesAtom);
  const [lastUpdated, setLastUpdated] = useAtom(pipelinesLastUpdatedAtom);
  const [loading, setLoading] = useAtom(isLoadingPipelinesAtom);
  const [loaded, setLoaded] = useAtom(isPipelinesLoadedAtom);

  const isStale = !lastUpdated || Date.now() - lastUpdated.getTime() > STALE_THRESHOLD_MS;

  const fetchPipelines = useCallback(async (force = false) => {
    // Skip if already loaded and not stale (unless forced)
    if (loaded && !isStale && !force) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/users/me/pipelines');
      const data = (response as { pipelines: PipelineConfig[] }).pipelines || [];
      setPipelines(data);
      setLastUpdated(new Date());
      setLoaded(true);
    } catch (error) {
      console.error('Failed to fetch pipelines:', error);
    } finally {
      setLoading(false);
    }
  }, [api, loaded, isStale, setPipelines, setLastUpdated, setLoaded, setLoading]);

  const refresh = useCallback(() => fetchPipelines(true), [fetchPipelines]);
  const fetchIfNeeded = useCallback(() => fetchPipelines(false), [fetchPipelines]);

  return {
    pipelines,
    loading,
    loaded,
    lastUpdated,
    refresh,
    fetchIfNeeded,
  };
};
