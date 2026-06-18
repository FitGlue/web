import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('renders title, value and label', () => {
    render(<StatCard title="Total" value={42} label="syncs" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('syncs')).toBeInTheDocument();
  });

  it('shows a loading placeholder when loading', () => {
    render(<StatCard title="Total" value={42} label="syncs" loading />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('acts as a button and fires onClick', () => {
    const onClick = vi.fn();
    render(<StatCard title="Total" value={1} label="x" onClick={onClick} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
