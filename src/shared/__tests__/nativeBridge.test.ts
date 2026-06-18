import { describe, it, expect, vi, afterEach } from 'vitest';
import { sendToNative } from '../nativeBridge';

afterEach(() => {
  delete (window as { ReactNativeWebView?: unknown }).ReactNativeWebView;
  vi.restoreAllMocks();
});

describe('sendToNative', () => {
  it('posts a JSON-serialised message to the native bridge when present', () => {
    const postMessage = vi.fn();
    (window as { ReactNativeWebView?: unknown }).ReactNativeWebView = { postMessage };

    sendToNative({ type: 'routeChange', path: '/activities' });

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: 'routeChange', path: '/activities' }),
    );
  });

  it('does nothing (no throw) when the native bridge is absent', () => {
    expect(() => sendToNative({ type: 'ready' })).not.toThrow();
  });
});
