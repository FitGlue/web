import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useApi } from '../useApi';
import { 
  AdminUser, 
  AdminUserDetail, 
  Pagination, 
  userFiltersAtom,
} from '../../state/adminState';

export interface UseAdminUsersResult {
  users: AdminUser[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  selectedUser: AdminUserDetail | null;
  selectedUserLoading: boolean;
  fetchUsers: (page?: number) => Promise<void>;
  fetchUserDetail: (userId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUserData: (userId: string, dataType: 'integrations' | 'pipelines' | 'activities' | 'pending-inputs', subId?: string) => Promise<void>;
  clearSelectedUser: () => void;
}

interface UsersResponse {
  data: AdminUser[];
  pagination: Pagination;
}

/**
 * Hook for fetching and managing admin users
 */
export function useAdminUsers(): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  
  const filters = useAtomValue(userFiltersAtom);
  const api = useApi();

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      
      // Apply filters
      if (filters.tier) params.set('tier', filters.tier);
      if (filters.userId) params.set('userId', filters.userId);

      const data = await api.get(`/admin/users?${params.toString()}`) as UsersResponse;
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Admin access required.');
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

  const fetchUserDetail = useCallback(async (userId: string) => {
    setSelectedUserLoading(true);
    try {
      const data = await api.get(`/admin/users/${userId}`) as AdminUserDetail;
      setSelectedUser(data);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setSelectedUserLoading(false);
    }
  }, [api]);

  const updateUser = useCallback(async (userId: string, updates: Partial<AdminUser>) => {
    try {
      await api.patch(`/admin/users/${userId}`, updates);
      // Refresh the users list
      await fetchUsers(pagination?.page || 1);
      // Refresh selected user if it's the same one
      if (selectedUser?.userId === userId) {
        await fetchUserDetail(userId);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      throw new Error('Failed to update user');
    }
  }, [api, fetchUsers, fetchUserDetail, pagination, selectedUser]);

  const deleteUserData = useCallback(async (
    userId: string, 
    dataType: 'integrations' | 'pipelines' | 'activities' | 'pending-inputs', 
    subId?: string
  ) => {
    try {
      const path = subId
        ? `/admin/users/${userId}/${dataType}/${subId}`
        : `/admin/users/${userId}/${dataType}`;
      
      await api.delete(path);
      // Refresh user detail
      await fetchUserDetail(userId);
    } catch (err) {
      console.error(`Failed to delete ${dataType}:`, err);
      throw new Error(`Failed to delete ${dataType}`);
    }
  }, [api, fetchUserDetail]);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  return {
    users,
    pagination,
    loading,
    error,
    selectedUser,
    selectedUserLoading,
    fetchUsers,
    fetchUserDetail,
    updateUser,
    deleteUserData,
    clearSelectedUser,
  };
}
