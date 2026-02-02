import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useApi } from '../useApi';
import { AdminPipelineRun, pipelineRunFiltersAtom } from '../../state/adminState';

export interface PipelineRunStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
}

export interface UseAdminPipelineRunsResult {
  runs: AdminPipelineRun[];
  stats: PipelineRunStats | null;
  loading: boolean;
  error: string | null;
  selectedRun: AdminPipelineRun | null;
  hasMore: boolean;
  fetchRuns: () => Promise<void>;
  selectRun: (run: AdminPipelineRun | null) => void;
  loadMore: () => Promise<void>;
}

interface PipelineRunsResponse {
  runs: AdminPipelineRun[];
  stats: PipelineRunStats;
  nextCursor?: string;
  hasMore: boolean;
}

/**
 * Hook for fetching admin pipeline runs across all users
 */
export function useAdminPipelineRuns(): UseAdminPipelineRunsResult {
  const [runs, setRuns] = useState<AdminPipelineRun[]>([]);
  const [stats, setStats] = useState<PipelineRunStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<AdminPipelineRun | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  
  const filters = useAtomValue(pipelineRunFiltersAtom);
  const api = useApi();

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.source) params.set('source', filters.source);
      if (filters.userId) params.set('userId', filters.userId);
      params.set('limit', String(filters.limit || 50));

      const data = await api.get(`/admin/pipeline-runs?${params.toString()}`) as PipelineRunsResponse;
      setRuns(data.runs);
      setStats(data.stats);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to fetch pipeline runs:', err);
      setError('Failed to load pipeline runs');
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.source) params.set('source', filters.source);
      if (filters.userId) params.set('userId', filters.userId);
      params.set('limit', String(filters.limit || 50));
      params.set('cursor', cursor);

      const data = await api.get(`/admin/pipeline-runs?${params.toString()}`) as PipelineRunsResponse;
      setRuns(prev => [...prev, ...data.runs]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load more pipeline runs:', err);
    } finally {
      setLoading(false);
    }
  }, [api, cursor, filters, loading]);

  const selectRun = useCallback((run: AdminPipelineRun | null) => {
    setSelectedRun(run);
  }, []);

  return {
    runs,
    stats,
    loading,
    error,
    selectedRun,
    hasMore,
    fetchRuns,
    selectRun,
    loadMore,
  };
}
