import { isNativeApp } from '../../shared/nativeBridge';

/**
 * Downloads a PNG data URL. In the native app WebView, `<a download>` is
 * silently ignored, so we use the Web Share API instead — iOS/Android show
 * a native share sheet with "Save to Photos" as an option.
 */
export async function saveImage(dataUrl: string, filename: string): Promise<void> {
  if (isNativeApp && typeof navigator.canShare === 'function') {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return;
      }
    } catch {
      // fall through to link download
    }
  }
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
