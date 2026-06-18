import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from '../Grid';

describe('Grid', () => {
  it('renders children', () => {
    render(<Grid>cell</Grid>);
    expect(screen.getByText('cell')).toBeInTheDocument();
  });

  it('applies base, gap and responsive classes by default', () => {
    const { container } = render(<Grid>x</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('ui-grid');
    expect(el).toHaveClass('ui-grid--gap-md');
    expect(el).toHaveClass('ui-grid--responsive');
  });

  it('does not add a cols class in auto mode but sets min-col-width var', () => {
    const { container } = render(<Grid minColWidth="300px">x</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).not.toMatch(/ui-grid--cols-/);
    expect(el.style.getPropertyValue('--grid-min-col-width')).toBe('300px');
  });

  it('adds cols class for fixed column count', () => {
    const { container } = render(<Grid cols={3}>x</Grid>);
    expect(container.firstChild).toHaveClass('ui-grid--cols-3');
  });

  it('omits responsive class when responsive is false', () => {
    const { container } = render(<Grid responsive={false}>x</Grid>);
    expect(container.firstChild).not.toHaveClass('ui-grid--responsive');
  });
});
