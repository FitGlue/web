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
    expect(screen.getByText(/Error loading billing data/)).toBeInTheDocument();
  });

  it('renders the billing table when loaded', () => {
    useAdminUsers.mockReturnValue({ users: [], loading: false, error: null, fetchUsers: vi.fn() });
    const { container } = render(<AdminBilling />);
    expect(container).toBeTruthy();
  });
});
