import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TourTarget } from '../TourTarget';

describe('TourTarget', () => {
  it('renders children inside a data-tour wrapper', () => {
    const { container } = render(
      <TourTarget id="step-one" className="x">
        <span>inside</span>
      </TourTarget>
    );
    expect(screen.getByText('inside')).toBeInTheDocument();
    const wrapper = container.querySelector('[data-tour="step-one"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('x');
  });
});
