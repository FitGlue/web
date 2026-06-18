import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowArrow } from '../FlowArrow';

describe('FlowArrow', () => {
  it('renders right arrow by default', () => {
    render(<FlowArrow />);
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('renders down arrow', () => {
    render(<FlowArrow direction="down" />);
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<FlowArrow label="then" />);
    expect(screen.getByText('then')).toBeInTheDocument();
  });

  it('applies direction and size classes', () => {
    const { container } = render(<FlowArrow direction="down" size="small" />);
    expect(container.querySelector('.flow-arrow--down')).not.toBeNull();
    expect(container.querySelector('.flow-arrow--small')).not.toBeNull();
  });
});
