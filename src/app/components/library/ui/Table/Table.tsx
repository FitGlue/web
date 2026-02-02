import React, { ReactNode, createContext, useContext } from 'react';
import './Table.css';

// ============================================================================
// Context for table variant
// ============================================================================
interface TableContextValue {
  variant: TableVariant;
}

const TableContext = createContext<TableContextValue>({ variant: 'default' });

// ============================================================================
// Table Types
// ============================================================================
export type TableVariant = 'default' | 'compact' | 'striped';
export type TableAlign = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc' | null;

// ============================================================================
// Table (root)
// ============================================================================
export interface TableProps {
  /** Table variant */
  variant?: TableVariant;
  /** Loading state */
  loading?: boolean;
  /** Children (TableHead, TableBody) */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  variant = 'default',
  loading = false,
  children,
  className = '',
}) => {
  const classes = [
    'ui-table',
    variant !== 'default' && `ui-table--${variant}`,
    loading && 'ui-table-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <TableContext.Provider value={{ variant }}>
      <div className="ui-table-wrapper">
        <table className={classes}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
};

// ============================================================================
// TableHead
// ============================================================================
export interface TableHeadProps {
  children: ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ children }) => {
  return <thead className="ui-table-header">{children}</thead>;
};

// ============================================================================
// TableBody
// ============================================================================
export interface TableBodyProps {
  children: ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className="ui-table-body">{children}</tbody>;
};

// ============================================================================
// TableRow
// ============================================================================
export interface TableRowProps {
  /** Row children (TableCell or TableHeaderCell) */
  children: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether row is selected */
  selected?: boolean;
  /** Enable hover effect */
  hoverable?: boolean;
  /** Additional class name */
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  onClick,
  selected = false,
  hoverable = true,
  className = '',
}) => {
  const classes = [
    'ui-table-row',
    hoverable && 'ui-table-row--hoverable',
    onClick && 'ui-table-row--clickable',
    selected && 'ui-table-row--selected',
    className,
  ].filter(Boolean).join(' ');

  return (
    <tr className={classes} onClick={onClick}>
      {children}
    </tr>
  );
};

// ============================================================================
// TableHeaderCell
// ============================================================================
export interface TableHeaderCellProps {
  /** Cell content */
  children: ReactNode;
  /** Text alignment */
  align?: TableAlign;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort handler */
  onSort?: () => void;
  /** Column width */
  width?: string;
  /** Additional class name */
  className?: string;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  align = 'left',
  sortable = false,
  sortDirection = null,
  onSort,
  width,
  className = '',
}) => {
  const classes = [
    'ui-table-header-cell',
    align !== 'left' && `ui-table-header-cell--${align}`,
    sortable && 'ui-table-header-cell--sortable',
    sortDirection && 'ui-table-header-cell--sorted',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  const getSortIcon = () => {
    if (!sortable) return null;
    if (sortDirection === 'asc') return '↑';
    if (sortDirection === 'desc') return '↓';
    return '↕';
  };

  return (
    <th
      className={classes}
      style={{ width }}
      onClick={handleClick}
    >
      {children}
      {sortable && (
        <span className="ui-table-header-cell__sort-icon">
          {getSortIcon()}
        </span>
      )}
    </th>
  );
};

// ============================================================================
// TableCell
// ============================================================================
export interface TableCellProps {
  /** Cell content */
  children: ReactNode;
  /** Text alignment */
  align?: TableAlign;
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Max width for truncation */
  maxWidth?: string;
  /** Muted text style */
  muted?: boolean;
  /** Additional class name */
  className?: string;
  /** Stop click propagation (for action cells) */
  stopPropagation?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  truncate = false,
  maxWidth,
  muted = false,
  className = '',
  stopPropagation = false,
}) => {
  const classes = [
    'ui-table-cell',
    align !== 'left' && `ui-table-cell--${align}`,
    truncate && 'ui-table-cell--truncate',
    muted && 'ui-table-cell--muted',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <td
      className={classes}
      style={{ maxWidth }}
      onClick={handleClick}
    >
      {children}
    </td>
  );
};

// ============================================================================
// TableEmpty (for empty states)
// ============================================================================
export interface TableEmptyProps {
  /** Number of columns to span */
  colSpan: number;
  /** Empty state content */
  children: ReactNode;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  colSpan,
  children,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="ui-table-empty">
        {children}
      </td>
    </tr>
  );
};

// Hook to use table context
export const useTableContext = () => useContext(TableContext);
