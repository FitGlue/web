import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppLoadingScreen } from '../AppLoadingScreen';

describe('AppLoadingScreen', () => {
  it('renders branded logo', () => {
    render(<AppLoadingScreen />);
    expect(screen.getByText('Fit')).toBeInTheDocument();
    expect(screen.getByText('Glue')).toBeInTheDocument();
  });

  it('shows a static message when provided', () => {
    render(<AppLoadingScreen staticMessage="Hold tight" />);
    expect(screen.getByText('Hold tight')).toBeInTheDocument();
  });

  it('renders the loading container', () => {
    const { container } = render(<AppLoadingScreen />);
    expect(container.querySelector('.app-loading-screen')).not.toBeNull();
  });
});
