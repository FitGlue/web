import { useState, useCallback } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { initFirebase } from '../../shared/firebase';

interface AuthError {
  message: string;
  code?: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Registration failed' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  const loginWithGoogle = useCallback(async () => {
    clearMessages();
    setLoading(true);
    try {
      const auth = await getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Google sign-in failed' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  const loginWithFacebook = useCallback(async () => {
    clearMessages();
    setLoading(true);
    try {
      const auth = await getAuth();
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Facebook sign-in failed' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  const sendPasswordReset = useCallback(async (email: string) => {
    clearMessages();
    setLoading(true);
    try {
      const auth = await getAuth();
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Failed to send reset email' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  const resendVerificationEmail = useCallback(async (user: User) => {
    clearMessages();
    setLoading(true);
    try {
      await sendEmailVerification(user);
      setSuccess('Verification email sent! Check your inbox.');
      return true;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Failed to send verification email' });
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
    loginWithGoogle,
    loginWithFacebook,
    sendPasswordReset,
    resendVerificationEmail,
    logout,
  };
}
