import React, { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { Stack, Grid } from '../library/layout';
import { Card, Badge, EmptyState, Button, Text, Code } from '../library/ui';
import './admin.css';
import {
  DataTable,
  DataTableColumn,
  FilterBar,
  FilterField,
} from '../library/ui';
import { useAdminPipelineRuns } from '../../hooks/admin';
import { pipelineRunFiltersAtom, AdminPipelineRun, selectedPipelineRunIdAtom } from '../../state/adminState';
import { PipelineRunStatus } from '../../../types/pb/models/pipeline/execution';
import { ActivitySource } from '../../../types/pb/models/activity/source';
import {
  formatPipelineRunStatus,
  formatActivitySource,
  formatDestination,
} from '../../../types/pb/enum-formatters';

// Build filter options from the generated enums so the values stay in sync with
// the proto. Option values are the enum *name* strings, which is how runs store
// status/source (e.g. "PIPELINE_RUN_STATUS_SYNCED", "SOURCE_STRAVA").
type EnumOption = { value: string; label: string };

const STATUS_OPTIONS: EnumOption[] = Object.values(PipelineRunStatus)
  .filter(
    (v): v is PipelineRunStatus =>
      typeof v === 'number' &&
      v !== PipelineRunStatus.PIPELINE_RUN_STATUS_UNSPECIFIED &&
      v !== PipelineRunStatus.UNRECOGNIZED,
  )
  .map((v) => ({ value: PipelineRunStatus[v], label: formatPipelineRunStatus(v) }));

const SOURCE_OPTIONS: EnumOption[] = Object.values(ActivitySource)
  .filter(
    (v): v is ActivitySource =>
      typeof v === 'number' &&
      v > 0 &&
      v !== ActivitySource.SOURCE_TEST &&
      v !== ActivitySource.UNRECOGNIZED,
  )
  .map((v) => ({ value: ActivitySource[v], label: formatActivitySource(v) }));

// Status badge variant mapping — keys match schema enum strings.
const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  'PIPELINE_RUN_STATUS_SYNCED': 'success',
  'PIPELINE_RUN_STATUS_RUNNING': 'info',
  'PIPELINE_RUN_STATUS_PENDING': 'warning',
  'PIPELINE_RUN_STATUS_PARTIAL': 'warning',
  'PIPELINE_RUN_STATUS_FAILED': 'error',
  'PIPELINE_RUN_STATUS_SKIPPED': 'default',
  'PIPELINE_RUN_STATUS_ARCHIVED': 'default',
  'PIPELINE_RUN_STATUS_TIER_BLOCKED': 'warning',
  'PIPELINE_RUN_STATUS_CANCELLED': 'default',
};

// BA badge class mapping
const statusBadgeClass: Record<string, string> = {
  'success': 'admin-badge--ok',
  'error': 'admin-badge--failed',
  'warning': 'admin-badge--warn',
  'info': 'admin-badge--warn',
  'default': 'admin-badge--muted',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = useCallback(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleResetFilters = useCallback(() => {
    setFilters({ limit: 50 });
    fetchRuns();
  }, [setFilters, fetchRuns]);

  const handleRowClick = useCallback((run: AdminPipelineRun) => {
    setSelectedRunId(run.id ?? null);
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
        <Text variant="small">{formatRelativeTime(run.createdAt ?? null)}</Text>
      ),
      width: '100px',
    },
    {
      key: 'title',
      header: 'Activity',
      render: (run) => (
        <Stack gap="xs">
          <Text variant="body">{run.title || 'Untitled'}</Text>
          <Text variant="small">{formatActivitySource(run.source)}</Text>
        </Stack>
      ),
    },
    {
      key: 'userId',
      header: 'User',
      render: (run) => (
        <Code>{(run.userId ?? 'unknown').slice(0, 8)}...</Code>
      ),
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (run) => {
        const v = statusVariants[run.status ?? ''] || 'default';
        return (
          <Badge variant={v} size="sm" className={statusBadgeClass[v]}>
            {formatPipelineRunStatus(run.status)}
          </Badge>
        );
      },
      width: '100px',
    },
    {
      key: 'boosters',
      header: 'Boosters',
      render: (run) => (
        <Text variant="small">
          {(run.boosters ?? []).length > 0
            ? (run.boosters ?? []).map(b => b.providerName).join(', ')
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
          {(run.destinations ?? []).map((d, i) => {
            const v = d.status === 'DESTINATION_STATUS_SUCCESS' ? 'success'
              : d.status === 'DESTINATION_STATUS_FAILED' ? 'error'
              : 'default';
            return (
              <Badge key={i} variant={v} size="sm" className={statusBadgeClass[v]}>
                {formatDestination(d.destination)}
              </Badge>
            );
          })}
        </Stack>
      ),
      width: '200px',
    },
  ];

  return (
    <Stack gap="md">
      {/* Stats summary — BA admin-stat-card panels */}
      {stats && (
        <Grid cols={4} gap="md">
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Total Runs</div>
            <div className="admin-stat-card__value">{stats.total}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Synced</div>
            <div className="admin-stat-card__value">{stats.byStatus['Synced'] || 0}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Failed</div>
            <div className="admin-stat-card__value">{stats.byStatus['Failed'] || 0}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Pending</div>
            <div className="admin-stat-card__value">{stats.byStatus['Pending'] || 0}</div>
          </div>
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
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Source">
          <select
            value={filters.source || ''}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          >
            <option value="">All Sources</option>
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
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
