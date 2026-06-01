import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies fg-stamp base class', () => {
    render(<Badge>text</Badge>);
    expect(screen.getByText('text')).toHaveClass('fg-stamp');
  });

  it('applies variant class for success', () => {
    render(<Badge variant="success">ok</Badge>);
    expect(screen.getByText('ok')).toHaveClass('fg-stamp--green');
  });

  it('applies variant class for error', () => {
    render(<Badge variant="error">bad</Badge>);
    expect(screen.getByText('bad')).toHaveClass('fg-stamp--rose');
  });

  it('applies variant class for warning', () => {
    render(<Badge variant="warning">warn</Badge>);
    expect(screen.getByText('warn')).toHaveClass('fg-stamp--gold');
  });

  it('applies sm size class', () => {
    render(<Badge size="sm">small</Badge>);
    expect(screen.getByText('small')).toHaveClass('fg-stamp--sm');
  });

  it('does not apply size class for md', () => {
    render(<Badge size="md">medium</Badge>);
    expect(screen.getByText('medium')).not.toHaveClass('fg-stamp--sm');
  });

  it('renders an icon when provided', () => {
    render(<Badge icon="🔥">hot</Badge>);
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('applies additional className', () => {
    render(<Badge className="custom-class">thing</Badge>);
    expect(screen.getByText('thing')).toHaveClass('custom-class');
  });

  it('treats default variant as no extra class', () => {
    render(<Badge variant="default">base</Badge>);
    const el = screen.getByText('base');
    expect(el.className).toBe('fg-stamp');
  });
});
