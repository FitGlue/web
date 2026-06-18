import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldRow } from '../FieldRow';

describe('FieldRow', () => {
  it('renders label and children value', () => {
    render(<FieldRow label="Name">Alice</FieldRow>);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <FieldRow label="Name" action={<button>Edit</button>}>Alice</FieldRow>,
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('applies default size and direction classes', () => {
    const { container } = render(<FieldRow label="l">v</FieldRow>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('field-row--md');
    expect(el).toHaveClass('field-row--vertical');
  });

  it('applies custom size and direction', () => {
    const { container } = render(
      <FieldRow label="l" size="lg" direction="horizontal">v</FieldRow>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('field-row--lg');
    expect(el).toHaveClass('field-row--horizontal');
  });
});
