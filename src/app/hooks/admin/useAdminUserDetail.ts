import { useState, useCallback, useEffect } from 'react';
import { adminClient } from '../../../shared/api/admin-client';
import { logger } from '../../../shared/logger';
import { AdminUserDetail } from '../../state/adminState';

export interface UpdateUserFields {
  accessEnabled?: boolean;
  tier?: 'USER_TIER_HOBBYIST' | 'USER_TIER_ATHLETE';
  isAdmin?: boolean;
  displayName?: string;
}

export interface UseAdminUserDetailResult {
  detail: AdminUserDetail | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateUser: (updates: UpdateUserFields) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  setIntegrationEnabled: (provider: string, enabled: boolean) => Promise<void>;
  deleteIntegration: (provider: string) => Promise<void>;
  deleteUserData: (dataType: 'integrations' | 'pipelines' | 'activities' | 'pending-inputs') => Promise<void>;
  deleteUser: () => Promise<void>;
  startTrial: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
}

/**
 * useAdminUserDetail loads the aggregated 360° view of one user and exposes the
 * full set of admin actions against that account. Mutations reload the detail so
 * the page always reflects current state.
 */
export function useAdminUserDetail(userId: string | undefined): UseAdminUserDetailResult {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminClient.GET('/users/{id}', {
        params: { path: { id: userId } },
      });
      setDetail((data as AdminUserDetail) ?? null);
    } catch (err) {
      logger.warn('Failed to load admin user detail:', err);
      setError('Failed to load user. Admin access required.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateUser = useCallback(async (updates: UpdateUserFields) => {
    if (!userId) return;
    await adminClient.PUT('/users/{id}', {
      params: { path: { id: userId } },
      body: { id: userId, ...updates },
    });
    await reload();
  }, [userId, reload]);

  const sendPasswordReset = useCallback(async () => {
    if (!userId) return;
    await adminClient.POST('/users/{id}/send-password-reset', {
      params: { path: { id: userId } },
      body: {},
    });
  }, [userId]);

  const sendVerificationEmail = useCallback(async () => {
    if (!userId) return;
    await adminClient.POST('/users/{id}/send-verification-email', {
      params: { path: { id: userId } },
      body: {},
    });
  }, [userId]);

  const setIntegrationEnabled = useCallback(async (provider: string, enabled: boolean) => {
    if (!userId) return;
    await adminClient.POST('/users/{id}/integrations/{provider}/enabled', {
      params: { path: { id: userId, provider } },
      body: { enabled },
    });
    await reload();
  }, [userId, reload]);

  const deleteIntegration = useCallback(async (provider: string) => {
    if (!userId) return;
    await adminClient.DELETE('/users/{id}/integrations/{provider}', {
      params: { path: { id: userId, provider } },
    });
    await reload();
  }, [userId, reload]);

  const deleteUserData = useCallback(async (
    dataType: 'integrations' | 'pipelines' | 'activities' | 'pending-inputs',
  ) => {
    if (!userId) return;
    await adminClient.DELETE('/users/{id}/{dataType}', {
      params: { path: { id: userId, dataType } },
    });
    await reload();
  }, [userId, reload]);

  const deleteUser = useCallback(async () => {
    if (!userId) return;
    await adminClient.DELETE('/users/{id}', {
      params: { path: { id: userId } },
    });
  }, [userId]);

  const startTrial = useCallback(async () => {
    if (!userId) return;
    await adminClient.POST('/users/{id}/billing/trial', {
      params: { path: { id: userId } },
      body: {},
    });
    await reload();
  }, [userId, reload]);

  const cancelSubscription = useCallback(async () => {
    if (!userId) return;
    await adminClient.POST('/users/{id}/billing/cancel', {
      params: { path: { id: userId } },
      body: {},
    });
    await reload();
  }, [userId, reload]);

  const openBillingPortal = useCallback(async () => {
    if (!userId) return;
    const { data } = await adminClient.POST('/users/{id}/billing/portal', {
      params: { path: { id: userId } },
      body: { returnUrl: window.location.href },
    });
    const url = (data as { url?: string })?.url;
    if (url) window.open(url, '_blank');
  }, [userId]);

  return {
    detail,
    loading,
    error,
    reload,
    updateUser,
    sendPasswordReset,
    sendVerificationEmail,
    setIntegrationEnabled,
    deleteIntegration,
    deleteUserData,
    deleteUser,
    startTrial,
    cancelSubscription,
    openBillingPortal,
  };
}
