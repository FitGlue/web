import React from 'react';

interface Props {
  items: string[];
  className?: string;
}

export const StatPills: React.FC<Props> = ({ items, className }) => (
  <div className={`enhanced-pills${className ? ` ${className}` : ''}`}>
    {items.map((p, i) => (
      <span key={i} className="stat-pill">
        <span className="stat-pill-value">{p}</span>
      </span>
    ))}
  </div>
);
