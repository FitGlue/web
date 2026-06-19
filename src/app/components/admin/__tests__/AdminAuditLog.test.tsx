import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useAdminAuditLog = vi.fn();
vi.mock('../../../hooks/admin', () => ({
  useAdminAuditLog: () => useAdminAuditLog(),
}));

import { AdminAuditLog } from '../AdminAuditLog';

describe('AdminAuditLog', () => {
  it('renders an error state', () => {
    useAdminAuditLog.mockReturnValue({ entries: [], loading: false, error: 'nope', refresh: vi.fn() });
    render(<AdminAuditLog />);
    expect(screen.getByText('Error loading audit log')).toBeTruthy();
  });

  it('renders audit entries', () => {
    useAdminAuditLog.mockReturnValue({
      entries: [{
        id: 'e1',
        action: 'update_user',
        actorEmail: 'admin@x.com',
        targetUserId: 'abcdef1234',
        result: 'ok',
        params: { tier: 'USER_TIER_ATHLETE' },
        timestamp: '2026-06-19T00:00:00Z',
      }],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    render(<AdminAuditLog />);
    expect(screen.getByText('update_user')).toBeTruthy();
    expect(screen.getByText('admin@x.com')).toBeTruthy();
    expect(screen.getByText(/tier=USER_TIER_ATHLETE/)).toBeTruthy();
  });
});
