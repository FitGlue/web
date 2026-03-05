import { client } from '../../shared/api/client';

// These types are not yet in the gateway OpenAPI spec. Defined locally.
export interface PendingInput {
  id?: string;
  activityId: string;
  pipelineId?: string;
  enricherType?: string;
  enricherProviderId?: string;
  prompt?: string;
  options?: Array<{ label: string; value: string }>;
  requiredFields?: string[];
  createdAt?: string;
  autoDeadline?: string;
  autoPopulated?: boolean;
  providerMetadata?: Record<string, string>;
  providerType?: number;
  /** Numeric status from Firestore */
  status?: number;
  /** Input data collected from the user */
  inputData?: Record<string, string>;
}

export interface InputResolutionRequest {
  activityId: string;
  enricherType?: string;
  resolution?: string;
  inputData?: Record<string, string>;
}

export interface IInputsService {
  resolveInput(request: InputResolutionRequest): Promise<boolean>;
  dismissInput(activityId: string): Promise<boolean>;
  setFCMToken(token: string): Promise<boolean>;
}

export const InputsService: IInputsService = {
  async resolveInput(request) {
    await client.POST('/users/me/pending-inputs/{inputId}/submit', {
      params: { path: { inputId: request.activityId } },
      body: request as never,
    });
    return true;
  },

  async setFCMToken(token: string) {
    await client.POST('/users/me/fcm-token', {
      body: { token } as never,
    });
    return true;
  },

  async dismissInput(activityId: string) {
    // TODO: Add proper dismiss endpoint to gateway proto
    await client.DELETE('/inputs/{id}' as '/users/me/activities/{id}', {
      params: { path: { id: activityId } } as never
    });
    return true;
  },
};
