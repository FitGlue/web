import React from 'react';
import { getIntensityClass } from '../utils/section';

interface IntensityBadgeProps {
  label: string;
  size?: 'small' | 'large';
}

export const IntensityBadge: React.FC<IntensityBadgeProps> = ({ label, size = 'small' }) => {
  const cls = getIntensityClass(label);
  return (
    <span className={`intensity-badge ${cls}${size === 'large' ? ' large' : ''}`}>{label}</span>
  );
};
