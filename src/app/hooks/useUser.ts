import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { userProfileAtom, profileLoadingAtom, profileErrorAtom, UserProfile } from '../state/userState';
import { userAtom, authLoadingAtom } from '../state/authState';

export function useUser() {
  const firebaseUser = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);
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
  // IMPORTANT: Wait for Firebase auth to be ready before fetching profile
  useEffect(() => {
    // Don't fetch while Firebase auth is still loading
    if (authLoading) return;
    
    // If there's no Firebase user, clear the profile
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    // Fetch profile if we have a Firebase user but no profile yet
    if (!user && !loading && !error) {
      fetchProfile();
    }
  }, [firebaseUser, authLoading, user, loading, error, fetchProfile, setUser, setLoading]);

  return {
    user,
    // Include auth loading state so consumers know the full loading story
    loading: authLoading || loading,
    error,
    refresh: () => fetchProfile(true),
  };
}
