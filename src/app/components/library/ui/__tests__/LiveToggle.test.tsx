import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiveToggle } from '../LiveToggle';

describe('LiveToggle', () => {
  it('renders default label', () => {
    render(<LiveToggle isEnabled isListening onToggle={() => {}} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('applies active class when listening', () => {
    render(<LiveToggle isEnabled isListening onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('live-toggle--active');
  });

  it('fires onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<LiveToggle isEnabled={false} isListening={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
