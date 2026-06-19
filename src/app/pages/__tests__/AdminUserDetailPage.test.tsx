import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

const updateUser = vi.fn().mockResolvedValue(undefined);
const setIntegrationEnabled = vi.fn().mockResolvedValue(undefined);
const sendPasswordReset = vi.fn().mockResolvedValue(undefined);
const openBillingPortal = vi.fn().mockResolvedValue(undefined);
const getPipeline = vi.fn().mockResolvedValue({ id: 'p1', name: 'My Pipe', disabled: false, enrichers: [], destinations: [] });

const baseDetail = {
  profile: {
    userId: 'u1',
    email: 'a@b.com',
    displayName: 'Ada',
    tier: 'USER_TIER_HOBBYIST',
    isAdmin: false,
    accessEnabled: true,
    syncCountThisMonth: 3,
    createdAt: '2026-01-01T00:00:00Z',
  },
  integrations: [{ provider: 'strava', enabled: true, connected: true, tokenHealth: 'valid' }],
  pipelines: [{ id: 'p1', name: 'My Pipe', source: 'SOURCE_STRAVA', destinations: ['STRAVA'], enabled: true }],
  activityCount: 5,
  pipelineRunCount: 2,
  pendingInputs: [],
  billing: {
    subscription: { status: 'active', stripeCustomerId: 'cus_x', stripeSubscriptionId: 'sub_x' },
    effectiveTier: 'USER_TIER_ATHLETE',
    isTrial: false,
  },
};

vi.mock('../../hooks/admin', () => ({
  useAdminUserDetail: () => ({
    detail: baseDetail,
    loading: false,
    error: null,
    reload: vi.fn(),
    updateUser,
    sendPasswordReset,
    sendVerificationEmail: vi.fn(),
    setIntegrationEnabled,
    deleteIntegration: vi.fn(),
    deleteUserData: vi.fn(),
    deleteUser: vi.fn(),
    startTrial: vi.fn(),
    cancelSubscription: vi.fn(),
    openBillingPortal,
    getPipeline,
    updatePipeline: vi.fn(),
    deletePipeline: vi.fn(),
  }),
}));

import { ToastProvider } from '../../components/library/ui/Toast';
import AdminUserDetailPage from '../AdminUserDetailPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/users/u1']}>
      <ToastProvider>
        <Routes>
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  updateUser.mockClear();
  setIntegrationEnabled.mockClear();
  sendPasswordReset.mockClear();
});

describe('AdminUserDetailPage', () => {
  it('renders the dense 360° record for the user', () => {
    renderPage();
    expect(screen.getByText('a@b.com')).toBeTruthy();
    expect(screen.getByText('integrations')).toBeTruthy();
    expect(screen.getByText('pipelines')).toBeTruthy();
    expect(screen.getByText('My Pipe')).toBeTruthy();
  });

  it('toggles access via updateUser', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Revoke access'));
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ accessEnabled: false }));
  });

  it('sends a password reset', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Password reset'));
    await waitFor(() => expect(sendPasswordReset).toHaveBeenCalled());
  });

  it('disables an integration', async () => {
    renderPage();
    fireEvent.click(screen.getByText('off'));
    await waitFor(() => expect(setIntegrationEnabled).toHaveBeenCalledWith('strava', false));
  });

  it('renders the billing panel and opens the Stripe portal', async () => {
    renderPage();
    expect(screen.getByText('billing')).toBeTruthy();
    fireEvent.click(screen.getByText('Stripe portal'));
    await waitFor(() => expect(openBillingPortal).toHaveBeenCalled());
  });

  it('opens the pipeline inspector when a pipeline is clicked', async () => {
    renderPage();
    fireEvent.click(screen.getByText('My Pipe'));
    await waitFor(() => expect(getPipeline).toHaveBeenCalledWith('p1'));
    expect(screen.getByText('Pipeline Config')).toBeTruthy();
  });
});
