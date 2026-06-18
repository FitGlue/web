import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionExpiredModal from '../ConnectionExpiredModal';

describe('ConnectionExpiredModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    integrationName: 'Strava',
    integrationIcon: '🟧',
    queuedCount: 3,
    onReconnect: vi.fn(),
  };

  it('renders the expiry title and queued count', () => {
    render(<ConnectionExpiredModal {...baseProps} />);
    expect(screen.getByText(/Strava token expired/)).toBeInTheDocument();
    expect(screen.getByText(/3 activities waiting to sync/)).toBeInTheDocument();
  });

  it('uses the singular form for a single queued activity', () => {
    render(<ConnectionExpiredModal {...baseProps} queuedCount={1} />);
    expect(screen.getByText(/1 activity waiting to sync/)).toBeInTheDocument();
  });

  it('fires the reconnect and dismiss callbacks', () => {
    const onReconnect = vi.fn();
    const onClose = vi.fn();
    render(<ConnectionExpiredModal {...baseProps} onReconnect={onReconnect} onClose={onClose} />);
    fireEvent.click(screen.getByText(/RECONNECT STRAVA/));
    expect(onReconnect).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('DISMISS'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
