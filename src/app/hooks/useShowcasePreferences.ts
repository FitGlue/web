import { useState, useEffect, useCallback } from 'react';
import { client } from '../../shared/api/client';

interface ShowcasePreferences {
    defaultDestination: boolean;
}

/**
 * Hook to fetch showcase preferences for the current user.
 * Returns whether the showcase should be pre-selected as a destination.
 */
export const useShowcasePreferences = () => {
    const [preferences, setPreferences] = useState<ShowcasePreferences>({ defaultDestination: false });
    const [loading, setLoading] = useState(true);

    const fetchPreferences = useCallback(async () => {
        try {
            const { data } = await client.GET('/users/me/showcase-management/preferences');
            if (data) setPreferences(data as ShowcasePreferences);
        } catch {
            // Non-critical — default to false
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    return { preferences, loading };
};
