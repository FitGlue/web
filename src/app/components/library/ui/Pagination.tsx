import React from 'react';
import { Button } from './Button';
import './Pagination.css';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Total number of items (optional, for display) */
  totalItems?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Current page size */
  pageSize?: number;
  /** Page size change handler */
  onPageSizeChange?: (size: number) => void;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Loading state (disables buttons) */
  loading?: boolean;
  /** Compact variant */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Pagination provides navigation between pages of data.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  pageSize,
  onPageSizeChange,
  showPageSize = false,
  loading = false,
  compact = false,
  className = '',
}) => {
  const classes = [
    'ui-pagination',
    compact && 'ui-pagination--compact',
    className,
  ].filter(Boolean).join(' ');

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={classes}>
      {/* Total items info */}
      {totalItems !== undefined && (
        <div className="ui-pagination__info">
          {totalItems.toLocaleString()} {totalItems === 1 ? 'item' : 'items'}
        </div>
      )}

      {/* Page size selector */}
      {showPageSize && pageSize !== undefined && onPageSizeChange && (
        <div className="ui-pagination__page-size">
          <span className="ui-pagination__page-size-label">Show:</span>
          <select
            className="ui-pagination__page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation controls */}
      <div className="ui-pagination__controls">
        <Button
          variant="secondary"
          size="small"
          onClick={handlePrevious}
          disabled={!canGoPrevious || loading}
        >
          ← Previous
        </Button>

        <span className="ui-pagination__page-info">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="small"
          onClick={handleNext}
          disabled={!canGoNext || loading}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};
