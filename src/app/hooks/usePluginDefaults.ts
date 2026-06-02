import { useState, useEffect, useCallback } from 'react';
import { client } from '../../shared/api/client';
import { logger } from '../../shared/logger';

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
    const [defaults, setDefaults] = useState<PluginDefault[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDefaults = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await client.GET('/users/me/plugin-defaults');
            // API returns { defaults: { [pluginId]: { [key]: value, ... } } } (map<string, Struct>)
            // Normalise to PluginDefault[] for consistent .find() access
            const rawMap = (data as { defaults?: Record<string, Record<string, string>> } | undefined)?.defaults ?? {};
            const normalised: PluginDefault[] = Object.entries(rawMap).map(([pluginId, config]) => ({
                pluginId,
                config: config ?? {},
            }));
            setDefaults(normalised);
        } catch (err) {
            logger.warn('Failed to fetch plugin defaults:', err);
            setError('Failed to load plugin defaults');
            setDefaults([]);
        } finally {
            setLoading(false);
        }
    }, []);

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
                await client.PUT('/users/me/plugin-defaults/{pluginId}', {
                    params: { path: { pluginId } },
                    body: { defaults: config } as never,
                });
                await fetchDefaults();
            } catch (err) {
                logger.error('Failed to save plugin default:', err);
                throw err;
            }
        },
        [fetchDefaults]
    );

    /**
     * Delete a plugin default configuration.
     */
    const deleteDefault = useCallback(
        async (pluginId: string) => {
            try {
                await client.DELETE('/users/me/plugin-defaults/{pluginId}', {
                    params: { path: { pluginId } },
                });
                await fetchDefaults();
            } catch (err) {
                logger.error('Failed to delete plugin default:', err);
                throw err;
            }
        },
        [fetchDefaults]
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
