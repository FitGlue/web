import { client } from '../../shared/api/client';
import { components } from '../../shared/api/schema';

export type PendingInput = components['schemas']['PendingInput'];
export type InputResolutionRequest = components['schemas']['InputResolutionRequest'];

export interface IInputsService {
  getPendingInputs(): Promise<PendingInput[]>;
  resolveInput(request: InputResolutionRequest): Promise<boolean>;
}

export const InputsService: IInputsService = {
  async getPendingInputs() {
    const { data, error } = await client.GET('/inputs', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`, // Placeholder for real auth
      }
    });

    if (error) {
      throw new Error('Failed to fetch pending inputs');
    }

    return data.inputs || [];
  },

  async resolveInput(request) {
    const { data, error } = await client.POST('/inputs', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`, // Placeholder for real auth
      },
      body: request,
    });

    if (error) {
      throw new Error('Failed to resolve input');
    }

    return data.success || false;
  },
};
