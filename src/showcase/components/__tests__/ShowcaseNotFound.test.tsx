import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShowcaseNotFound from '../ShowcaseNotFound';

describe('ShowcaseNotFound', () => {
  it('renders the profile copy', () => {
    render(<ShowcaseNotFound type="profile" />);
    expect(screen.getByText('No showcase here.')).toBeInTheDocument();
    expect(screen.getByText(/PROFILE NOT FOUND/)).toBeInTheDocument();
  });

  it('renders the activity copy', () => {
    render(<ShowcaseNotFound type="activity" />);
    expect(screen.getByText('Gone dark.')).toBeInTheDocument();
    expect(screen.getByText(/ACTIVITY NOT FOUND/)).toBeInTheDocument();
  });

  it('renders the page copy', () => {
    render(<ShowcaseNotFound type="page" />);
    expect(screen.getByText('Lost the thread.')).toBeInTheDocument();
    expect(screen.getByText(/PAGE NOT FOUND/)).toBeInTheDocument();
  });
});
