import React from 'react';

export interface StatBlockProps {
  value: React.ReactNode;
  label: string;
  unit?: string;
  hint?: string;
  icon?: string;
  valueClassName?: string;
  sub?: React.ReactNode;
  children?: React.ReactNode;
}

export const StatBlock: React.FC<StatBlockProps> = ({ value, label, unit, hint, icon, valueClassName, sub, children }) => (
  <div className="stat-block">
    {icon && <div className="stat-block-icon">{icon}</div>}
    <div className={`stat-block-value${valueClassName ? ` ${valueClassName}` : ''}`}>{value}</div>
    {sub && <div className="stat-block-sub">{sub}</div>}
    <div className="stat-block-label">{label}</div>
    {unit && <div className="stat-block-unit">{unit}</div>}
    {hint && <div className="stat-block-hint">{hint}</div>}
    {children}
  </div>
);
