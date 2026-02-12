import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

interface ShowcasePreferences {
    defaultDestination: boolean;
}

/**
 * Hook to fetch showcase preferences for the current user.
 * Returns whether the showcase should be pre-selected as a destination.
 */
export const useShowcasePreferences = () => {
    const api = useApi();
    const [preferences, setPreferences] = useState<ShowcasePreferences>({ defaultDestination: false });
    const [loading, setLoading] = useState(true);

    const fetchPreferences = useCallback(async () => {
        try {
            const data = await api.get('/showcase-management/preferences') as ShowcasePreferences;
            setPreferences(data);
        } catch {
            // Non-critical — default to false
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    return { preferences, loading };
};
