import { useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from 'firebase/auth';
import { useApi } from './useApi';
import { initFirebase } from '../../shared/firebase';

interface AuthError {
  message: string;
  code?: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const api = useApi();

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const getAuth = async () => {
    const fb = await initFirebase();
    if (!fb) throw new Error('Failed to initialize Firebase');
    return fb.auth;
  };

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    clearMessages();
    setLoading(true);
    try {
      const auth = await getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Login failed' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  const registerWithEmail = useCallback(async (email: string, password: string) => {
    clearMessages();
    setLoading(true);
    try {
      const auth = await getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      await api.post('/users/me/auth-email/send-verification');
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Registration failed' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, api]);


  const sendPasswordReset = useCallback(async (email: string) => {
    clearMessages();
    setLoading(true);
    try {
      await api.post('/auth-email/send-password-reset', { email });
      setSuccess('Password reset email sent! Check your inbox.');
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Failed to send reset email' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, api]);

  const resendVerificationEmail = useCallback(async () => {
    clearMessages();
    setLoading(true);
    try {
      await api.post('/users/me/auth-email/send-verification');
      setSuccess('Verification email sent! Check your inbox.');
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Failed to send verification email' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, api]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    clearMessages();
    setLoading(true);
    try {
      const auth = await getAuth();
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No authenticated user');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully!');
      return true;
    } catch (e: unknown) {
      const firebaseError = e as { code?: string };
      if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError({ message: 'Current password is incorrect', code: firebaseError.code });
      } else if (firebaseError.code === 'auth/weak-password') {
        setError({ message: 'New password is too weak. Use at least 6 characters.', code: firebaseError.code });
      } else {
        setError({ message: e instanceof Error ? e.message : 'Failed to change password' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  const logout = useCallback(async () => {
    clearMessages();
    setLoading(true);
    try {
      const auth = await getAuth();
      await signOut(auth);
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Logout failed' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  return {
    loading,
    error,
    success,
    clearMessages,
    loginWithEmail,
    registerWithEmail,
    sendPasswordReset,
    resendVerificationEmail,
    changePassword,
    logout,
  };
}
