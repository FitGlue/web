import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../Form';

describe('Form', () => {
  it('renders children', () => {
    render(
      <Form onSubmit={vi.fn()}>
        <input aria-label="name" />
      </Form>,
    );
    expect(screen.getByLabelText('name')).toBeInTheDocument();
  });

  it('applies base and spacing classes', () => {
    const { container } = render(<Form onSubmit={vi.fn()}>x</Form>);
    const form = container.querySelector('form') as HTMLElement;
    expect(form).toHaveClass('ui-form');
    expect(form).toHaveClass('ui-form--spacing-md');
  });

  it('applies loading class when loading', () => {
    const { container } = render(
      <Form onSubmit={vi.fn()} loading>x</Form>,
    );
    expect(container.querySelector('form')).toHaveClass('ui-form--loading');
  });

  it('renders error message', () => {
    render(<Form onSubmit={vi.fn()} error="Something broke">x</Form>);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('calls onSubmit when submitted', async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <button type="submit">Save</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('does not call onSubmit while loading', async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit} loading>
        <button type="submit">Save</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
