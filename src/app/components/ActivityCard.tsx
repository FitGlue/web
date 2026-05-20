import React from 'react';
import './ActivityCard.css';

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

function getStatusDotClass(status?: string): string {
  if (!status) return 'activity-card__status-dot--synced';
  const s = status.toUpperCase();
  if (s === 'SYNCED' || s === 'OK' || s === 'SUCCESS') return 'activity-card__status-dot--synced';
  if (s === 'PENDING' || s === 'QUEUED' || s === 'RUNNING') return 'activity-card__status-dot--pending';
  if (s === 'ERROR' || s === 'FAILED') return 'activity-card__status-dot--error';
  return 'activity-card__status-dot--unknown';
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

  const displayStatus = status || (isUnsynchronized ? 'PENDING' : 'SYNCED');
  const statusDotClass = getStatusDotClass(displayStatus);

  return (
    <div className="activity-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}>

      {/* Top band strip */}
      <div className="activity-card__band">
        <span className="activity-card__type">{type}</span>
        <span className="activity-card__date">{dateStr}</span>
      </div>

      {/* Main body */}
      <div className="activity-card__body">
        <h3 className="activity-card__title">{title}</h3>

        <div className="activity-card__stats">
          <span className="activity-card__stat">{source}</span>
          <span className="activity-card__stat">{isUnsynchronized ? 'Attempted' : 'Synced'}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="activity-card__error">⚠ {errorMessage}</div>
      )}

      {/* Footer — sync status dot */}
      <div className="activity-card__footer">
        <span className="activity-card__status-label">{displayStatus}</span>
        <span className={`activity-card__status-dot ${statusDotClass}`} />
      </div>
    </div>
  );
};
