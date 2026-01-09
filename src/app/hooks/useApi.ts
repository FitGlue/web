import { getFirebaseAuth } from '../../shared/firebase';

/**
 * Generic API hook for making authenticated requests
 */
export const useApi = () => {
  const getAuthHeader = async () => {
    const auth = getFirebaseAuth();
    const token = await auth?.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const get = async (path: string) => {
    const headers = await getAuthHeader();
    const response = await fetch(`/api${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.statusText}`);
    }

    return response.json();
  };

  const post = async (path: string, body?: unknown) => {
    const headers = await getAuthHeader();
    const response = await fetch(`/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed: ${response.statusText}`);
    }

    return response.json();
  };

  const patch = async (path: string, body?: unknown) => {
    const headers = await getAuthHeader();
    const response = await fetch(`/api${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`PATCH ${path} failed: ${response.statusText}`);
    }

    return response.json();
  };

  const del = async (path: string) => {
    const headers = await getAuthHeader();
    const response = await fetch(`/api${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`DELETE ${path} failed: ${response.statusText}`);
    }

    return response.json();
  };

  return {
    get,
    post,
    patch,
    delete: del,
  };
};
