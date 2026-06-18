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

import { PageLayout } from '../PageLayout';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('PageLayout', () => {
  beforeEach(() => {
    hoisted.useUserMock.mockReturnValue({ user: null, loading: false });
  });

  it('renders children inside main', () => {
    render(<PageLayout>page body</PageLayout>, { wrapper: Wrapper });
    expect(screen.getByText('page body')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the page header title when title provided', () => {
    render(<PageLayout title="My Page">body</PageLayout>, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { name: 'MY PAGE' })).toBeInTheDocument();
  });

  it('renders header actions', () => {
    render(
      <PageLayout title="x" headerActions={<button>Do</button>}>body</PageLayout>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: 'Do' })).toBeInTheDocument();
  });

  it('applies full-width class', () => {
    const { container } = render(
      <PageLayout fullWidth>body</PageLayout>,
      { wrapper: Wrapper },
    );
    expect(
      container.querySelector('.app-page-content--full-width'),
    ).toBeInTheDocument();
  });

  it('renders the AppHeader banner', () => {
    render(<PageLayout>body</PageLayout>, { wrapper: Wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
