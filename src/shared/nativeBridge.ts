declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __fg?: { navigate: (path: string) => void; refreshAuth: (token: string) => void };
    __fitglueCustomToken?: string;
    __fg_inapp?: boolean;
  }
}

export type NativeBridgeMessage =
  | { type: 'routeChange'; path: string }
  | { type: 'openShowcase'; url: string }
  | { type: 'ready' }
  | { type: 'authExpired' };

export const isNativeApp =
  typeof window !== 'undefined' && !!window.ReactNativeWebView;

// True when rendered inside the native showcase modal WebView.
// Set by injectedJavaScriptBeforeContentLoaded in ShowcaseModalScreen.
export const isNativeShowcase =
  typeof window !== 'undefined' && !!window.__fg_inapp;

export function sendToNative(message: NativeBridgeMessage): void {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
