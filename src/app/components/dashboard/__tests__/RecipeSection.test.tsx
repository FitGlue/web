import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useSmartNudges = vi.fn();
vi.mock('../../../hooks/useSmartNudges', () => ({
  useSmartNudges: (p: unknown) => useSmartNudges(p),
}));

import { RecipeSection } from '../RecipeSection';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('RecipeSection', () => {
  it('renders nothing when there is no nudge', () => {
    useSmartNudges.mockReturnValue(null);
    const { container } = render(<RecipeSection />, { wrapper: Wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the recipe panel when a nudge is active', () => {
    useSmartNudges.mockReturnValue({
      icon: '💡',
      title: 'Grab a Recipe',
      description: 'One-click setups',
    });
    render(<RecipeSection />, { wrapper: Wrapper });
    expect(screen.getByText('Grab a Recipe')).toBeInTheDocument();
    expect(screen.getByText('BROWSE RECIPES →')).toBeInTheDocument();
  });
});
