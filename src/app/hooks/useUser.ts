import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { userProfileAtom, profileLoadingAtom, profileErrorAtom, UserProfile } from '../state/userState';

export function useUser() {
  const [user, setUser] = useAtom(userProfileAtom);
  const [loading, setLoading] = useAtom(profileLoadingAtom);
  const [error, setError] = useAtom(profileErrorAtom);
  const api = useApi();

  const fetchProfile = useCallback(async (force = false) => {
    if (user && !force) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/users/me') as UserProfile;
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [user, api, setUser, setLoading, setError]);

  // Fetch on mount if not already loaded (don't retry on error)
  useEffect(() => {
    if (!user && !loading && !error) {
      fetchProfile();
    }
  }, [user, loading, error, fetchProfile]);

  return {
    user,
    loading,
    error,
    refresh: () => fetchProfile(true),
  };
}
