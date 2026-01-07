import React from 'react';

interface MetaBadgeProps {
  label: string;
  value: string;
  variant?: 'type' | 'source' | 'default';
}

export const MetaBadge: React.FC<MetaBadgeProps> = ({ label, value, variant = 'default' }) => {
  // Determine color class based on value
  let colorClass = 'meta-default';

  const v = value.toLowerCase();
  if (variant === 'source') {
    if (v.includes('fitbit')) colorClass = 'meta-fitbit';
    if (v.includes('strava')) colorClass = 'meta-strava';
    if (v.includes('hevy')) colorClass = 'meta-hevy';
  } else if (variant === 'type') {
    // Activity types coloring
    if (v.includes('run')) colorClass = 'meta-run';
    if (v.includes('ride') || v.includes('bike')) colorClass = 'meta-ride';
    if (v.includes('swim')) colorClass = 'meta-swim';
    if (v.includes('weight') || v.includes('workout') || v.includes('crossfit')) colorClass = 'meta-workout';
  }

  return (
    <span className={`meta-badge ${colorClass}`}>
      <span className="meta-label">{label}:</span> {value}
    </span>
  );
};
