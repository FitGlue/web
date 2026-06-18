import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../index';

describe('Textarea', () => {
  it('renders a textbox', () => {
    render(<Textarea aria-label="notes" />);
    expect(screen.getByRole('textbox', { name: 'notes' })).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Textarea aria-label="x" />);
    const ta = screen.getByRole('textbox');
    expect(ta).toHaveClass('form-textarea');
    expect(ta).toHaveClass('form-textarea--default');
    expect(ta).toHaveClass('form-textarea--full-width');
  });

  it('applies size, error and auto-resize classes', () => {
    render(<Textarea aria-label="x" size="large" error autoResize />);
    const ta = screen.getByRole('textbox');
    expect(ta).toHaveClass('form-textarea--large');
    expect(ta).toHaveClass('form-textarea--error');
    expect(ta).toHaveClass('form-textarea--auto-resize');
  });

  it('fires onChange when typing', async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="x" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hi');
    expect(onChange).toHaveBeenCalled();
  });
});
