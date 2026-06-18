import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// jsdom lacks matchMedia — provide a controllable stub.
function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

import { usePWAInstall } from '../usePWAInstall';

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia(false);
});
afterEach(() => vi.unstubAllGlobals());

function fireBeforeInstallPrompt() {
  const evt = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  };
  evt.prompt = vi.fn().mockResolvedValue(undefined);
  (evt as { userChoice: Promise<{ outcome: string }> }).userChoice = Promise.resolve({ outcome: 'accepted' });
  act(() => { window.dispatchEvent(evt); });
  return evt;
}

describe('usePWAInstall', () => {
  it('starts not installable and not installed', () => {
    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('detects standalone (installed) mode', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.isInstalled).toBe(true);
  });

  it('becomes installable after the beforeinstallprompt event', async () => {
    const { result } = renderHook(() => usePWAInstall());
    fireBeforeInstallPrompt();
    await waitFor(() => expect(result.current.canInstall).toBe(true));
  });

  it('promptInstall resolves true when the user accepts', async () => {
    const { result } = renderHook(() => usePWAInstall());
    fireBeforeInstallPrompt();
    await waitFor(() => expect(result.current.canInstall).toBe(true));
    let accepted!: boolean;
    await act(async () => { accepted = await result.current.promptInstall(); });
    expect(accepted).toBe(true);
  });

  it('promptInstall returns false when there is no deferred prompt', async () => {
    const { result } = renderHook(() => usePWAInstall());
    let res!: boolean;
    await act(async () => { res = await result.current.promptInstall(); });
    expect(res).toBe(false);
  });

  it('dismissForMonth persists a timestamp and suppresses install', async () => {
    const { result } = renderHook(() => usePWAInstall());
    fireBeforeInstallPrompt();
    await waitFor(() => expect(result.current.canInstall).toBe(true));
    act(() => result.current.dismissForMonth());
    expect(localStorage.getItem('fitglue_pwa_install_dismissed')).toBeTruthy();
    expect(result.current.canInstall).toBe(false);
  });

  it('honours a recent dismissal on mount', () => {
    localStorage.setItem('fitglue_pwa_install_dismissed', Date.now().toString());
    const { result } = renderHook(() => usePWAInstall());
    fireBeforeInstallPrompt();
    expect(result.current.canInstall).toBe(false);
  });

  it('clears an expired dismissal on mount', () => {
    const old = Date.now() - 40 * 24 * 60 * 60 * 1000;
    localStorage.setItem('fitglue_pwa_install_dismissed', old.toString());
    renderHook(() => usePWAInstall());
    expect(localStorage.getItem('fitglue_pwa_install_dismissed')).toBeNull();
  });
});
