import { client } from '../../shared/api/client';
import { components } from '../../shared/api/schema';
import { getFirebaseAuth } from '../../shared/firebase';

export type PendingInput = components['schemas']['PendingInput'];
export type InputResolutionRequest = components['schemas']['InputResolutionRequest'];

export interface IInputsService {
  getPendingInputs(): Promise<PendingInput[]>;
  resolveInput(request: InputResolutionRequest): Promise<boolean>;
  dismissInput(activityId: string): Promise<boolean>;
  setFCMToken(token: string): Promise<boolean>;
}

const getAuthHeader = async () => {
  const auth = getFirebaseAuth();
  const token = await auth?.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const InputsService: IInputsService = {
  async getPendingInputs() {
    const headers = await getAuthHeader();
    const { data, error } = await client.GET('/inputs', {
      headers,
    });

    if (error) {
      throw new Error('Failed to fetch pending inputs');
    }

    return data.inputs || [];
  },

  async resolveInput(request) {
    const headers = await getAuthHeader();
    const { data, error } = await client.POST('/inputs', {
      headers,
      body: request,
    });

    if (error) {
      throw new Error('Failed to resolve input');
    }

    return data?.success || false;
  },

  async setFCMToken(token: string) {
    const headers = await getAuthHeader();
    const { data, error } = await client.POST('/inputs/fcm-token', {
      headers,
      body: {
        token,
      },
    });

    if (error) {
      throw new Error('Failed to set FCM token');
    }

    return data?.success || false;
  },

  async dismissInput(activityId: string) {
    const headers = await getAuthHeader();
    // Use the correctly defined path in schema
    const { data: resData, error: resError } = await client.DELETE('/inputs/{id}', {
      headers,
      params: {
        path: { id: activityId }
      }
    });

    if (resError) {
      throw new Error('Failed to dismiss input');
    }
    return resData?.success || false;
  },
};
