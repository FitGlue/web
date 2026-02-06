import { useMemo, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { getFirebaseAuth } from '../../shared/firebase';
import { Sentry } from '../infrastructure/sentry';
import { authLoadingAtom } from '../state/authState';

/**
 * Capture API error in Sentry with context
 */
const captureApiError = (method: string, path: string, status: number, statusText: string) => {
  const error = new Error(`${method} ${path} failed: ${status} ${statusText}`);
  Sentry.captureException(error, {
    tags: {
      api_method: method,
      api_path: path,
      status_code: status,
    },
    extra: {
      statusText,
    },
  });
  return error;
};

/**
 * Normalize API path to prevent double /api prefix
 * If the path already starts with /api, strip it since we add it automatically
 */
const normalizePath = (path: string): string => {
  if (path.startsWith('/api/')) {
    console.warn(`useApi: Path "${path}" already includes /api prefix - stripping it automatically`);
    return path.slice(4); // Remove '/api' prefix
  }
  return path;
};

/**
 * Wait for Firebase auth to be ready with a timeout
 * This handles race conditions where API calls are made before auth is initialized
 */
const waitForAuth = async (maxWaitMs = 5000): Promise<boolean> => {
  const auth = getFirebaseAuth();
  if (auth?.currentUser) return true;

  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const currentAuth = getFirebaseAuth();
    if (currentAuth?.currentUser) return true;
  }
  return false;
};

/**
 * Generic API hook for making authenticated requests
 * Memoized to prevent infinite re-renders in consuming components
 */
export const useApi = () => {
  const authLoading = useAtomValue(authLoadingAtom);

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    // If auth is still loading, wait for it to be ready
    if (authLoading) {
      const ready = await waitForAuth();
      if (!ready) {
        console.warn('Auth not ready after timeout, proceeding without token');
        return {};
      }
    }

    const auth = getFirebaseAuth();
    if (!auth?.currentUser) {
      return {};
    }

    try {
      const token = await auth.currentUser.getIdToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (err) {
      console.error('Failed to get auth token:', err);
      return {};
    }
  }, [authLoading]);

  const get = useCallback(async (path: string) => {
    const headers = await getAuthHeader();
    const normalizedPath = normalizePath(path);
    const response = await fetch(`/api${normalizedPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw captureApiError('GET', path, response.status, response.statusText);
    }

    return response.json();
  }, [getAuthHeader]);

  const post = useCallback(async (path: string, body?: unknown) => {
    const headers = await getAuthHeader();
    const normalizedPath = normalizePath(path);
    const response = await fetch(`/api${normalizedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw captureApiError('POST', path, response.status, response.statusText);
    }

    return response.json();
  }, [getAuthHeader]);

  const patch = useCallback(async (path: string, body?: unknown) => {
    const headers = await getAuthHeader();
    const normalizedPath = normalizePath(path);
    const response = await fetch(`/api${normalizedPath}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw captureApiError('PATCH', path, response.status, response.statusText);
    }

    return response.json();
  }, [getAuthHeader]);

  const put = useCallback(async (path: string, body?: unknown) => {
    const headers = await getAuthHeader();
    const normalizedPath = normalizePath(path);
    const response = await fetch(`/api${normalizedPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw captureApiError('PUT', path, response.status, response.statusText);
    }

    return response.json();
  }, [getAuthHeader]);

  const del = useCallback(async (path: string) => {
    const headers = await getAuthHeader();
    const normalizedPath = normalizePath(path);
    const response = await fetch(`/api${normalizedPath}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw captureApiError('DELETE', path, response.status, response.statusText);
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

