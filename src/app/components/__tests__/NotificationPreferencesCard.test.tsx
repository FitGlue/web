import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../shared/api/client', () => ({
  client: { GET: vi.fn().mockResolvedValue({ data: {} }), PUT: vi.fn().mockResolvedValue({ data: {} }) },
  default: { GET: vi.fn().mockResolvedValue({ data: {} }), PUT: vi.fn().mockResolvedValue({ data: {} }) },
}));

import { ToastProvider } from '../library/ui/Toast';
import { NotificationPreferencesCard } from '../NotificationPreferencesCard';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('NotificationPreferencesCard', () => {
  it('shows a loading state then renders the notification types', async () => {
    render(<NotificationPreferencesCard />, { wrapper: Wrapper });
    expect(screen.getByText(/Loading preferences/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Action Required')).toBeInTheDocument());
    expect(screen.getByText('Pipeline Failures')).toBeInTheDocument();
  });
});
