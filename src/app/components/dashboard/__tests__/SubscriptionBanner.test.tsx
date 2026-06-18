import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useUser = vi.fn();
vi.mock('../../../hooks/useUser', () => ({
  useUser: () => useUser(),
}));

import { SubscriptionBanner } from '../SubscriptionBanner';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('SubscriptionBanner', () => {
  it('shows the hobbyist usage and an upgrade CTA', () => {
    useUser.mockReturnValue({ user: { syncCountThisMonth: 2 }, loading: false });
    render(<SubscriptionBanner />, { wrapper: Wrapper });
    expect(screen.getByText('HOBBYIST')).toBeInTheDocument();
    expect(screen.getByText(/Upgrade/)).toBeInTheDocument();
  });

  it('shows the athlete band with unlimited syncs', () => {
    useUser.mockReturnValue({ user: { isAdmin: true }, loading: false });
    render(<SubscriptionBanner />, { wrapper: Wrapper });
    expect(screen.getByText('Unlimited syncs')).toBeInTheDocument();
    expect(screen.getByText(/Manage/)).toBeInTheDocument();
  });
});
