import { useCallback } from 'react';
import { adminClient } from '../../../shared/api/admin-client';

export type RepostMode = 'full-pipeline' | 'retry-destination' | 'missed-destination';

export interface UseAdminRunOpsResult {
  repost: (userId: string, activityId: string, mode: RepostMode, destination?: string) => Promise<void>;
  cancelRun: (userId: string, runId: string) => Promise<void>;
  resolvePendingInput: (userId: string, inputId: string) => Promise<void>;
}

/**
 * useAdminRunOps exposes the pipeline-run remediation actions an admin performs
 * on a user's behalf: repost (full re-run / retry or send to a destination),
 * cancel a stuck run, and resolve a blocking pending input.
 */
export function useAdminRunOps(): UseAdminRunOpsResult {
  const repost = useCallback(async (
    userId: string,
    activityId: string,
    mode: RepostMode,
    destination?: string,
  ) => {
    await adminClient.POST('/users/{id}/activities/{activityId}/repost', {
      params: { path: { id: userId, activityId } },
      body: { mode, destination: destination ?? '' },
    });
  }, []);

  const cancelRun = useCallback(async (userId: string, runId: string) => {
    await adminClient.POST('/users/{id}/pipeline-runs/{runId}/cancel', {
      params: { path: { id: userId, runId } },
      body: {},
    });
  }, []);

  const resolvePendingInput = useCallback(async (userId: string, inputId: string) => {
    await adminClient.POST('/users/{id}/pending-inputs/{inputId}/resolve', {
      params: { path: { id: userId, inputId } },
      body: {},
    });
  }, []);

  return { repost, cancelRun, resolvePendingInput };
}
