import { useMemo, useCallback } from 'react';
import { getFirebaseAuth } from '../../shared/firebase';

/**
 * Generic API hook for making authenticated requests
 * Memoized to prevent infinite re-renders in consuming components
 */
export const useApi = () => {
  const getAuthHeader = useCallback(async () => {
    const auth = getFirebaseAuth();
    const token = await auth?.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const get = useCallback(async (path: string) => {
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
  }, [getAuthHeader]);

  const post = useCallback(async (path: string, body?: unknown) => {
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
  }, [getAuthHeader]);

  const patch = useCallback(async (path: string, body?: unknown) => {
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
  }, [getAuthHeader]);

  const put = useCallback(async (path: string, body?: unknown) => {
    const headers = await getAuthHeader();
    const response = await fetch(`/api${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`PUT ${path} failed: ${response.statusText}`);
    }

    return response.json();
  }, [getAuthHeader]);

  const del = useCallback(async (path: string) => {
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
  }, [getAuthHeader]);

  return useMemo(() => ({
    get,
    post,
    patch,
    put,
    delete: del,
  }), [get, post, patch, put, del]);
};

