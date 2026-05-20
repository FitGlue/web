import React from 'react';

interface MetaBadgeProps {
  label: string;
  value: string;
}

export const MetaBadge: React.FC<MetaBadgeProps> = ({ label, value }) => {
  return (
    <span className="fg-stamp fg-stamp--ink">
      <span style={{ opacity: 0.65 }}>{label}:</span>
      {' '}
      <span>{value}</span>
    </span>
  );
};
