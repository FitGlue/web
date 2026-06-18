import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../index';

describe('Checkbox', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders label and description', () => {
    render(<Checkbox label="Accept" description="terms apply" />);
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('terms apply')).toBeInTheDocument();
  });

  it('applies size and error modifier classes', () => {
    const { container } = render(<Checkbox size="large" error />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('form-checkbox-wrapper--large');
    expect(wrapper).toHaveClass('form-checkbox-wrapper--error');
  });

  it('fires onChange when toggled', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('respects the checked prop', () => {
    render(<Checkbox checked readOnly />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
