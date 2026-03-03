import { useMemo } from 'react';
import { client } from '../../shared/api/client';

/**
 * Hook that returns the typed openapi-fetch client.
 *
 * Usage:
 *   const api = useApiClient();
 *   const { data } = await api.GET('/users/me');
 *   // data is automatically typed — no manual cast needed
 *
 * The client has auth middleware that automatically attaches
 * the Firebase ID token to every request.
 */
export const useApiClient = () => {
    // The client is a singleton with middleware already configured,
    // but wrapping in useMemo ensures stable reference for consumers
    return useMemo(() => client, []);
};
