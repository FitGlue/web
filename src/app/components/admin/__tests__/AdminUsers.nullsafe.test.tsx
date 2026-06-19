import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'jotai';

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

// A user missing the enriched `integrations`/sync-count fields, with the tier
// arriving as a string enum name — exactly the payload that used to crash the
// Users tab with "Cannot read properties of undefined (reading 'length')".
vi.mock('../../../hooks/admin', () => ({
  useAdminUsers: () => ({
    users: [
      {
        userId: 'abcdef1234567890',
        isAdmin: false,
        accessEnabled: true,
        tier: 'USER_TIER_ATHLETE',
      },
    ],
    pagination: null,
    loading: false,
    error: null,
    fetchUsers: vi.fn(),
    fetchUserDetail: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

import { ToastProvider } from '../../library/ui/Toast';
import { AdminUsers } from '../AdminUsers';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}

describe('AdminUsers (defensive rendering)', () => {
  it('renders a user that is missing integrations without crashing', () => {
    expect(() => render(<AdminUsers />, { wrapper: Wrapper })).not.toThrow();
  });

  it('resolves a string tier enum to the Athlete badge', () => {
    render(<AdminUsers />, { wrapper: Wrapper });
    // "Athlete" appears as both a filter <option> and the row badge (2);
    // "Hobbyist" appears only as the filter <option> (1) — proving the string
    // tier resolved to Athlete rather than defaulting to Hobbyist.
    expect(screen.getAllByText('Athlete').length).toBe(2);
    expect(screen.getAllByText('Hobbyist').length).toBe(1);
  });
});
