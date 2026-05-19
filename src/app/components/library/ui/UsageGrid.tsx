import React from 'react';
import './UsageGrid.css';

export interface UsageCell {
  value: string | number;
  label: string;
  sub?: string;
  gradient?: boolean;
}

export interface UsageGridProps {
  cells: UsageCell[];
}

export const UsageGrid: React.FC<UsageGridProps> = ({ cells }) => {
  return (
    <div className="usage-grid">
      {cells.map((cell, i) => (
        <div key={i} className="usage-cell">
          <div className={`usage-cell__n${cell.gradient ? ' usage-cell__n--gradient' : ''}`}>
            {cell.value}
          </div>
          <div className="usage-cell__l">{cell.label}</div>
          {cell.sub && <div className="usage-cell__sub">{cell.sub}</div>}
        </div>
      ))}
    </div>
  );
};
