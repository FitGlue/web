import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from '../index';

describe('Link', () => {
  it('renders children and href', () => {
    render(<Link href="/foo">Go</Link>);
    const a = screen.getByRole('link', { name: 'Go' });
    expect(a).toHaveAttribute('href', '/foo');
  });

  it('applies the base link class', () => {
    render(<Link href="/foo">Go</Link>);
    expect(screen.getByRole('link')).toHaveClass('link');
  });

  it('merges an extra className', () => {
    render(<Link href="/foo" className="extra">Go</Link>);
    const a = screen.getByRole('link');
    expect(a).toHaveClass('link');
    expect(a).toHaveClass('extra');
  });

  it('adds target and rel for external links', () => {
    render(<Link href="https://x.com" external>Out</Link>);
    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not set target for internal links', () => {
    render(<Link href="/foo">Internal</Link>);
    expect(screen.getByRole('link')).not.toHaveAttribute('target');
  });
});
