import React, { ReactNode } from 'react';
import './BoosterGrid.css';
import '../ui/CardSkeleton.css';

interface BoosterGridProps {
  /** Booster badges/pills */
  children: ReactNode;
  /** Whether boosters are still loading */
  loading?: boolean;
  /** Fallback text when no boosters */
  emptyText?: string;
}

/**
 * BoosterGrid - Displays boosters in a centered, wrapping grid layout.
 * Used within FlowVisualization to show the enrichers/boosters applied.
 */
export const BoosterGrid: React.FC<BoosterGridProps> = ({
  children,
  loading = false,
  emptyText = 'No boosters',
}) => {
  // Check if children is empty
  const hasChildren = React.Children.count(children) > 0;

  if (loading) {
    return (
      <div className="booster-grid booster-grid--loading">
        <div className="skeleton-line skeleton-line--booster" />
        <div className="skeleton-line skeleton-line--booster" />
      </div>
    );
  }

  if (!hasChildren) {
    return (
      <div className="booster-grid booster-grid--empty">
        <span className="booster-grid__empty-text">{emptyText}</span>
      </div>
    );
  }

  return (
    <div className="booster-grid">
      {children}
    </div>
  );
};

export default BoosterGrid;
