import { useState, useEffect } from 'react';
import { adminClient } from '../../../shared/api/admin-client';
import { logger } from '../../../shared/logger';
import { AdminPipelineRun } from '../../state/adminState';

export interface UseAdminRecentFailuresResult {
  runs: AdminPipelineRun[];
  loading: boolean;
}

/**
 * useAdminRecentFailures loads the most recent failed pipeline runs across all
 * users — the triage feed for the admin overview.
 */
export function useAdminRecentFailures(limit = 8): UseAdminRecentFailuresResult {
  const [runs, setRuns] = useState<AdminPipelineRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await adminClient.GET('/pipeline-runs', {
          params: { query: { status: 'PIPELINE_RUN_STATUS_FAILED', limit } },
        });
        if (active) setRuns((data?.runs as AdminPipelineRun[]) ?? []);
      } catch (err) {
        logger.warn('Failed to load recent failures:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [limit]);

  return { runs, loading };
}
