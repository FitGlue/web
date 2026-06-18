import { describe, it, expect, vi, beforeEach } from 'vitest';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock, unmount: vi.fn() }));

vi.mock('react-dom/client', () => ({
  default: { createRoot: createRootMock },
  createRoot: createRootMock,
}));
vi.mock('../App', () => ({ default: () => null }));
vi.mock('../tokens.css', () => ({}));
vi.mock('../showcase.css', () => ({}));

describe('showcase main entry', () => {
  beforeEach(() => {
    vi.resetModules();
    renderMock.mockClear();
    createRootMock.mockClear();
    document.body.innerHTML = '<div id="showcase-root"></div>';
  });

  it('mounts the App into #showcase-root', async () => {
    await import('../main');
    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });
});
