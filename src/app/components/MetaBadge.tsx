import React from 'react';
import { stringToColor } from '../../lib/colorUtils';

interface MetaBadgeProps {
  label: string;
  value: string;
}

export const MetaBadge: React.FC<MetaBadgeProps> = ({ label, value }) => {
  const { style, className } = stringToColor(value);

  return (
    <span className={`meta-badge ${className}`} style={style}>
      <span className="meta-label">{label}:</span> {value}
    </span>
  );
};
