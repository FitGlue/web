declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __fg?: { navigate: (path: string) => void; refreshAuth: (token: string) => void };
    __fitglueCustomToken?: string;
  }
}

export type NativeBridgeMessage =
  | { type: 'routeChange'; path: string }
  | { type: 'openShowcase'; url: string }
  | { type: 'ready' }
  | { type: 'authExpired' };

export const isNativeApp =
  typeof window !== 'undefined' && !!window.ReactNativeWebView;

export function sendToNative(message: NativeBridgeMessage): void {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
