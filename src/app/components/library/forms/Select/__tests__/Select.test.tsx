import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../index';

const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
];

describe('Select', () => {
  it('renders a combobox with options', () => {
    render(<Select options={options} value="a" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(
      <Select options={options} placeholder="Choose…" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByRole('option', { name: 'Choose…' })).toBeInTheDocument();
  });

  it('applies size and error modifier classes', () => {
    render(
      <Select options={options} size="large" error value="a" onChange={vi.fn()} />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('form-select--large');
    expect(select).toHaveClass('form-select--error');
  });

  it('fires onChange on selection', async () => {
    const onChange = vi.fn();
    render(<Select options={options} value="a" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).toHaveBeenCalled();
  });
});
