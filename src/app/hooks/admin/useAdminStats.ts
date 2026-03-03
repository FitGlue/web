import { useState, useCallback, useEffect } from 'react';
import { adminClient } from '../../../shared/api/admin-client';
import { AdminStats } from '../../state/adminState';

export interface UseAdminStatsResult {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching admin platform statistics
 */
export function useAdminStats(): UseAdminStatsResult {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminClient.GET('/stats' as never);
      setStats(data as unknown as AdminStats);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
