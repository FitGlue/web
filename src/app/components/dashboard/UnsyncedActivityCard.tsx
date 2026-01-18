import React from 'react';
import { UnsynchronizedEntry } from '../../services/ActivitiesService';
import { Card } from '../ui/Card';
import { formatActivityType } from '../../../shared/activityTypes';

interface UnsyncedActivityCardProps {
    entry: UnsynchronizedEntry;
    onClick?: () => void;
}



/**
 * Format source name for display
 */
const formatSourceName = (source?: string): string => {
    if (!source) return 'Unknown';

    const names: Record<string, string> = {
        hevy: 'Hevy',
        strava: 'Strava',
        fitbit: 'Fitbit',
        garmin: 'Garmin',
        apple: 'Apple Health',
    };
    return names[source.toLowerCase()] || source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
};

/**
 * Get status color class based on status
 */
const getStatusClass = (status?: string): string => {
    if (!status) return 'unsynced-activity-card--pending';

    switch (status.toUpperCase()) {
        case 'FAILED':
        case 'ERROR':
            return 'unsynced-activity-card--failed';
        case 'STALLED':
        case 'AWAITING_INPUT':
            return 'unsynced-activity-card--stalled';
        default:
            return 'unsynced-activity-card--pending';
    }
};

/**
 * UnsyncedActivityCard displays pipeline executions that failed or stalled
 * Shows error information and status prominently
 */
export const UnsyncedActivityCard: React.FC<UnsyncedActivityCardProps> = ({
    entry,
    onClick,
}) => {
    const activityTitle = entry.title || 'Unknown Activity';
    const activityType = formatActivityType(entry.activityType);
    const sourceName = formatSourceName(entry.source);

    const attemptDate = entry.timestamp
        ? new Date(entry.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    const statusLabel = entry.status?.replace(/_/g, ' ').toLowerCase() || 'pending';

    return (
        <Card
            className={`unsynced-activity-card ${getStatusClass(entry.status)}`}
            onClick={onClick}
        >
            {/* Header: Title + Status Badge */}
            <div className="unsynced-activity-card__header">
                <div className="unsynced-activity-card__title-section">
                    <span className="unsynced-activity-card__type-badge">{activityType}</span>
                    <h4 className="unsynced-activity-card__title">{activityTitle}</h4>
                </div>
                <span className="unsynced-activity-card__status-badge">{statusLabel}</span>
            </div>

            {/* Source Info */}
            <div className="unsynced-activity-card__source-row">
                <span className="unsynced-activity-card__source-icon">📥</span>
                <span className="unsynced-activity-card__source-label">From {sourceName}</span>
                {attemptDate && (
                    <span className="unsynced-activity-card__date">Attempted: {attemptDate}</span>
                )}
            </div>

            {/* Error Message */}
            {entry.errorMessage && (
                <div className="unsynced-activity-card__error">
                    <span className="unsynced-activity-card__error-icon">⚠️</span>
                    <span className="unsynced-activity-card__error-text">{entry.errorMessage}</span>
                </div>
            )}

            {/* Action hint */}
            <div className="unsynced-activity-card__action-hint">
                <span>Click to view details →</span>
            </div>
        </Card>
    );
};
