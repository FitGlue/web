import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePluginDefaults } from '../usePluginDefaults';

// Mock the API client before importing the hook
vi.mock('../../../shared/api/client', () => ({
  client: {
    GET: vi.fn(),
    PUT: vi.fn(),
    DELETE: vi.fn(),
  },
}));

import { client } from '../../../shared/api/client';

const mockGet = client.GET as ReturnType<typeof vi.fn>;
const mockPut = client.PUT as ReturnType<typeof vi.fn>;
const mockDelete = client.DELETE as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePluginDefaults', () => {
  it('fetches defaults on mount and normalises the map response', async () => {
    mockGet.mockResolvedValue({
      data: {
        defaults: {
          strava: { field_a: 'value_a' },
          hevy: { field_b: 'value_b' },
        },
      },
    });

    const { result } = renderHook(() => usePluginDefaults());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.defaults).toEqual([
      { pluginId: 'strava', config: { field_a: 'value_a' } },
      { pluginId: 'hevy', config: { field_b: 'value_b' } },
    ]);
    expect(result.current.error).toBeNull();
  });

  it('handles empty defaults map', async () => {
    mockGet.mockResolvedValue({ data: { defaults: {} } });

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.defaults).toEqual([]);
  });

  it('handles missing defaults key in response', async () => {
    mockGet.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.defaults).toEqual([]);
  });

  it('sets error state on fetch failure', async () => {
    mockGet.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load plugin defaults');
    expect(result.current.defaults).toEqual([]);
  });

  it('getDefault returns config for matching pluginId', async () => {
    mockGet.mockResolvedValue({
      data: { defaults: { strava: { key: 'val' } } },
    });

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getDefault('strava')).toEqual({ key: 'val' });
    expect(result.current.getDefault('hevy')).toBeUndefined();
  });

  it('setDefault calls PUT and refreshes', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { defaults: {} } })
      .mockResolvedValueOnce({ data: { defaults: { strava: { foo: 'bar' } } } });
    mockPut.mockResolvedValue({});

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.setDefault('strava', { foo: 'bar' });
    });

    expect(mockPut).toHaveBeenCalledWith('/users/me/plugin-defaults/{pluginId}', expect.objectContaining({
      params: { path: { pluginId: 'strava' } },
    }));
    expect(result.current.defaults).toEqual([{ pluginId: 'strava', config: { foo: 'bar' } }]);
  });

  it('setDefault throws on PUT failure', async () => {
    mockGet.mockResolvedValue({ data: { defaults: {} } });
    mockPut.mockRejectedValue(new Error('server error'));

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.setDefault('strava', {})).rejects.toThrow('server error');
  });

  it('deleteDefault calls DELETE and refreshes', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { defaults: { strava: { key: 'val' } } } })
      .mockResolvedValueOnce({ data: { defaults: {} } });
    mockDelete.mockResolvedValue({});

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteDefault('strava');
    });

    expect(mockDelete).toHaveBeenCalledWith('/users/me/plugin-defaults/{pluginId}', expect.objectContaining({
      params: { path: { pluginId: 'strava' } },
    }));
    expect(result.current.defaults).toEqual([]);
  });

  it('refresh re-fetches defaults', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { defaults: {} } })
      .mockResolvedValueOnce({ data: { defaults: { polar: { x: '1' } } } });

    const { result } = renderHook(() => usePluginDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.defaults).toEqual([{ pluginId: 'polar', config: { x: '1' } }]);
  });
});
