import { client } from '../../shared/api/client';
import { components } from '../../shared/api/schema';
import { getFirebaseAuth } from '../../shared/firebase';

export type SynchronizedActivity = components['schemas']['SynchronizedActivity'];
export type UnsynchronizedEntry = components['schemas']['UnsynchronizedEntry'];
export type ExecutionRecord = components['schemas']['ExecutionRecord'];

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
  // list() removed - use useRealtimeActivities hook
  get(id: string): Promise<SynchronizedActivity | null>; // Kept for on-demand trace loading
  listUnsynchronized(limit?: number, offset?: number): Promise<UnsynchronizedEntry[]>;
  getUnsynchronizedTrace(pipelineExecutionId: string): Promise<{ pipelineExecutionId: string; pipelineExecution: ExecutionRecord[] } | null>;
  // Re-post methods
  repostToMissedDestination(activityId: string, destination: string): Promise<RepostResponse>;
  retryDestination(activityId: string, destination: string): Promise<RepostResponse>;
  fullPipelineRerun(activityId: string): Promise<RepostResponse>;
}

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const auth = getFirebaseAuth();
  const token = await auth?.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ActivitiesService: IActivitiesService = {
  async getStats() {
    const headers = await getAuthHeader();
    const { data, error } = await client.GET('/activities/stats', {
      headers,
    });

    if (error) {
      console.error('Failed to fetch activity stats', error);
      return { synchronizedCount: 0, totalSynced: 0, monthlySynced: 0, weeklySynced: 0 };
    }

    return {
      synchronizedCount: data?.synchronizedCount || 0,
      totalSynced: data?.totalSynced || 0,
      monthlySynced: data?.monthlySynced || 0,
      weeklySynced: data?.weeklySynced || 0,
    };
  },

  // list() removed - use useRealtimeActivities hook instead

  async get(id: string) {
    const headers = await getAuthHeader();
    const { data, error } = await client.GET('/activities/{id}', {
      headers,
      params: {
        path: { id }
      }
    });

    if (error) {
      // 404 is expected, but other errors might be worth logging
      return null;
    }

    return data?.activity || null;
  },

  async listUnsynchronized(limit = 20, offset = 0) {
    const headers = await getAuthHeader();
    const { data, error } = await client.GET('/activities/unsynchronized', {
      headers,
      params: {
        query: {
          limit,
          offset
        }
      }
    });

    if (error) {
      console.error('Failed to fetch unsynchronized executions', error);
      return [];
    }

    return data?.executions || [];
  },

  async getUnsynchronizedTrace(pipelineExecutionId: string) {
    const headers = await getAuthHeader();
    const { data, error } = await client.GET('/activities/unsynchronized/{pipelineExecutionId}', {
      headers,
      params: {
        path: { pipelineExecutionId }
      }
    });

    if (error) {
      return null;
    }

    return data ? { pipelineExecutionId: data.pipelineExecutionId || pipelineExecutionId, pipelineExecution: data.pipelineExecution || [] } : null;
  },

  // Re-post: Send activity to a new destination
  async repostToMissedDestination(activityId: string, destination: string): Promise<RepostResponse> {
    const headers = await getAuthHeader();
    const response = await fetch('/api/repost/missed-destination', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ activityId, destination }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { success: false, message: errorData.error || 'Failed to re-post to destination' };
    }

    return response.json();
  },

  // Re-post: Retry an existing destination
  async retryDestination(activityId: string, destination: string): Promise<RepostResponse> {
    const headers = await getAuthHeader();
    const response = await fetch('/api/repost/retry-destination', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ activityId, destination }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { success: false, message: errorData.error || 'Failed to retry destination' };
    }

    return response.json();
  },

  // Re-post: Full pipeline re-execution
  async fullPipelineRerun(activityId: string): Promise<RepostResponse> {
    const headers = await getAuthHeader();
    const response = await fetch('/api/repost/full-pipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ activityId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { success: false, message: errorData.error || 'Failed to re-run pipeline' };
    }

    return response.json();
  },
};

