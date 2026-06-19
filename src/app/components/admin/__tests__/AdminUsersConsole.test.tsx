import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

vi.mock('../../../hooks/admin', () => ({
  useAdminUsers: () => ({
    users: [{ userId: 'abc12345xyz', email: 'a@b.com', tier: 'USER_TIER_ATHLETE', accessEnabled: true, isAdmin: false, syncCountThisMonth: 3, integrationCount: 2, pipelineCount: 1 }],
    loading: false, error: null, fetchUsers: vi.fn(), updateUser: vi.fn(),
  }),
  useAdminUserDetail: () => ({
    detail: { profile: { userId: 'abc12345xyz', email: 'a@b.com', tier: 'USER_TIER_ATHLETE', accessEnabled: true, isAdmin: false }, integrations: [], pipelines: [], pendingInputs: [], billing: {} },
    loading: false, error: null, reload: vi.fn(),
    updateUser: vi.fn(), sendPasswordReset: vi.fn(), sendVerificationEmail: vi.fn(),
    setIntegrationEnabled: vi.fn(), deleteIntegration: vi.fn(), deleteUserData: vi.fn(),
    startTrial: vi.fn(), cancelSubscription: vi.fn(), openBillingPortal: vi.fn(),
    getPipeline: vi.fn(), updatePipeline: vi.fn(), deletePipeline: vi.fn(),
  }),
}));

import { ToastProvider } from '../../library/ui/Toast';
import { AdminUsersConsole } from '../AdminUsersConsole';

const renderConsole = () => render(<ToastProvider><AdminUsersConsole /></ToastProvider>);

describe('AdminUsersConsole', () => {
  it('lists users and shows a placeholder until one is selected', () => {
    renderConsole();
    expect(screen.getByText('a@b.com')).toBeTruthy();
    expect(screen.getByText('Select a user')).toBeTruthy();
  });

  it('opens the user record when a row is clicked', () => {
    renderConsole();
    fireEvent.click(screen.getByText('a@b.com'));
    expect(screen.getByText('integrations')).toBeTruthy();
  });
});
