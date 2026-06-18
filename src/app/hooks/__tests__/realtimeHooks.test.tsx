import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

const { state } = vi.hoisted(() => ({
  state: {
    auth: { currentUser: { uid: 'u1' } } as { currentUser: { uid: string } | null } | null,
    firestore: {} as object | null,
    onNext: undefined as ((snap: unknown) => void) | undefined,
    onError: undefined as ((e: Error) => void) | undefined,
  },
}));

vi.mock('firebase/firestore', () => ({
  onSnapshot: (_q: unknown, next: (s: unknown) => void, err: (e: Error) => void) => {
    state.onNext = next;
    state.onError = err;
    return () => {};
  },
  collection: () => ({}),
  query: () => ({}),
  doc: () => ({}),
}));
vi.mock('../../../shared/firebase', () => ({
  getFirebaseFirestore: () => state.firestore,
  getFirebaseAuth: () => state.auth,
}));
vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { useRealtimePipelines } from '../useRealtimePipelines';
import { useRealtimeIntegrations } from '../useRealtimeIntegrations';
import { useRealtimeStats } from '../useRealtimeStats';
import { pipelinesAtom } from '../../state/pipelinesState';
import { integrationsAtom } from '../../state/integrationsState';
import { activityStatsAtom } from '../../state/activitiesState';

beforeEach(() => {
  state.auth = { currentUser: { uid: 'u1' } };
  state.firestore = {};
  state.onNext = undefined;
  state.onError = undefined;
});

function withStore() {
  const store = createStore();
  const wrapper = function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
  return { store, wrapper };
}

describe('useRealtimePipelines', () => {
  it('maps Firestore pipeline docs, normalising sources and enrichers', () => {
    const { store, wrapper } = withStore();
    renderHook(() => useRealtimePipelines(), { wrapper });
    act(() => state.onNext?.({
      docs: [
        {
          id: 'p1',
          data: () => ({
            name: 'Hevy → Strava',
            source: 'hevy',
            destinations: [3],
            enrichers: [{ provider_type: 12, typed_config: { units: 'metric' } }],
          }),
        },
      ],
    }));
    const pipelines = store.get(pipelinesAtom);
    expect(pipelines).toHaveLength(1);
    expect(pipelines[0]).toMatchObject({
      id: 'p1',
      name: 'Hevy → Strava',
      source: 'hevy',
      sources: ['hevy'],
      destinations: [3],
      enrichers: [{ providerType: 12, typedConfig: { units: 'metric' } }],
    });
  });
});

describe('useRealtimeIntegrations', () => {
  it('categorises fields, hides OAuth secrets and kebab-cases the registry id', () => {
    const { store, wrapper } = withStore();
    renderHook(() => useRealtimeIntegrations(), { wrapper });
    act(() => state.onNext?.({
      exists: () => true,
      data: () => ({
        integrations: {
          appleHealth: {
            connected: true,
            access_token: 'SECRET',         // hidden
            api_key: 'user-key',            // shown
            athlete_id: '12345',            // external id
            last_used_at: { seconds: 1_700_000_000 },
          },
        },
      }),
    }));
    const integrations = store.get(integrationsAtom)!;
    const apple = integrations['apple-health' as keyof typeof integrations]!;
    expect(apple.connected).toBe(true);
    expect(apple.externalUserId).toBe('12345');
    expect(apple.lastUsedAt).toBe(new Date(1_700_000_000 * 1000).toISOString());
    expect(apple.additionalDetails).toMatchObject({ 'Api Key': 'user-key' });
    expect(JSON.stringify(apple)).not.toContain('SECRET');
  });

  it('maps a missing user document to null', () => {
    const { store, wrapper } = withStore();
    renderHook(() => useRealtimeIntegrations(), { wrapper });
    act(() => state.onNext?.({ exists: () => false }));
    expect(store.get(integrationsAtom)).toBeNull();
  });
});

describe('useRealtimeStats', () => {
  it('updates the stats atom from the user document weeklySync count', () => {
    const { store, wrapper } = withStore();
    renderHook(() => useRealtimeStats(), { wrapper });
    act(() => state.onNext?.({ exists: () => true, data: () => ({ activityCounts: { weeklySync: 9 } }) }));
    expect(store.get(activityStatsAtom)).toEqual({ synchronizedCount: 9 });
  });

  it('is a no-op when disabled', () => {
    const { wrapper } = withStore();
    renderHook(() => useRealtimeStats(false), { wrapper });
    expect(state.onNext).toBeUndefined();
  });
});
