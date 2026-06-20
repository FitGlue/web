import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useFirestoreConnection,
  reportFirestoreListenerAdded,
  reportFirestoreSnapshot,
  reportFirestoreError,
  reportFirestoreListenerRemoved,
  __resetFirestoreConnection,
} from '../useFirestoreConnection';

beforeEach(() => {
  __resetFirestoreConnection();
});

describe('useFirestoreConnection', () => {
  it('starts connected when there are no listeners', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    expect(result.current).toBe('connected');
  });

  it('reports connecting while a listener awaits its first snapshot', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    act(() => reportFirestoreListenerAdded('k1'));
    expect(result.current).toBe('connecting');
  });

  it('stays connecting while only a cached snapshot has arrived', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    act(() => reportFirestoreListenerAdded('k1'));
    act(() => reportFirestoreSnapshot('k1', true));
    expect(result.current).toBe('connecting');
  });

  it('becomes connected once a server snapshot arrives', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    act(() => reportFirestoreListenerAdded('k1'));
    act(() => reportFirestoreSnapshot('k1', false));
    expect(result.current).toBe('connected');
  });

  it('treats a listener error as connected (query-specific, not connectivity)', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    act(() => reportFirestoreListenerAdded('k1'));
    act(() => reportFirestoreError('k1'));
    expect(result.current).toBe('connected');
  });

  it('is connecting if any listener is still cached, even when another is synced', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    act(() => {
      reportFirestoreSnapshot('k1', false);
      reportFirestoreSnapshot('k2', true);
    });
    expect(result.current).toBe('connecting');
  });

  it('returns to connected after a still-cached listener is removed', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    act(() => {
      reportFirestoreSnapshot('k1', false);
      reportFirestoreSnapshot('k2', true);
    });
    expect(result.current).toBe('connecting');
    act(() => reportFirestoreListenerRemoved('k2'));
    expect(result.current).toBe('connected');
  });

  it('reports offline when the browser goes offline and recovers when back', () => {
    const { result } = renderHook(() => useFirestoreConnection());
    act(() => reportFirestoreSnapshot('k1', false));
    expect(result.current).toBe('connected');

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe('offline');

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe('connected');
  });
});
