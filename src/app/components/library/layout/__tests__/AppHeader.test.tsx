import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider, createStore } from 'jotai';

const hoisted = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  isNativeApp: false,
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
  get isNativeApp() {
    return hoisted.isNativeApp;
  },
}));

import { AppHeader } from '../AppHeader';

function renderHeader() {
  const store = createStore();
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    );
  }
  return render(<AppHeader />, { wrapper: Wrapper });
}

describe('AppHeader', () => {
  beforeEach(() => {
    hoisted.isNativeApp = false;
    hoisted.useUserMock.mockReturnValue({ user: null, loading: false });
  });

  it('renders the banner and logo', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByLabelText('FitGlue — go to dashboard')).toBeInTheDocument();
  });

  it('renders the primary nav links', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pipelines' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Connections' })).toBeInTheDocument();
  });

  it('opens the command palette via the search button', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
  });

  it('toggles the avatar menu', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.getByRole('dialog', { name: 'User menu' })).toBeInTheDocument();
  });

  it('renders nothing in native app mode', () => {
    hoisted.isNativeApp = true;
    const { container } = renderHeader();
    expect(container.firstChild).toBeNull();
  });
});
