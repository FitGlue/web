import { useState, useCallback } from 'react';
import { logger } from '../../../shared/logger';
import { useAtom, useAtomValue } from 'jotai';
import { adminClient } from '../../../shared/api/admin-client';
import { AdminPipelineRun, pipelineRunFiltersAtom, selectedPipelineRunDetailAtom } from '../../state/adminState';

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

// The schema's ListPipelineRunsAdminResponse doesn't yet declare `stats` or
// `hasMore` — the server returns them but they're not in the proto. This local
// type captures the full server response until the proto is updated.
interface PipelineRunsResponse {
  runs: AdminPipelineRun[];
  stats: PipelineRunStats;
  nextCursor?: string;
  hasMore: boolean;
}

export function useAdminPipelineRuns(): UseAdminPipelineRunsResult {
  const [runs, setRuns] = useState<AdminPipelineRun[]>([]);
  const [stats, setStats] = useState<PipelineRunStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);

  const [selectedRun, setSelectedRun] = useAtom(selectedPipelineRunDetailAtom);
  const filters = useAtomValue(pipelineRunFiltersAtom);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminClient.GET('/pipeline-runs', {
        params: {
          query: {
            status: filters.status,
            source: filters.source,
            userId: filters.userId,
            limit: filters.limit || 50,
          },
        },
      });
      // Cast needed: server returns stats+hasMore+nextCursor not yet in proto.
      const typedData = data as unknown as PipelineRunsResponse;
      setRuns(typedData.runs);
      setStats(typedData.stats);
      setCursor(typedData.nextCursor);
      setHasMore(typedData.hasMore);
    } catch (err) {
      logger.warn('Failed to fetch pipeline runs:', err);
      setError('Failed to load pipeline runs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;

    setLoading(true);
    try {
      const { data } = await adminClient.GET('/pipeline-runs', {
        params: {
          query: {
            status: filters.status,
            source: filters.source,
            userId: filters.userId,
            limit: filters.limit || 50,
            pageToken: cursor,
          },
        },
      });
      const typedData = data as unknown as PipelineRunsResponse;
      setRuns(prev => [...prev, ...typedData.runs]);
      setCursor(typedData.nextCursor);
      setHasMore(typedData.hasMore);
    } catch (err) {
      logger.warn('Failed to load more pipeline runs:', err);
    } finally {
      setLoading(false);
    }
  }, [cursor, filters, loading]);

  const selectRun = useCallback((run: AdminPipelineRun | null) => {
    setSelectedRun(run);
  }, [setSelectedRun]);

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
