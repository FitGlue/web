import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../shared/api/client', () => ({
  client: { GET: vi.fn().mockResolvedValue({ data: [] }) },
  default: { GET: vi.fn().mockResolvedValue({ data: [] }) },
}));

import { KeyValueMapEditor } from '../KeyValueMapEditor';

describe('KeyValueMapEditor', () => {
  it('renders existing entries from the serialised value', () => {
    render(<KeyValueMapEditor value={JSON.stringify({ foo: 'bar' })} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('foo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bar')).toBeInTheDocument();
  });

  it('serialises edits back through onChange', () => {
    const onChange = vi.fn();
    render(<KeyValueMapEditor value={JSON.stringify({ foo: 'bar' })} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('bar'), { target: { value: 'baz' } });
    expect(onChange).toHaveBeenLastCalledWith(JSON.stringify({ foo: 'baz' }));
  });

  it('adds a new rule row', () => {
    render(<KeyValueMapEditor value={JSON.stringify({ foo: 'bar' })} onChange={vi.fn()} />);
    expect(screen.getByText('+ Add Rule')).toBeInTheDocument();
    fireEvent.click(screen.getByText('+ Add Rule'));
    // One existing key + one new empty key input
    const keyInputs = screen.getAllByPlaceholderText('Key');
    expect(keyInputs.length).toBe(2);
  });
});
