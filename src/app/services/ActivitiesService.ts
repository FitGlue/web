import { client } from '../../shared/api/client';
import { components } from '../../shared/api/schema';
import { getFirebaseAuth } from '../../shared/firebase';

export type SynchronizedActivity = components['schemas']['SynchronizedActivity'];

export interface IActivitiesService {
  getStats(): Promise<{ synchronized_count: number }>;
  list(limit?: number): Promise<SynchronizedActivity[]>;
  get(id: string): Promise<SynchronizedActivity | null>;
}

const getAuthHeader = async () => {
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
      return { synchronized_count: 0 };
    }

    return data || { synchronized_count: 0 };
  },

  async list(limit = 20) {
    const headers = await getAuthHeader();
    const { data, error } = await client.GET('/activities', {
      headers,
      params: {
        query: {
          limit
        }
      }
    });

    if (error) {
      console.error('Failed to fetch activities list', error);
      return [];
    }

    return data?.activities || [];
  },

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
  }
};
