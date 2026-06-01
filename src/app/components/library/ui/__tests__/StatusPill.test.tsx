import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '../StatusPill';

describe('StatusPill', () => {
  it('renders normalised status text', () => {
    render(<StatusPill status="COMPLETED" />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('strips STATUS_ prefix before normalising', () => {
    render(<StatusPill status="STATUS_RUNNING" />);
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });

  it('uppercases the status text', () => {
    render(<StatusPill status="success" />);
    expect(screen.getByText('SUCCESS')).toBeInTheDocument();
  });

  const okStatuses = ['OK', 'PASS', 'SUCCESS', 'COMPLETED', 'SYNCED'];
  for (const s of okStatuses) {
    it(`applies ok class for ${s}`, () => {
      render(<StatusPill status={s} />);
      expect(screen.getByText(s)).toHaveClass('fg-status--ok');
    });
  }

  const failedStatuses = ['FAILED', 'ERROR', 'FAILED_STRAVA_PROCESSING'];
  for (const s of failedStatuses) {
    it(`applies failed class for ${s}`, () => {
      render(<StatusPill status={s} />);
      expect(screen.getByText(s)).toHaveClass('fg-status--failed');
    });
  }

  const runningStatuses = ['RUNNING', 'STARTED'];
  for (const s of runningStatuses) {
    it(`applies running class for ${s}`, () => {
      render(<StatusPill status={s} />);
      expect(screen.getByText(s)).toHaveClass('fg-status--running');
    });
  }

  it('applies skipped class for SKIPPED', () => {
    render(<StatusPill status="SKIPPED" />);
    expect(screen.getByText('SKIPPED')).toHaveClass('fg-status--skipped');
  });

  const queuedStatuses = ['QUEUED', 'PENDING', 'WAITING', 'LAGGED', 'LAGGED_RETRY', 'STALLED', 'AWAITING_INPUT'];
  for (const s of queuedStatuses) {
    it(`applies queued class for ${s}`, () => {
      render(<StatusPill status={s} />);
      expect(screen.getByText(s)).toHaveClass('fg-status--queued');
    });
  }

  it('applies retried class for RETRIED', () => {
    render(<StatusPill status="RETRIED" />);
    expect(screen.getByText('RETRIED')).toHaveClass('fg-status--retried');
  });

  it('applies skipped class for unknown status (default fallback)', () => {
    render(<StatusPill status="TOTALLY_UNKNOWN" />);
    expect(screen.getByText('TOTALLY_UNKNOWN')).toHaveClass('fg-status--skipped');
  });
});
