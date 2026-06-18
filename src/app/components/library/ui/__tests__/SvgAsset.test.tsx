import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

describe('SvgAsset', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a loading placeholder initially', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    const { SvgAsset } = await import('../SvgAsset');
    render(<SvgAsset url="/icon.svg" alt="My icon" />);
    expect(screen.getByLabelText('Loading My icon')).toBeInTheDocument();
  });

  it('renders fetched svg content once loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="1" cy="1" r="1" /></svg>'),
      } as Response)
    ));
    const { SvgAsset } = await import('../SvgAsset');
    const { container } = render(<SvgAsset url="/icon.svg" alt="Icon" />);
    await waitFor(() => {
      expect(container.querySelector('svg')).not.toBeNull();
    });
    expect(container.querySelector('circle')).not.toBeNull();
  });
});
