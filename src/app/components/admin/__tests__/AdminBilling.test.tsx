import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useAdminUsers = vi.fn();
vi.mock('../../../hooks/admin', () => ({
  useAdminUsers: () => useAdminUsers(),
}));

import { AdminBilling } from '../AdminBilling';

describe('AdminBilling', () => {
  it('renders an error state when loading fails', () => {
    useAdminUsers.mockReturnValue({ users: [], loading: false, error: 'nope', fetchUsers: vi.fn() });
    render(<AdminBilling />);
    expect(screen.getByText('nope')).toBeInTheDocument();
  });

  it('renders athlete/stripe rows when loaded', () => {
    useAdminUsers.mockReturnValue({
      users: [{ userId: 'abcdef1234', email: 'a@b.com', tier: 'USER_TIER_ATHLETE', stripeCustomerId: 'cus_x' }],
      loading: false, error: null, fetchUsers: vi.fn(),
    });
    render(<AdminBilling />);
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText(/athlete \/ stripe users/)).toBeInTheDocument();
  });
});
