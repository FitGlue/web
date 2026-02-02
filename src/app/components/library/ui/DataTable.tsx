import React, { ReactNode, useState, useCallback } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
  TableVariant,
  SortDirection,
} from './Table';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';

// ============================================================================
// Column Definition
// ============================================================================
export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Column header text */
  header: string;
  /** Custom render function */
  render?: (item: T, index: number) => ReactNode;
  /** Accessor for sorting (if different from key) */
  accessor?: (item: T) => string | number | Date;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width */
  width?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Truncate content */
  truncate?: boolean;
  /** Max width for truncation */
  maxWidth?: string;
  /** Muted text style */
  muted?: boolean;
  /** Stop click propagation (for action columns) */
  stopPropagation?: boolean;
}

// ============================================================================
// DataTable Props
// ============================================================================
export interface DataTableProps<T> {
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Key field for row identification */
  rowKey: keyof T;
  /** Loading state */
  loading?: boolean;
  /** Table variant */
  variant?: TableVariant;
  /** Row click handler */
  onRowClick?: (item: T) => void;
  /** Selected row key(s) */
  selectedKeys?: Set<string | number>;
  /** Empty state content */
  emptyState?: ReactNode;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Pagination config */
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  /** Show skeleton rows while loading */
  skeletonRows?: number;
  /** Additional class name */
  className?: string;
}

/**
 * DataTable is a high-level table component with built-in sorting,
 * pagination, loading states, and empty states.
 */
export function DataTable<T extends object>({
  data,
  columns,
  rowKey,
  loading = false,
  variant = 'default',
  onRowClick,
  selectedKeys,
  emptyState,
  emptyTitle = 'No data',
  emptyDescription = 'There are no items to display.',
  pagination,
  skeletonRows = 5,
  className = '',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle sort
  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    const column = columns.find((c) => c.key === sortColumn);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.accessor
        ? column.accessor(a)
        : (a as Record<string, unknown>)[sortColumn];
      const bValue = column.accessor
        ? column.accessor(b)
        : (b as Record<string, unknown>)[sortColumn];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, columns, sortColumn, sortDirection]);

  // Render skeleton rows
  const renderSkeletonRows = () => {
    return Array.from({ length: skeletonRows }).map((_, index) => (
      <TableRow key={`skeleton-${index}`} hoverable={false} className="ui-table-skeleton-row">
        {columns.map((column) => (
          <TableCell key={column.key}>
            <div style={{
              height: '1em',
              background: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
            }} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  // Render cell content
  const renderCell = (item: T, column: DataTableColumn<T>, index: number) => {
    if (column.render) {
      return column.render(item, index);
    }
    const value = (item as Record<string, unknown>)[column.key];
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  const isEmpty = !loading && sortedData.length === 0;
  const showData = !loading && sortedData.length > 0;

  return (
    <div className={className}>
      <Table variant={variant} loading={loading}>
        <TableHead>
          <TableRow hoverable={false}>
            {columns.map((column) => (
              <TableHeaderCell
                key={column.key}
                align={column.align}
                width={column.width}
                sortable={column.sortable}
                sortDirection={sortColumn === column.key ? sortDirection : null}
                onSort={column.sortable ? () => handleSort(column.key) : undefined}
              >
                {column.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && renderSkeletonRows()}
          {isEmpty && (
            <TableEmpty colSpan={columns.length}>
              {emptyState || (
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                />
              )}
            </TableEmpty>
          )}
          {showData && sortedData.map((item, index) => {
            const key = String(item[rowKey]);
            const isSelected = selectedKeys?.has(key) || false;

            return (
              <TableRow
                key={key}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                selected={isSelected}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align}
                    truncate={column.truncate}
                    maxWidth={column.maxWidth}
                    muted={column.muted}
                    stopPropagation={column.stopPropagation}
                  >
                    {renderCell(item, column, index)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          showPageSize={!!pagination.onPageSizeChange}
          loading={loading}
        />
      )}
    </div>
  );
}
