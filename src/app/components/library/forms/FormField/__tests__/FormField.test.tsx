import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../index';

describe('FormField', () => {
  it('renders children', () => {
    render(
      <FormField>
        <input aria-label="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('email')).toBeInTheDocument();
  });

  it('renders label and required marker', () => {
    render(<FormField label="Email" required>x</FormField>);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders hint when no error', () => {
    render(<FormField hint="optional">x</FormField>);
    expect(screen.getByText('optional')).toBeInTheDocument();
  });

  it('renders error and hides hint when error present', () => {
    render(<FormField hint="optional" error="Required field">x</FormField>);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.queryByText('optional')).not.toBeInTheDocument();
  });

  it('applies error modifier class', () => {
    const { container } = render(<FormField error="bad">x</FormField>);
    expect(container.firstChild).toHaveClass('form-field--error');
  });

  it('associates label with htmlFor', () => {
    render(
      <FormField label="Name" htmlFor="name-input">
        <input id="name-input" />
      </FormField>,
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name-input');
  });
});
