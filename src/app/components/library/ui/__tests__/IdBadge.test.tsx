import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IdBadge } from '../IdBadge';

describe('IdBadge', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('truncates the id', () => {
    render(<IdBadge id="abcdefghijklmnop" showChars={4} />);
    expect(screen.getByText('abcd...')).toBeInTheDocument();
  });

  it('strips the prefix before truncating', () => {
    render(<IdBadge id="pipe_123456789" stripPrefix="pipe_" showChars={3} />);
    expect(screen.getByText('123...')).toBeInTheDocument();
  });

  it('copies full id when copyable and clicked', async () => {
    render(<IdBadge id="full-id-value" copyable showChars={4} />);
    await userEvent.click(screen.getByText('full...'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('full-id-value');
  });
});
