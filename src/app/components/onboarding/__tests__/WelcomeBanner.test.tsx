import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/usePWAInstall', () => ({
  usePWAInstall: () => ({ canInstall: false, promptInstall: vi.fn() }),
}));

import { WelcomeBanner } from '../WelcomeBanner';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('WelcomeBanner', () => {
  it('renders the welcome heading and the three default steps', () => {
    render(<WelcomeBanner />, { wrapper: Wrapper });
    expect(screen.getByText('Welcome to FitGlue!')).toBeInTheDocument();
    expect(screen.getByText(/3 easy steps/)).toBeInTheDocument();
    expect(screen.getByText('Add some Connections')).toBeInTheDocument();
  });

  it('adds a showcase step for athletes', () => {
    render(<WelcomeBanner isAthlete />, { wrapper: Wrapper });
    expect(screen.getByText(/4 easy steps/)).toBeInTheDocument();
    expect(screen.getByText('Set up your Showcase')).toBeInTheDocument();
  });

  it('fires onDismiss and onStartTour callbacks', () => {
    const onDismiss = vi.fn();
    const onStartTour = vi.fn();
    render(<WelcomeBanner onDismiss={onDismiss} onStartTour={onStartTour} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText(/Take a Tour/));
    expect(onStartTour).toHaveBeenCalledTimes(1);
  });
});
