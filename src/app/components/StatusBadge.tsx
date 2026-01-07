import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normStatus = status.toUpperCase().replace('STATUS_', '');
  let className = 'status-badge small';

  // Map normalized status to styling classes defined in main.css
  switch (normStatus) {
    case 'SUCCESS':
    case 'COMPLETED':
      className += ' badge-success';
      break;
    case 'FAILED':
    case 'FAILED_STRAVA_PROCESSING':
      className += ' badge-failed';
      break;
    case 'SKIPPED':
      className += ' badge-skipped';
      break;
    case 'STARTED':
    case 'RUNNING':
      className += ' badge-started';
      break;
    case 'WAITING':
    case 'LAGGED':
    case 'LAGGED_RETRY':
      className += ' badge-waiting';
      break;
    default:
      // Default gray/transparent fallback
      break;
  }

  return (
    <span className={className}>
      {normStatus}
    </span>
  );
};
