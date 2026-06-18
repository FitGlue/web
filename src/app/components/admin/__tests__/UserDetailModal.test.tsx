import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'jotai';

vi.mock('../../../hooks/admin', () => ({
  useAdminUsers: () => ({ updateUser: vi.fn(), deleteUserData: vi.fn() }),
}));

import { ToastProvider } from '../../library/ui/Toast';
import { UserDetailModal } from '../UserDetailModal';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}

describe('UserDetailModal', () => {
  it('renders nothing when no user is selected', () => {
    const { container } = render(<UserDetailModal />, { wrapper: Wrapper });
    expect(container).toBeEmptyDOMElement();
  });
});
