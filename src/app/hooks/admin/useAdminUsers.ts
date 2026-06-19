import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { adminClient } from '../../../shared/api/admin-client';
import { logger } from '../../../shared/logger';
import type { components } from '../../../shared/api/schema-admin';
import {
  AdminUser,
  Pagination,
  userFiltersAtom,
} from '../../state/adminState';

type UpdateUserRequest = components['schemas']['UpdateUserAdminRequest'];

export interface UseAdminUsersResult {
  users: AdminUser[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  fetchUsers: (page?: number) => Promise<void>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
}

/**
 * Hook for fetching and managing the admin user directory. Detail-level
 * operations live in useAdminUserDetail.
 */
export function useAdminUsers(): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useAtomValue(userFiltersAtom);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminClient.GET('/users', {
        params: { query: { limit: 25, page_token: String(page) } },
      });
      if (data) {
        let list = data.users ?? [];
        // Client-side filters (the directory is small; server filtering can come later).
        if (filters.userId) {
          const q = filters.userId.toLowerCase();
          list = list.filter(
            (u) => (u.userId ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
          );
        }
        if (filters.tier) {
          const want = filters.tier === 'athlete' ? 'USER_TIER_ATHLETE' : 'USER_TIER_HOBBYIST';
          list = list.filter((u) => u.tier === want);
        }
        setUsers(list);
        setPagination({ page } as Pagination);
      }
    } catch (err) {
      logger.warn('Failed to fetch users:', err);
      setError('Failed to load users. Admin access required.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateUser = useCallback(async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const body: UpdateUserRequest = {
        id: userId,
        accessEnabled: updates.accessEnabled,
      };
      await adminClient.PUT('/users/{id}', {
        params: { path: { id: userId } },
        body,
      });
      await fetchUsers(pagination?.page || 1);
    } catch (err) {
      logger.error('Failed to update user:', err);
      throw new Error('Failed to update user');
    }
  }, [fetchUsers, pagination]);

  return {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    updateUser,
  };
}
