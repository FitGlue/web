import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { isPipelinesLoadedAtom } from '../../state/pipelinesState';

// Controllable mocks for the realtime data hooks the nudge engine depends on.
const realtime = {
  pipelines: [] as unknown[],
  integrations: null as Record<string, { connected: boolean }> | null,
};
vi.mock('../useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: realtime.pipelines }),
}));
vi.mock('../useRealtimeIntegrations', () => ({
  useRealtimeIntegrations: () => ({ integrations: realtime.integrations }),
}));

import { useSmartNudges } from '../useSmartNudges';

function wrapperWith(pipelinesLoaded: boolean) {
  const store = createStore();
  store.set(isPipelinesLoadedAtom, pipelinesLoaded);
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useSmartNudges', () => {
  beforeEach(() => {
    localStorage.clear();
    realtime.pipelines = [];
    realtime.integrations = null;
  });

  it('returns null until pipelines have loaded', () => {
    const { result } = renderHook(() => useSmartNudges('dashboard'), {
      wrapper: wrapperWith(false),
    });
    expect(result.current).toBeNull();
  });

  it('surfaces the highest-priority matching nudge for the page', () => {
    // No connections + nothing loaded-blocking → "no-connections" (priority 100).
    const { result } = renderHook(() => useSmartNudges('dashboard'), {
      wrapper: wrapperWith(true),
    });
    expect(result.current?.id).toBe('no-connections');
    expect(typeof result.current?.dismiss).toBe('function');
  });

  it('does not surface nudges for an unrelated page', () => {
    realtime.integrations = { strava: { connected: true } };
    // No nudge in the registry targets the 'activity-detail' page.
    const { result } = renderHook(() => useSmartNudges('activity-detail'), {
      wrapper: wrapperWith(true),
    });
    expect(result.current).toBeNull();
  });

  it('persists dismissals to localStorage and hides the nudge', () => {
    const { result } = renderHook(() => useSmartNudges('dashboard'), {
      wrapper: wrapperWith(true),
    });
    expect(result.current?.id).toBe('no-connections');

    act(() => result.current!.dismiss());

    expect(result.current).toBeNull();
    const stored = JSON.parse(localStorage.getItem('fitglue_dismissed_nudges') || '{}');
    expect(stored['no-connections']).toBeTypeOf('number');
  });

  it('re-shows a nudge once its 7-day dismissal window has elapsed', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      'fitglue_dismissed_nudges',
      JSON.stringify({ 'no-connections': eightDaysAgo }),
    );
    const { result } = renderHook(() => useSmartNudges('dashboard'), {
      wrapper: wrapperWith(true),
    });
    expect(result.current?.id).toBe('no-connections');
  });

  it('keeps a nudge hidden while still inside the dismissal window', () => {
    localStorage.setItem(
      'fitglue_dismissed_nudges',
      JSON.stringify({ 'no-connections': Date.now() }),
    );
    const { result } = renderHook(() => useSmartNudges('dashboard'), {
      wrapper: wrapperWith(true),
    });
    expect(result.current).toBeNull();
  });

  it('recovers from corrupt localStorage data', () => {
    localStorage.setItem('fitglue_dismissed_nudges', 'not json');
    const { result } = renderHook(() => useSmartNudges('dashboard'), {
      wrapper: wrapperWith(true),
    });
    // Should treat as "nothing dismissed" and still surface the nudge.
    expect(result.current?.id).toBe('no-connections');
  });
});
