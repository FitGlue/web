import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const h = vi.hoisted(() => ({ status: 'connected' as string }));

vi.mock('../../../../../hooks/useFirestoreConnection', () => ({
  useFirestoreConnection: () => h.status,
}));

import { ConnectionBanner } from '../ConnectionBanner';

const SHOW_DELAY_MS = 700;
const CONNECTED_MS = 2000;

beforeEach(() => {
  vi.useFakeTimers();
  h.status = 'connected';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ConnectionBanner', () => {
  it('stays hidden on a healthy connection', () => {
    render(<ConnectionBanner />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('does not flash during a brief connecting blip', () => {
    h.status = 'connecting';
    render(<ConnectionBanner />);
    act(() => {
      vi.advanceTimersByTime(SHOW_DELAY_MS - 200);
    });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows Connecting after the debounce, then Connected, then hides', () => {
    h.status = 'connecting';
    const { rerender } = render(<ConnectionBanner />);

    act(() => {
      vi.advanceTimersByTime(SHOW_DELAY_MS);
    });
    expect(screen.getByText('Connecting…')).toBeInTheDocument();

    h.status = 'connected';
    rerender(<ConnectionBanner />);
    expect(screen.getByText('Connected')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(CONNECTED_MS);
    });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows an offline message after the debounce', () => {
    h.status = 'offline';
    render(<ConnectionBanner />);
    act(() => {
      vi.advanceTimersByTime(SHOW_DELAY_MS);
    });
    expect(screen.getByText("You're offline")).toBeInTheDocument();
  });

  it('never shows Connected if it was never showing a problem', () => {
    h.status = 'connected';
    const { rerender } = render(<ConnectionBanner />);
    // A connected → connected re-render should not produce a banner.
    rerender(<ConnectionBanner />);
    act(() => {
      vi.advanceTimersByTime(CONNECTED_MS);
    });
    expect(screen.queryByRole('status')).toBeNull();
  });
});
