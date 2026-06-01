import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pill } from '../Pill';

describe('Pill', () => {
  it('renders children', () => {
    render(<Pill>label</Pill>);
    expect(screen.getByText('label')).toBeInTheDocument();
  });

  it('applies fg-stamp base class', () => {
    render(<Pill>x</Pill>);
    expect(screen.getByText('x')).toHaveClass('fg-stamp');
  });

  it('applies success variant class', () => {
    render(<Pill variant="success">ok</Pill>);
    expect(screen.getByText('ok')).toHaveClass('fg-stamp--green');
  });

  it('applies error variant class', () => {
    render(<Pill variant="error">err</Pill>);
    expect(screen.getByText('err')).toHaveClass('fg-stamp--rose');
  });

  it('applies muted variant class', () => {
    render(<Pill variant="muted">muted</Pill>);
    expect(screen.getByText('muted')).toHaveClass('fg-stamp--ink');
  });

  it('adds active class when active is true', () => {
    render(<Pill active>active</Pill>);
    expect(screen.getByText('active')).toHaveClass('fg-stamp--cyan');
  });

  it('active overrides variant class', () => {
    render(<Pill variant="error" active>active-err</Pill>);
    expect(screen.getByText('active-err')).toHaveClass('fg-stamp--cyan');
  });

  it('renders icon when provided', () => {
    render(<Pill icon="⚡">fast</Pill>);
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('has role=button and is clickable when onClick provided', async () => {
    const handler = vi.fn();
    render(<Pill onClick={handler}>click me</Pill>);
    const pill = screen.getByRole('button', { name: /click me/ });
    await userEvent.click(pill);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('has no role when onClick not provided', () => {
    render(<Pill>static</Pill>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
