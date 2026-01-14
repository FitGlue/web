import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useApi } from './useApi';
import {
  integrationsAtom,
  integrationsLastUpdatedAtom,
  isLoadingIntegrationsAtom,
  isIntegrationsLoadedAtom,
  IntegrationsSummary
} from '../state/integrationsState';

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for integrations with Jotai caching
 * Only fetches if data is stale or not loaded
 */
export const useIntegrations = () => {
  const api = useApi();
  const [integrations, setIntegrations] = useAtom(integrationsAtom);
  const [lastUpdated, setLastUpdated] = useAtom(integrationsLastUpdatedAtom);
  const [loading, setLoading] = useAtom(isLoadingIntegrationsAtom);
  const [loaded, setLoaded] = useAtom(isIntegrationsLoadedAtom);

  const isStale = !lastUpdated || Date.now() - lastUpdated.getTime() > STALE_THRESHOLD_MS;

  const fetchIntegrations = useCallback(async (force = false) => {
    // Skip if already loaded and not stale (unless forced)
    if (loaded && !isStale && !force) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/users/me/integrations');
      setIntegrations(response as IntegrationsSummary);
      setLastUpdated(new Date());
      setLoaded(true);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  }, [api, loaded, isStale, setIntegrations, setLastUpdated, setLoaded, setLoading]);

  const refresh = useCallback(() => fetchIntegrations(true), [fetchIntegrations]);
  const fetchIfNeeded = useCallback(() => fetchIntegrations(false), [fetchIntegrations]);

  return {
    integrations,
    loading,
    loaded,
    lastUpdated,
    refresh,
    fetchIfNeeded,
  };
};
