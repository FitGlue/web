import React from 'react';

export interface StatItem {
  value: React.ReactNode;
  label?: string;
  color?: string;
  note?: boolean;
}

export const StatsBar: React.FC<{ items: StatItem[] }> = ({ items }) => (
  <div className="chart-stats-bar">
    {items.map((item, i) =>
      item.note ? (
        <div key={i} className="chart-stat-item chart-stat-wide">
          <span className="chart-stat-note">{item.value}</span>
        </div>
      ) : (
        <div key={i} className="chart-stat-item">
          <span className="chart-stat-value" style={item.color ? { color: item.color } : undefined}>
            {item.value}
          </span>
          <span className="chart-stat-label">{item.label}</span>
        </div>
      )
    )}
  </div>
);
