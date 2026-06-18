import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the service-worker event handlers registered at module load.
const handlers: Record<string, (event: unknown) => void> = {};
const showNotification = vi.fn();
const claim = vi.fn();
const skipWaiting = vi.fn();
const matchAll = vi.fn();
const openWindow = vi.fn();
const onBackgroundMessage = vi.fn();

const mockSelf = {
  addEventListener: (type: string, cb: (event: unknown) => void) => { handlers[type] = cb; },
  registration: { showNotification },
  clients: { claim, matchAll, openWindow },
  skipWaiting,
};

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/messaging/sw', () => ({
  getMessaging: vi.fn(() => ({})),
  onBackgroundMessage: (...a: unknown[]) => onBackgroundMessage(...a),
}));

const fetchMock = vi.fn();

async function loadSW() {
  vi.stubGlobal('self', mockSelf);
  vi.stubGlobal('fetch', fetchMock);
  vi.resetModules();
  await import('../firebase-messaging-sw');
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockResolvedValue({ json: async () => ({ apiKey: 'k', appId: 'a' }) });
});

describe('firebase-messaging-sw', () => {
  it('registers all lifecycle + push handlers on load', async () => {
    await loadSW();
    for (const evt of ['activate', 'message', 'notificationclick', 'push', 'install']) {
      expect(typeof handlers[evt]).toBe('function');
    }
  });

  it('install skips waiting', async () => {
    await loadSW();
    handlers.install({});
    expect(skipWaiting).toHaveBeenCalled();
  });

  it('activate claims clients and initializes messaging', async () => {
    await loadSW();
    const waits: Promise<unknown>[] = [];
    handlers.activate({ waitUntil: (p: Promise<unknown>) => waits.push(p) });
    await Promise.all(waits);
    expect(claim).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith('/__/firebase/init.json');
    expect(onBackgroundMessage).toHaveBeenCalled();
  });

  it('message INIT_MESSAGING triggers initialization', async () => {
    await loadSW();
    handlers.message({ data: { type: 'INIT_MESSAGING' } });
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('notificationclick deep-links to the activity and focuses an existing window', async () => {
    await loadSW();
    const focus = vi.fn();
    const navigate = vi.fn();
    matchAll.mockResolvedValue([{ url: 'https://x/app/', focus, navigate }]);
    const close = vi.fn();
    const waits: Promise<unknown>[] = [];
    handlers.notificationclick({
      notification: { data: { type: 'PENDING_INPUT', activity_id: 'act1' }, close },
      waitUntil: (p: Promise<unknown>) => waits.push(p),
    });
    expect(close).toHaveBeenCalled();
    await Promise.all(waits);
    expect(focus).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/app/activities/act1');
  });

  it('notificationclick opens a new window when none exist', async () => {
    await loadSW();
    matchAll.mockResolvedValue([]);
    const waits: Promise<unknown>[] = [];
    handlers.notificationclick({
      notification: { data: { type: 'PIPELINE_CANCELLED' }, close: vi.fn() },
      waitUntil: (p: Promise<unknown>) => waits.push(p),
    });
    await Promise.all(waits);
    expect(openWindow).toHaveBeenCalledWith('/app/activities');
  });

  it('push shows a notification from the payload', async () => {
    await loadSW();
    const waits: Promise<unknown>[] = [];
    handlers.push({
      data: { json: () => ({ notification: { title: 'Hi', body: 'there' }, data: { type: 'PENDING_INPUT' } }) },
      waitUntil: (p: Promise<unknown>) => waits.push(p),
    });
    expect(showNotification).toHaveBeenCalledWith('Hi', expect.objectContaining({
      body: 'there',
      requireInteraction: true,
    }));
    await Promise.all(waits);
  });

  it('push falls back to default title when payload is unparseable', async () => {
    await loadSW();
    handlers.push({
      data: { json: () => { throw new Error('bad'); } },
      waitUntil: () => {},
    });
    expect(showNotification).toHaveBeenCalledWith('FitGlue', expect.any(Object));
  });
});
