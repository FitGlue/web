import React from 'react';
import { StatusPill } from './ui/StatusPill';
import { MetaBadge } from './MetaBadge';

interface ActivityCardProps {
  title: string;
  type: string;
  source: string;
  timestamp: string | null; // ISO string
  status?: string; // Optional, defaults to "Synced" if not provided/synced mode
  errorMessage?: string;
  onClick: () => void;
  isUnsynchronized?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  type,
  source,
  timestamp,
  status,
  errorMessage,
  onClick,
  isUnsynchronized
}) => {

  const dateStr = timestamp ? new Date(timestamp).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A';

  return (
    <div className={`card clickable activity-card ${isUnsynchronized ? 'unsync-card' : ''}`} onClick={onClick}>
      <div className="card-top">
        <h3 className="card-title">{title}</h3>
        {status && <StatusPill status={status} />}
        {!status && !isUnsynchronized && <StatusPill status="SYNCED" />}
      </div>

      <div className="card-meta-row">
        <MetaBadge label="Type" value={type} />
        <MetaBadge label="Source" value={source} />
      </div>

      {errorMessage && (
        <div className="error-preview-box">
          <span className="error-icon">⚠️</span> {errorMessage}
        </div>
      )}

      <div className="card-footer">
        <span className="timestamp-label">{isUnsynchronized ? 'Attempted' : 'Synced'}: {dateStr}</span>
      </div>
    </div>
  );
};
