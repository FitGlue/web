import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../../shared/api/client', () => ({
  client: { GET: vi.fn().mockResolvedValue({ data: [] }) },
  default: { GET: vi.fn().mockResolvedValue({ data: [] }) },
}));

import { WorkoutEntryInput } from '../WorkoutEntryInput';

describe('WorkoutEntryInput', () => {
  it('renders the add-exercise affordance', () => {
    render(<WorkoutEntryInput value="" onChange={vi.fn()} />);
    expect(screen.getByText(/Add Exercise/)).toBeInTheDocument();
  });

  it('adds an exercise row and notifies the parent', () => {
    const onChange = vi.fn();
    render(<WorkoutEntryInput value="" onChange={onChange} />);
    fireEvent.click(screen.getByText(/Add Exercise/));
    expect(onChange).toHaveBeenCalled();
    // A new exercise input placeholder should now exist.
    expect(screen.getByPlaceholderText(/Exercise 1/)).toBeInTheDocument();
  });
});
