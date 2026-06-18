import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar, FilterField } from '../FilterBar';

describe('FilterBar', () => {
  it('renders children fields', () => {
    render(<FilterBar>filters</FilterBar>);
    expect(screen.getByText('filters')).toBeInTheDocument();
  });

  it('renders apply and reset buttons and fires handlers', async () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    render(<FilterBar onApply={onApply} onReset={onReset}>x</FilterBar>);
    await userEvent.click(screen.getByText('Apply'));
    await userEvent.click(screen.getByText('Reset'));
    expect(onApply).toHaveBeenCalledOnce();
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('applies inline modifier class', () => {
    const { container } = render(<FilterBar inline>x</FilterBar>);
    expect(container.querySelector('.ui-filter-bar--inline')).not.toBeNull();
  });
});

describe('FilterField', () => {
  it('renders label and children', () => {
    render(<FilterField label="Status"><input /></FilterField>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
