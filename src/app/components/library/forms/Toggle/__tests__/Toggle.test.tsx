import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../index';

describe('Toggle', () => {
  it('renders label', () => {
    render(<Toggle label="Notifications" checked={false} onChange={vi.fn()} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Toggle
        label="Notifications"
        description="email alerts"
        checked={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('email alerts')).toBeInTheDocument();
  });

  it('reflects the checked state', () => {
    render(<Toggle label="x" checked onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('fires onChange when clicked', async () => {
    const onChange = vi.fn();
    render(<Toggle label="x" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop set', () => {
    render(<Toggle label="x" checked={false} onChange={vi.fn()} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
