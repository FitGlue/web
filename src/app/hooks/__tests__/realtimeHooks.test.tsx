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
  where: () => ({}),
  orderBy: () => ({}),
  limit: () => ({}),
}));
vi.mock('../../../shared/firebase', () => ({
  getFirebaseFirestore: () => state.firestore,
  getFirebaseAuth: () => state.auth,
}));
vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { useRealtimePipelines } from '../useRealtimePipelines';
import { useRealtimeIntegrations } from '../useRealtimeIntegrations';
import { useRealtimeStats } from '../useRealtimeStats';
import { useRealtimeInputs } from '../useRealtimeInputs';
import { useRealtimePipelineRuns } from '../useRealtimePipelineRuns';
import { pipelinesAtom } from '../../state/pipelinesState';
import { integrationsAtom } from '../../state/integrationsState';
import { activityStatsAtom, pipelineRunsAtom } from '../../state/activitiesState';
import { pendingInputsAtom } from '../../state/inputsState';

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

describe('useRealtimeInputs', () => {
  it('maps pending-input docs and parses display config from provider metadata', () => {
    const { store, wrapper } = withStore();
    renderHook(() => useRealtimeInputs(), { wrapper });
    act(() => state.onNext?.({
      docs: [
        {
          id: 'in1',
          data: () => ({
            activity_id: 'act-1',
            user_id: 'u1',
            status: 1,
            required_fields: ['weight'],
            provider_metadata: {
              'display.title': 'Add your weight',
              'display.field_labels': '{"weight":"Body weight"}',
            },
            created_at: '2026-05-01T00:00:00Z',
          }),
        },
      ],
    }));
    const inputs = store.get(pendingInputsAtom);
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toMatchObject({ id: 'in1', activityId: 'act-1', requiredFields: ['weight'] });
    expect(inputs[0].displayConfig).toMatchObject({
      title: 'Add your weight',
      fieldLabels: { weight: 'Body weight' },
    });
    expect(inputs[0].createdAt).toBeInstanceOf(Date);
  });
});

describe('useRealtimePipelineRuns', () => {
  it('maps pipeline-run docs including boosters, destinations and steps', () => {
    const { store, wrapper } = withStore();
    renderHook(() => useRealtimePipelineRuns(), { wrapper });
    act(() => state.onNext?.({
      docs: [
        {
          id: 'run1',
          data: () => ({
            pipeline_id: 'p1',
            activity_id: 'a1',
            source: 'hevy',
            status: 2,
            boosters: [{ provider_name: 'weather', status: 'ok', duration_ms: 120 }],
            destinations: [{ Destination: 3, Status: 1, ExternalId: 'ext-9' }],
            steps: [{ id: 's1', ordinal: 0, display_name: 'Fetch', offset_ms: 0, duration_ms: 50 }],
            created_at: '2026-05-01T00:00:00Z',
          }),
        },
      ],
    }));
    const runs = store.get(pipelineRunsAtom);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({ id: 'run1', pipelineId: 'p1', source: 'hevy' });
    expect(runs[0].boosters[0]).toMatchObject({ providerName: 'weather', durationMs: 120 });
    expect(runs[0].destinations[0]).toMatchObject({ destination: 3, externalId: 'ext-9' });
    expect(runs[0].steps[0]).toMatchObject({ id: 's1', displayName: 'Fetch', durationMs: 50 });
  });
});
