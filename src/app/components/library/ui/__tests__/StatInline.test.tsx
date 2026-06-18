import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatInline } from '../StatInline';

describe('StatInline', () => {
  it('renders value and label', () => {
    render(<StatInline value={42} label="Synced" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('renders sub label', () => {
    render(<StatInline value={1} label="L" subLabel="This Month" />);
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  it('shows placeholder when loading', () => {
    render(<StatInline value={42} label="L" loading />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.queryByText('42')).toBeNull();
  });
});
