import { client } from '../../shared/api/client';

// These types would come from the generated schema once activities
// endpoints are added to the gateway proto. For now, defined locally.
export interface SynchronizedActivity {
  id: string;
  activityId?: string;
  name?: string;
  sport?: string;
  startedAt?: string;
  source?: string;
  pipelineExecution?: ExecutionRecord[];
  enrichedData?: Record<string, unknown>;
  destinations?: Array<{ destination: string; status: string; externalId?: string; error?: string }>;
}

export interface UnsynchronizedEntry {
  pipelineExecutionId: string;
  activityId?: string;
  source?: string;
  startedAt?: string;
  error?: string;
  title?: string;
  activityType?: string;
  timestamp?: string;
  status?: string;
  errorMessage?: string;
}

export interface ExecutionRecord {
  /** Service name, e.g. "parkrun-results", "workout-summary" */
  service?: string;
  executionId?: string;
  step?: string;
  status?: string;
  /** ISO timestamp */
  timestamp?: string;
  startTime?: string;
  endTime?: string;
  startedAt?: string;
  completedAt?: string;
  triggerType?: string;
  /** JSON-encoded input/output payloads for nerd mode */
  inputsJson?: string;
  outputsJson?: string;
  error?: string;
  errorMessage?: string;
}

export interface RepostResponse {
  success: boolean;
  message: string;
  newPipelineExecutionId?: string;
  destination?: string;
  promptUpdatePipeline?: boolean;
}

export interface IActivitiesService {
  getStats(): Promise<{
    synchronizedCount: number;
    totalSynced: number;
    monthlySynced: number;
    weeklySynced: number;
  }>;
  get(id: string): Promise<SynchronizedActivity | null>;
  listUnsynchronized(limit?: number, offset?: number): Promise<UnsynchronizedEntry[]>;
  getUnsynchronizedTrace(pipelineExecutionId: string): Promise<{ pipelineExecutionId: string; pipelineExecution: ExecutionRecord[] } | null>;
  repostToMissedDestination(activityId: string, destination: string): Promise<RepostResponse>;
  retryDestination(activityId: string, destination: string): Promise<RepostResponse>;
  fullPipelineRerun(activityId: string): Promise<RepostResponse>;
}


// TODO: Add unsynchronized endpoints to gateway proto so they appear in the OpenAPI spec.
export const ActivitiesService: IActivitiesService = {
  async getStats() {
    const { data, error } = await client.GET('/users/me/activities/stats');

    if (error) {
      console.error('Failed to fetch activity stats', error);
      return { synchronizedCount: 0, totalSynced: 0, monthlySynced: 0, weeklySynced: 0 };
    }

    const d = data as Record<string, unknown>;
    return {
      synchronizedCount: (d?.synchronizedCount as number) || 0,
      totalSynced: (d?.totalSynced as number) || 0,
      monthlySynced: (d?.monthlySynced as number) || 0,
      weeklySynced: (d?.weeklySynced as number) || 0,
    };
  },

  async get(id: string) {
    const { data, error } = await client.GET('/users/me/activities/{id}', {
      params: { path: { id } }
    });

    if (error) return null;
    return ((data as Record<string, unknown>)?.activity as SynchronizedActivity) || null;
  },

  // TODO: Add /users/me/activities/unsynchronized to gateway proto
  async listUnsynchronized(limit = 20, offset = 0) {
    const { data, error } = await client.GET('/activities/unsynchronized' as '/users/me/activities/{id}', {
      params: { query: { limit, offset } } as never
    });

    if (error) {
      console.error('Failed to fetch unsynchronized executions', error);
      return [];
    }

    return ((data as Record<string, unknown>)?.executions as UnsynchronizedEntry[]) || [];
  },

  // TODO: Add /users/me/activities/unsynchronized/{id} to gateway proto
  async getUnsynchronizedTrace(pipelineExecutionId: string) {
    const { data, error } = await client.GET('/activities/unsynchronized/{pipelineExecutionId}' as '/users/me/activities/{id}', {
      params: { path: { pipelineExecutionId } } as never
    });

    if (error) return null;

    const d = data as Record<string, unknown>;
    return d ? { pipelineExecutionId: (d.pipelineExecutionId as string) || pipelineExecutionId, pipelineExecution: (d.pipelineExecution as ExecutionRecord[]) || [] } : null;
  },

  async repostToMissedDestination(activityId: string, destination: string): Promise<RepostResponse> {
    try {
      const { data, error } = await client.POST('/repost/missed-destination', {
        body: { activityId, destination } as never,
      });
      if (error) return { success: false, message: 'Failed to re-post to destination' };
      return (data as RepostResponse) || { success: true };
    } catch {
      return { success: false, message: 'Failed to re-post to destination' };
    }
  },

  async retryDestination(activityId: string, destination: string): Promise<RepostResponse> {
    try {
      const { data, error } = await client.POST('/repost/retry-destination', {
        body: { activityId, destination } as never,
      });
      if (error) return { success: false, message: 'Failed to retry destination' };
      return (data as RepostResponse) || { success: true };
    } catch {
      return { success: false, message: 'Failed to retry destination' };
    }
  },

  async fullPipelineRerun(activityId: string): Promise<RepostResponse> {
    try {
      const { data, error } = await client.POST('/repost/full-pipeline', {
        body: { activityId } as never,
      });
      if (error) return { success: false, message: 'Failed to re-run pipeline' };
      return (data as RepostResponse) || { success: true };
    } catch {
      return { success: false, message: 'Failed to re-run pipeline' };
    }
  },
};

