import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Recipe } from '../../../data/recipes';

vi.mock('../../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({
    sources: [{ id: 'hevy', name: 'Hevy', icon: '🏋️' }],
    enrichers: [{ id: 'weather', name: 'Weather', icon: '🌤️', enricherProviderType: 12 }],
    destinations: [{ id: 'strava', name: 'Strava', icon: '🟧' }],
    integrations: [{ id: 'strava', name: 'Strava', icon: '🟧' }],
  }),
}));

import { RecipeCard } from '../RecipeCard';

const recipe: Recipe = {
  id: 'r1',
  title: 'Strength to Strava',
  tagline: 'Push your lifts everywhere',
  icon: '🔥',
  category: 'strength' as Recipe['category'],
  recommendedSource: 'hevy',
  sourceNote: 'or any source',
  destinations: ['strava'],
  enricherProviderTypes: [12],
  importCode: 'CODE123',
  requiredConnections: ['strava'],
} as Recipe;

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('RecipeCard', () => {
  it('renders the recipe title, tagline and resolved plugins', () => {
    render(<RecipeCard recipe={recipe} integrations={{ strava: { connected: true } } as never} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText('Strength to Strava')).toBeInTheDocument();
    expect(screen.getByText('Push your lifts everywhere')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
  });

  it('offers the recipe when all required connections are ready', () => {
    render(<RecipeCard recipe={recipe} integrations={{ strava: { connected: true } } as never} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText('USE THIS RECIPE')).toBeInTheDocument();
  });

  it('prompts to connect missing integrations when not ready', () => {
    render(<RecipeCard recipe={recipe} integrations={null} />, { wrapper: Wrapper });
    expect(screen.getByText(/CONNECT Strava FIRST/)).toBeInTheDocument();
  });
});
