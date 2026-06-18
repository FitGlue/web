import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const hoisted = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  clientGet: vi.fn(() => Promise.resolve({ data: { profile: null } })),
}));

vi.mock('../../../../hooks/useUser', () => ({
  useUser: hoisted.useUserMock,
}));

vi.mock('../../../../../shared/api/client', () => ({
  client: { GET: hoisted.clientGet },
  default: { GET: hoisted.clientGet },
}));

vi.mock('../../../../../shared/nativeBridge', () => ({
  isNativeApp: false,
}));

import { SettingsLayout } from '../SettingsLayout';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('SettingsLayout', () => {
  beforeEach(() => {
    hoisted.useUserMock.mockReturnValue({ user: null, loading: false });
  });

  it('renders children', () => {
    render(<SettingsLayout>settings body</SettingsLayout>, { wrapper: Wrapper });
    expect(screen.getByText('settings body')).toBeInTheDocument();
  });

  it('renders the settings nav rail links', () => {
    render(<SettingsLayout>body</SettingsLayout>, { wrapper: Wrapper });
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'href',
      '/settings/account',
    );
    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'href',
      '/settings/subscription',
    );
  });

  it('renders the title in the page header', () => {
    render(<SettingsLayout title="Settings">body</SettingsLayout>, {
      wrapper: Wrapper,
    });
    expect(screen.getByRole('heading', { name: 'SETTINGS' })).toBeInTheDocument();
  });
});
