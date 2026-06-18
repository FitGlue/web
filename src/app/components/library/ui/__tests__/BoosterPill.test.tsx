import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoosterPill } from '../BoosterPill';

describe('BoosterPill', () => {
  it('renders order, icon and name', () => {
    render(<BoosterPill order={2} icon="⚡" name="Weather" />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
  });

  it('shows checkmark when configured', () => {
    render(<BoosterPill order={1} icon="x" name="n" isConfigured />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('has button role and fires onClick when clickable', async () => {
    const handler = vi.fn();
    render(<BoosterPill order={1} icon="x" name="n" onClick={handler} />);
    const el = screen.getByRole('button');
    await userEvent.click(el);
    expect(handler).toHaveBeenCalledOnce();
  });
});
