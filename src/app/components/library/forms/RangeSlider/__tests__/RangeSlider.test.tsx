import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RangeSlider } from '../index';

describe('RangeSlider', () => {
  it('renders a range input', () => {
    render(<RangeSlider value={5} onChange={vi.fn()} min={0} max={10} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<RangeSlider label="Volume" value={5} onChange={vi.fn()} />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('shows the value when showValue is set', () => {
    render(<RangeSlider showValue value={7} onChange={vi.fn()} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('formats the value with formatValue', () => {
    render(
      <RangeSlider
        showValue
        value={50}
        onChange={vi.fn()}
        formatValue={(v) => `${v}%`}
      />,
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('fires onChange when moved', () => {
    const onChange = vi.fn();
    render(<RangeSlider value={5} onChange={onChange} min={0} max={10} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } });
    expect(onChange).toHaveBeenCalled();
  });
});
