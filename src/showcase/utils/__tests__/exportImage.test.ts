import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mutable mock of the native bridge so we can flip in/out of "native app" mode.
const sendToNative = vi.fn();
const bridge = { isNativeApp: false };

vi.mock('../../../shared/nativeBridge', () => ({
  get isNativeApp() {
    return bridge.isNativeApp;
  },
  sendToNative: (msg: unknown) => sendToNative(msg),
}));

import { saveImage } from '../exportImage';

const DATA_URL = 'data:image/png;base64,AAAA';

describe('saveImage', () => {
  beforeEach(() => {
    bridge.isNativeApp = false;
    sendToNative.mockClear();
  });

  it('bridges the bytes to native in the app (no <a download>)', async () => {
    bridge.isNativeApp = true;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    await saveImage(DATA_URL, 'route-fitglue.png');

    expect(sendToNative).toHaveBeenCalledWith({
      type: 'saveImage',
      dataUrl: DATA_URL,
      filename: 'route-fitglue.png',
    });
    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('triggers an <a download> in a real browser', async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    await saveImage(DATA_URL, 'route-fitglue.png');

    expect(sendToNative).not.toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });
});
