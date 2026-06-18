import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useSmartNudges = vi.fn();
vi.mock('../../hooks/useSmartNudges', () => ({
  useSmartNudges: (page: unknown) => useSmartNudges(page),
}));

import { SmartNudge } from '../SmartNudge';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('SmartNudge', () => {
  it('renders nothing when there is no active nudge', () => {
    useSmartNudges.mockReturnValue(null);
    const { container } = render(<SmartNudge page="dashboard" />, { wrapper: Wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the active nudge banner with title, description and cta', () => {
    useSmartNudges.mockReturnValue({
      id: 'n1',
      icon: '🔌',
      title: 'Connect Your First App',
      description: 'Link your apps',
      cta: 'Set Up',
      route: '/connections',
      dismiss: vi.fn(),
    });
    render(<SmartNudge page="dashboard" />, { wrapper: Wrapper });
    expect(screen.getByText('Connect Your First App')).toBeInTheDocument();
    expect(screen.getByText('Link your apps')).toBeInTheDocument();
    expect(screen.getByText(/Set Up/)).toBeInTheDocument();
  });
});
