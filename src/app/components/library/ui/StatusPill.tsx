import React from 'react';
import { Pill } from './Pill';

interface StatusPillProps {
  /** Status string to display */
  status: string;
  /** Size variant */
  size?: 'small' | 'default';
}

/**
 * Get Pill variant based on status string.
 * Normalizes status and maps to appropriate visual variant.
 */
const getVariantForStatus = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const normStatus = status.toUpperCase().replace('STATUS_', '');

  switch (normStatus) {
    case 'SUCCESS':
    case 'COMPLETED':
    case 'SYNCED':
      return 'success';
    case 'FAILED':
    case 'ERROR':
    case 'FAILED_STRAVA_PROCESSING':
      return 'error';
    case 'SKIPPED':
    case 'PENDING':
      return 'default';
    case 'STARTED':
    case 'RUNNING':
      return 'info';
    case 'WAITING':
    case 'LAGGED':
    case 'LAGGED_RETRY':
    case 'STALLED':
    case 'AWAITING_INPUT':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * StatusPill - Status-aware Pill that maps status strings to visual variants.
 * Replacement for the old StatusBadge component.
 */
export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'small' }) => {
  const normStatus = status.toUpperCase().replace('STATUS_', '');
  const variant = getVariantForStatus(status);

  return (
    <Pill variant={variant} size={size}>
      {normStatus}
    </Pill>
  );
};

export default StatusPill;
