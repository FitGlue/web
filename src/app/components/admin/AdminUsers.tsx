import React, { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { Stack } from '../library/layout';
import { Card, Button, Badge, EmptyState, useToast, Code, Text } from '../library/ui';
import {
  DataTable,
  DataTableColumn,
  FilterBar,
  FilterField,
  Pagination,
} from '../library/ui';
import { useAdminUsers } from '../../hooks/admin';
import { userFiltersAtom, AdminUser, selectedUserIdAtom } from '../../state/adminState';
import { UserTier } from '../../../types/pb/user';

/**
 * AdminUsers displays and manages platform users
 */
export const AdminUsers: React.FC = () => {
  const [filters, setFilters] = useAtom(userFiltersAtom);
  const [, setSelectedUserId] = useAtom(selectedUserIdAtom);
  const toast = useToast();
  const {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    fetchUserDetail,
    updateUser,
  } = useAdminUsers();

  // Fetch users on mount and when filters change
  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleApplyFilters = useCallback(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    fetchUsers(1);
  }, [setFilters, fetchUsers]);

  const handleRowClick = useCallback((user: AdminUser) => {
    setSelectedUserId(user.userId);
    fetchUserDetail(user.userId);
  }, [setSelectedUserId, fetchUserDetail]);

  const handleToggleAccess = useCallback(async (e: React.MouseEvent, user: AdminUser) => {
    e.stopPropagation();
    try {
      await updateUser(user.userId, { accessEnabled: !user.accessEnabled });
      toast.success(
        'User Updated',
        `${user.accessEnabled ? 'Revoked' : 'Enabled'} access for user ${user.userId.slice(0, 8)}...`
      );
    } catch (err) {
      console.error('Failed to toggle access:', err);
      toast.error('Update Failed', 'Failed to update user access');
    }
  }, [updateUser, toast]);

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'userId',
      header: 'User',
      render: (user) => <Code>{user.userId.slice(0, 8)}...</Code>,
      width: '120px',
    },
    {
      key: 'isAdmin',
      header: 'Role',
      render: (user) => user.isAdmin ? (
        <Badge variant="premium" size="sm">Admin</Badge>
      ) : (
        <Text variant="muted">-</Text>
      ),
      width: '80px',
    },
    {
      key: 'accessEnabled',
      header: 'Access',
      render: (user) => (
        <Badge variant={user.accessEnabled ? 'success' : 'warning'} size="sm">
          {user.accessEnabled ? '✓ Active' : '⏳ Waitlist'}
        </Badge>
      ),
      width: '100px',
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (user) => (
        <Badge
          variant={user.tier === UserTier.USER_TIER_ATHLETE ? 'premium' : 'default'}
          size="sm"
        >
          {user.tier === UserTier.USER_TIER_ATHLETE ? 'Athlete' : 'Hobbyist'}
        </Badge>
      ),
      width: '100px',
    },
    {
      key: 'syncCountThisMonth',
      header: 'Syncs',
      render: (user) => (
        <Stack direction="horizontal" gap="xs" align="center">
          <Text variant="body">{user.syncCountThisMonth}</Text>
          {user.preventedSyncCount > 0 && (
            <Text variant="muted">(+{user.preventedSyncCount})</Text>
          )}
        </Stack>
      ),
      width: '80px',
    },
    {
      key: 'integrations',
      header: 'Integrations',
      render: (user) => (
        <Text variant="body">
          {user.integrations.length > 0 ? user.integrations.join(', ') : '-'}
        </Text>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <Button
          variant={user.accessEnabled ? 'secondary' : 'primary'}
          size="small"
          onClick={(e) => handleToggleAccess(e as React.MouseEvent, user)}
        >
          {user.accessEnabled ? 'Revoke' : 'Enable'}
        </Button>
      ),
      stopPropagation: true,
      width: '100px',
    },
  ];

  return (
    <Stack gap="md">
      {/* Filters */}
      <FilterBar onApply={handleApplyFilters} onReset={handleResetFilters} loading={loading}>
        <FilterField label="Tier">
          <select
            value={filters.tier || ''}
            onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
          >
            <option value="">All Tiers</option>
            <option value="hobbyist">Hobbyist</option>
            <option value="athlete">Athlete</option>
          </select>
        </FilterField>
        <FilterField label="User ID">
          <input
            type="text"
            placeholder="Filter by User ID..."
            value={filters.userId || ''}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          />
        </FilterField>
      </FilterBar>

      {/* Error state OR Users table */}
      {error ? (
        <Card>
          <EmptyState
            title="Error loading users"
            description={error}
            actionLabel="Retry"
            onAction={() => fetchUsers(1)}
          />
        </Card>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          rowKey="userId"
          loading={loading}
          onRowClick={handleRowClick}
          emptyState={
            <EmptyState
              title="No users found"
              description="No users match the current filters."
            />
          }
        />
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          totalItems={pagination.total}
          onPageChange={(page) => fetchUsers(page)}
          loading={loading}
        />
      )}
    </Stack>
  );
};
