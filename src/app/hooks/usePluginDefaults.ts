import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export interface PluginDefault {
    pluginId: string;
    config: Record<string, string>;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * usePluginDefaults - Fetch and manage user-level plugin default configurations.
 *
 * Used by the pipeline wizard to pre-populate config fields from defaults,
 * and by the settings UI for managing defaults directly.
 */
export const usePluginDefaults = () => {
    const api = useApi();
    const [defaults, setDefaults] = useState<PluginDefault[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDefaults = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/users/me/plugin-defaults');
            setDefaults(response.defaults || []);
        } catch (err) {
            console.error('Failed to fetch plugin defaults:', err);
            setError('Failed to load plugin defaults');
            setDefaults([]);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchDefaults();
    }, [fetchDefaults]);

    /**
     * Get the default config for a specific plugin by registry ID.
     * Returns the config object or undefined if no default exists.
     */
    const getDefault = useCallback(
        (pluginId: string): Record<string, string> | undefined => {
            const found = defaults.find(d => d.pluginId === pluginId);
            return found?.config;
        },
        [defaults]
    );

    /**
     * Save or update a plugin default configuration.
     */
    const setDefault = useCallback(
        async (pluginId: string, config: Record<string, string>) => {
            try {
                await api.put(`/users/me/plugin-defaults/${pluginId}`, { config });
                // Refresh the local cache
                await fetchDefaults();
            } catch (err) {
                console.error('Failed to save plugin default:', err);
                throw err;
            }
        },
        [api, fetchDefaults]
    );

    /**
     * Delete a plugin default configuration.
     */
    const deleteDefault = useCallback(
        async (pluginId: string) => {
            try {
                await api.delete(`/users/me/plugin-defaults/${pluginId}`);
                // Refresh the local cache
                await fetchDefaults();
            } catch (err) {
                console.error('Failed to delete plugin default:', err);
                throw err;
            }
        },
        [api, fetchDefaults]
    );

    return {
        defaults,
        loading,
        error,
        getDefault,
        setDefault,
        deleteDefault,
        refresh: fetchDefaults,
    };
};
