import React, { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { Stack, Grid } from '../library/layout';
import { Card, Badge, EmptyState, Button, Text, Heading, Code } from '../library/ui';
import {
  DataTable,
  DataTableColumn,
  FilterBar,
  FilterField,
} from '../library/ui';
import { useAdminPipelineRuns } from '../../hooks/admin';
import { pipelineRunFiltersAtom, AdminPipelineRun, selectedPipelineRunIdAtom } from '../../state/adminState';

// Status badge variant mapping
const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  'Synced': 'success',
  'In Progress': 'info',
  'Pending': 'warning',
  'Partial': 'warning',
  'Failed': 'error',
  'Skipped': 'default',
  'Archived': 'default',
};

/**
 * AdminPipelineRuns displays pipeline execution data across all users
 */
export const AdminPipelineRuns: React.FC = () => {
  const [filters, setFilters] = useAtom(pipelineRunFiltersAtom);
  const [, setSelectedRunId] = useAtom(selectedPipelineRunIdAtom);
  const {
    runs,
    stats,
    loading,
    error,
    hasMore,
    fetchRuns,
    selectRun,
    loadMore,
  } = useAdminPipelineRuns();

  // Fetch runs on mount
  useEffect(() => {
    fetchRuns();
  }, []);

  const handleApplyFilters = useCallback(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleResetFilters = useCallback(() => {
    setFilters({ limit: 50 });
    fetchRuns();
  }, [setFilters, fetchRuns]);

  const handleRowClick = useCallback((run: AdminPipelineRun) => {
    setSelectedRunId(run.id);
    selectRun(run);
  }, [setSelectedRunId, selectRun]);

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const columns: DataTableColumn<AdminPipelineRun>[] = [
    {
      key: 'createdAt',
      header: 'Time',
      render: (run) => (
        <Text variant="small">{formatRelativeTime(run.createdAt)}</Text>
      ),
      width: '100px',
    },
    {
      key: 'title',
      header: 'Activity',
      render: (run) => (
        <Stack gap="xs">
          <Text variant="body">{run.title || 'Untitled'}</Text>
          <Text variant="small">{run.source}</Text>
        </Stack>
      ),
    },
    {
      key: 'userId',
      header: 'User',
      render: (run) => (
        <Code>{run.userId.slice(0, 8)}...</Code>
      ),
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (run) => (
        <Badge variant={statusVariants[run.status] || 'default'} size="sm">
          {run.status}
        </Badge>
      ),
      width: '100px',
    },
    {
      key: 'boosters',
      header: 'Boosters',
      render: (run) => (
        <Text variant="small">
          {run.boosters.length > 0
            ? run.boosters.map(b => b.providerName).join(', ')
            : '-'
          }
        </Text>
      ),
      truncate: true,
      maxWidth: '150px',
    },
    {
      key: 'destinations',
      header: 'Destinations',
      render: (run) => (
        <Stack direction="horizontal" gap="xs">
          {run.destinations.map((d, i) => (
            <Badge
              key={i}
              variant={d.status === 'Success' || d.status === '2' ? 'success' : d.status === 'Failed' || d.status === '3' ? 'error' : 'default'}
              size="sm"
            >
              {d.destination}
            </Badge>
          ))}
        </Stack>
      ),
      width: '200px',
    },
  ];

  return (
    <Stack gap="md">
      {/* Stats summary */}
      {stats && (
        <Grid cols={4} gap="md">
          <Card>
            <Text variant="muted">Total Runs</Text>
            <Heading level={3}>{stats.total}</Heading>
          </Card>
          <Card>
            <Text variant="muted">Synced</Text>
            <Heading level={3}>{stats.byStatus['Synced'] || 0}</Heading>
          </Card>
          <Card>
            <Text variant="muted">Failed</Text>
            <Heading level={3}>{stats.byStatus['Failed'] || 0}</Heading>
          </Card>
          <Card>
            <Text variant="muted">Pending</Text>
            <Heading level={3}>{stats.byStatus['Pending'] || 0}</Heading>
          </Card>
        </Grid>
      )}

      {/* Filters */}
      <FilterBar onApply={handleApplyFilters} onReset={handleResetFilters} loading={loading}>
        <FilterField label="Status">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="1">In Progress</option>
            <option value="2">Synced</option>
            <option value="3">Partial</option>
            <option value="4">Failed</option>
            <option value="5">Pending</option>
            <option value="6">Skipped</option>
          </select>
        </FilterField>
        <FilterField label="Source">
          <select
            value={filters.source || ''}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          >
            <option value="">All Sources</option>
            <option value="1">Hevy</option>
            <option value="6">Strava</option>
            <option value="3">Fitbit</option>
            <option value="11">Polar</option>
            <option value="12">Wahoo</option>
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
        <FilterField label="Limit">
          <select
            value={filters.limit || 50}
            onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) })}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </FilterField>
      </FilterBar>

      {/* Error state */}
      {error ? (
        <Card>
          <EmptyState
            title="Error loading pipeline runs"
            description={error}
            actionLabel="Retry"
            onAction={() => fetchRuns()}
          />
        </Card>
      ) : (
        /* Pipeline runs table */
        <DataTable
          data={runs}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRowClick={handleRowClick}
          emptyState={
            <EmptyState
              title="No pipeline runs found"
              description="No pipeline runs match the current filters."
            />
          }
        />
      )}

      {/* Load more */}
      {hasMore && (
        <Stack align="center">
          <Button
            variant="secondary"
            onClick={loadMore}
            disabled={loading}
          >
            Load More
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
