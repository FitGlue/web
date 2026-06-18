import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const hoisted = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => hoisted.navigate };
});

import { BackLink } from '../BackLink';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('BackLink', () => {
  it('renders default label', () => {
    render(<BackLink />, { wrapper: Wrapper });
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<BackLink label="Go home" />, { wrapper: Wrapper });
    expect(screen.getByText('Go home')).toBeInTheDocument();
  });

  it('navigates to target path when `to` provided', async () => {
    hoisted.navigate.mockClear();
    render(<BackLink to="/dashboard" />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('Back'));
    expect(hoisted.navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates back when no `to` provided', async () => {
    hoisted.navigate.mockClear();
    render(<BackLink />, { wrapper: Wrapper });
    await userEvent.click(screen.getByText('Back'));
    expect(hoisted.navigate).toHaveBeenCalledWith(-1);
  });
});
