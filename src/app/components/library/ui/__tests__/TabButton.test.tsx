import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabButton } from '../TabButton';

describe('TabButton', () => {
  it('renders the label', () => {
    render(<TabButton label="Overview" active={false} onClick={() => {}} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('applies active class', () => {
    render(<TabButton label="X" active onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('tab-button--active');
  });

  it('renders count badge', () => {
    render(<TabButton label="X" active={false} onClick={() => {}} count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('fires onClick', async () => {
    const handler = vi.fn();
    render(<TabButton label="X" active={false} onClick={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
