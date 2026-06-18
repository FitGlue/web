import { describe, it, expect, vi, beforeEach } from 'vitest';

const { renderSpy, createRootSpy } = vi.hoisted(() => {
  const renderSpy = vi.fn();
  return { renderSpy, createRootSpy: vi.fn(() => ({ render: renderSpy, unmount: vi.fn() })) };
});

vi.mock('react-dom/client', () => ({ default: { createRoot: createRootSpy }, createRoot: createRootSpy }));
vi.mock('../App', () => ({ default: () => null }));
vi.mock('../styles/base.css', () => ({}));
vi.mock('../styles/app-components.css', () => ({}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  document.body.innerHTML = '<div id="root"></div>';
});

describe('main entry point', () => {
  it('mounts the React app onto #root', async () => {
    await import('../main');
    expect(createRootSpy).toHaveBeenCalledTimes(1);
    expect(createRootSpy).toHaveBeenCalledWith(document.getElementById('root'));
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
