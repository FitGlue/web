import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'jotai';

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../../hooks/admin', () => ({
  useAdminUsers: () => ({
    users: [],
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

describe('AdminUsers', () => {
  it('renders the users view without crashing', () => {
    const { container } = render(<AdminUsers />, { wrapper: Wrapper });
    expect(container).toBeTruthy();
  });
});
