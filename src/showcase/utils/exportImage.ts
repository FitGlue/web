import { isNativeApp, sendToNative } from '../../shared/nativeBridge';

/**
 * Downloads a PNG data URL.
 *
 * In the native app WebView, `<a download>` is silently ignored and the Web
 * Share API is not exposed, so neither in-page strategy works. Instead we hand
 * the bytes to the native shell via the bridge — it writes a temp file and
 * opens the OS share sheet ("Save to Photos", send to apps, etc.). In a real
 * browser we fall back to a standard `<a download>`.
 */
export async function saveImage(dataUrl: string, filename: string): Promise<void> {
  if (isNativeApp) {
    sendToNative({ type: 'saveImage', dataUrl, filename });
    return;
  }
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
