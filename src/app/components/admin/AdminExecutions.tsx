import React, { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { Stack } from '../library/layout';
import { Card, Badge, EmptyState, Text, Code } from '../library/ui';
import { 
  DataTable, 
  DataTableColumn,
  FilterBar, 
  FilterField,
} from '../library/ui';
import { useAdminExecutions } from '../../hooks/admin';
import { executionFiltersAtom, Execution, selectedExecutionIdAtom } from '../../state/adminState';

// Status badge variant mapping
const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  'Success': 'success',
  'SUCCESS': 'success',
  'Started': 'info',
  'STARTED': 'info',
  'Failed': 'error',
  'FAILED': 'error',
  'Pending': 'warning',
  'PENDING': 'warning',
};

/**
 * AdminExecutions displays execution logs with filtering
 */
export const AdminExecutions: React.FC = () => {
  const [filters, setFilters] = useAtom(executionFiltersAtom);
  const [, setSelectedExecutionId] = useAtom(selectedExecutionIdAtom);
  const { 
    executions, 
    availableServices,
    loading, 
    error, 
    fetchExecutions, 
    selectExecution,
  } = useAdminExecutions();

  // Fetch executions on mount
  useEffect(() => {
    fetchExecutions();
  }, []);

  const handleApplyFilters = useCallback(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const handleResetFilters = useCallback(() => {
    setFilters({ limit: 50 });
    fetchExecutions();
  }, [setFilters, fetchExecutions]);

  const handleRowClick = useCallback((execution: Execution) => {
    setSelectedExecutionId(execution.id);
    selectExecution(execution);
  }, [setSelectedExecutionId, selectExecution]);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  const columns: DataTableColumn<Execution>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (exec) => (
        <Text variant="small">{formatTimestamp(exec.timestamp)}</Text>
      ),
      width: '150px',
    },
    {
      key: 'service',
      header: 'Service',
      render: (exec) => <Text variant="body">{exec.service}</Text>,
      width: '150px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (exec) => (
        <Badge variant={statusVariants[exec.status] || 'default'} size="sm">
          {exec.status}
        </Badge>
      ),
      width: '100px',
    },
    {
      key: 'userId',
      header: 'User',
      render: (exec) => exec.userId ? (
        <Code>{exec.userId.slice(0, 8)}...</Code>
      ) : <Text variant="muted">-</Text>,
      width: '120px',
    },
    {
      key: 'errorMessage',
      header: 'Error',
      render: (exec) => exec.errorMessage ? (
        <Badge variant="error" size="sm">{exec.errorMessage}</Badge>
      ) : (
        <Text variant="muted">-</Text>
      ),
      truncate: true,
      maxWidth: '200px',
    },
  ];

  return (
    <Stack gap="md">
      {/* Filters */}
      <FilterBar onApply={handleApplyFilters} onReset={handleResetFilters} loading={loading}>
        <FilterField label="Service">
          <select
            value={filters.service || ''}
            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          >
            <option value="">All Services</option>
            {availableServices.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Status">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="STARTED">Started</option>
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
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </FilterField>
      </FilterBar>

      {/* Error state */}
      {error && (
        <Card>
          <EmptyState 
            title="Error loading executions" 
            description={error}
          />
        </Card>
      )}

      {/* Executions table */}
      <DataTable
        data={executions}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRowClick={handleRowClick}
        emptyState={
          <EmptyState 
            title="No executions found" 
            description="No executions match the current filters."
          />
        }
      />
    </Stack>
  );
};
