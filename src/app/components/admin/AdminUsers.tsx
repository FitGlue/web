import React, { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../shared/logger';
import { Stack } from '../library/layout';
import { Card, Button, Badge, EmptyState, useToast, Code, Text } from '../library/ui';
import './admin.css';
import {
  DataTable,
  DataTableColumn,
  FilterBar,
  FilterField,
  Pagination,
} from '../library/ui';
import { useAdminUsers } from '../../hooks/admin';
import { userFiltersAtom, AdminUser } from '../../state/adminState';
import { UserTier } from '../../../types/pb/user';
import { resolveEnum } from '../../utils/resolveEnum';

/**
 * AdminUsers displays and manages platform users
 */
export const AdminUsers: React.FC = () => {
  const [filters, setFilters] = useAtom(userFiltersAtom);
  const navigate = useNavigate();
  const toast = useToast();
  const {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    updateUser,
  } = useAdminUsers();

  // Fetch users on mount and when filters change
  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = useCallback(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    fetchUsers(1);
  }, [setFilters, fetchUsers]);

  const handleRowClick = useCallback((user: AdminUser) => {
    if (user.userId) navigate(`/admin/users/${user.userId}`);
  }, [navigate]);

  const handleToggleAccess = useCallback(async (e: React.MouseEvent, user: AdminUser) => {
    e.stopPropagation();
    if (!user.userId) return;
    try {
      await updateUser(user.userId, { accessEnabled: !user.accessEnabled });
      toast.success(
        'User Updated',
        `${user.accessEnabled ? 'Revoked' : 'Enabled'} access for user ${user.userId.slice(0, 8)}...`
      );
    } catch (err) {
      logger.error('Failed to toggle access:', err);
      toast.error('Update Failed', 'Failed to update user access');
    }
  }, [updateUser, toast]);

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'userId',
      header: 'User',
      render: (user) => <Code>{(user.userId ?? '').slice(0, 8)}...</Code>,
      width: '120px',
    },
    {
      key: 'isAdmin',
      header: 'Role',
      render: (user) => user.isAdmin ? (
        <Badge variant="premium" size="sm" className="admin-badge--premium">Admin</Badge>
      ) : (
        <Text variant="muted">-</Text>
      ),
      width: '80px',
    },
    {
      key: 'accessEnabled',
      header: 'Access',
      render: (user) => (
        <Badge
          variant={user.accessEnabled ? 'success' : 'warning'}
          size="sm"
          className={user.accessEnabled ? 'admin-badge--ok' : 'admin-badge--warn'}
        >
          {user.accessEnabled ? '✓ Active' : '⏳ Waitlist'}
        </Badge>
      ),
      width: '100px',
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (user) => {
        // Gateway protobufs serialize the tier enum as a string name; resolveEnum
        // normalises both string and numeric forms to the numeric enum.
        const isAthlete = resolveEnum(user.tier, UserTier) === UserTier.USER_TIER_ATHLETE;
        return (
          <Badge
            variant={isAthlete ? 'premium' : 'default'}
            size="sm"
            className={isAthlete ? 'admin-badge--premium' : 'admin-badge--muted'}
          >
            {isAthlete ? 'Athlete' : 'Hobbyist'}
          </Badge>
        );
      },
      width: '100px',
    },
    {
      key: 'syncCountThisMonth',
      header: 'Syncs',
      render: (user) => (
        <Stack direction="horizontal" gap="xs" align="center">
          <Text variant="body">{user.syncCountThisMonth ?? 0}</Text>
          {(user.preventedSyncCount ?? 0) > 0 && (
            <Text variant="muted">(+{user.preventedSyncCount})</Text>
          )}
        </Stack>
      ),
      width: '80px',
    },
    {
      key: 'integrations',
      header: 'Integrations',
      render: (user) => {
        const integrations = user.integrations ?? [];
        return (
          <Text variant="body">
            {integrations.length > 0 ? integrations.join(', ') : '-'}
          </Text>
        );
      },
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
