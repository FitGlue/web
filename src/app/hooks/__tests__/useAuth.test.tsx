import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const signIn = vi.fn();
const createUser = vi.fn();
const signOut = vi.fn();
const reauth = vi.fn();
const updatePassword = vi.fn();
const POST = vi.fn();
const initFirebase = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...a: unknown[]) => signIn(...a),
  createUserWithEmailAndPassword: (...a: unknown[]) => createUser(...a),
  signOut: (...a: unknown[]) => signOut(...a),
  reauthenticateWithCredential: (...a: unknown[]) => reauth(...a),
  updatePassword: (...a: unknown[]) => updatePassword(...a),
  EmailAuthProvider: { credential: (email: string, pw: string) => ({ email, pw }) },
}));
vi.mock('../../../shared/firebase', () => ({ initFirebase: () => initFirebase() }));
vi.mock('../../../shared/api/client', () => ({
  client: { POST: (...a: unknown[]) => POST(...a) },
  default: { POST: (...a: unknown[]) => POST(...a) },
}));

import { useAuth } from '../useAuth';

beforeEach(() => {
  // resetAllMocks (not clearAllMocks) so per-test mockRejectedValue overrides
  // don't leak into later tests.
  vi.resetAllMocks();
  initFirebase.mockResolvedValue({ auth: { currentUser: { email: 'a@b.com' } } });
  POST.mockResolvedValue({ data: {} });
});

describe('useAuth login/register/logout', () => {
  it('loginWithEmail returns true on success', async () => {
    const { result } = renderHook(() => useAuth());
    let ok!: boolean;
    await act(async () => { ok = await result.current.loginWithEmail('a@b.com', 'pw'); });
    expect(ok).toBe(true);
    expect(signIn).toHaveBeenCalled();
  });

  it('loginWithEmail returns false and sets error on failure', async () => {
    signIn.mockRejectedValue(new Error('bad creds'));
    const { result } = renderHook(() => useAuth());
    let ok!: boolean;
    await act(async () => { ok = await result.current.loginWithEmail('a@b.com', 'pw'); });
    expect(ok).toBe(false);
    expect(result.current.error?.message).toBe('bad creds');
  });

  it('registerWithEmail creates the user and sends verification', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.registerWithEmail('a@b.com', 'pw'); });
    expect(createUser).toHaveBeenCalled();
    expect(POST).toHaveBeenCalledWith('/users/me/auth-email/send-verification');
  });

  it('logout signs out', async () => {
    const { result } = renderHook(() => useAuth());
    let ok!: boolean;
    await act(async () => { ok = await result.current.logout(); });
    expect(ok).toBe(true);
    expect(signOut).toHaveBeenCalled();
  });

  it('surfaces a clear error when Firebase fails to init', async () => {
    initFirebase.mockResolvedValue(null);
    const { result } = renderHook(() => useAuth());
    let ok!: boolean;
    await act(async () => { ok = await result.current.logout(); });
    expect(ok).toBe(false);
    expect(result.current.error?.message).toBe('Failed to initialize Firebase');
  });
});

describe('useAuth email actions', () => {
  it('sendPasswordReset sets a success message', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.sendPasswordReset('a@b.com'); });
    expect(result.current.success).toMatch(/reset email sent/i);
  });

  it('resendVerificationEmail sets a success message', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.resendVerificationEmail(); });
    expect(result.current.success).toMatch(/verification email sent/i);
  });

  it('clearMessages resets error and success', async () => {
    signIn.mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.loginWithEmail('a@b.com', 'pw'); });
    act(() => result.current.clearMessages());
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });
});

describe('useAuth changePassword', () => {
  it('reauthenticates and updates the password', async () => {
    const { result } = renderHook(() => useAuth());
    let ok!: boolean;
    await act(async () => { ok = await result.current.changePassword('old', 'newpw'); });
    expect(ok).toBe(true);
    expect(reauth).toHaveBeenCalled();
    expect(updatePassword).toHaveBeenCalled();
    expect(result.current.success).toMatch(/updated/i);
  });

  it('maps wrong-password errors to a friendly message', async () => {
    reauth.mockRejectedValue({ code: 'auth/wrong-password' });
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.changePassword('old', 'newpw'); });
    expect(result.current.error?.message).toBe('Current password is incorrect');
  });

  it('maps weak-password errors to a friendly message', async () => {
    updatePassword.mockRejectedValue({ code: 'auth/weak-password' });
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.changePassword('old', 'newpw'); });
    expect(result.current.error?.message).toMatch(/too weak/i);
  });

  it('fails when there is no authenticated user', async () => {
    initFirebase.mockResolvedValue({ auth: { currentUser: null } });
    const { result } = renderHook(() => useAuth());
    let ok!: boolean;
    await act(async () => { ok = await result.current.changePassword('old', 'newpw'); });
    expect(ok).toBe(false);
  });
});
