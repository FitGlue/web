import React from 'react';

interface StatusPillProps {
    status: string;
    size?: 'small' | 'default';
}

const getStatusClass = (norm: string): string => {
    switch (norm) {
        case 'OK':
        case 'PASS':
        case 'SUCCESS':
        case 'COMPLETED':
        case 'SYNCED':
            return 'fg-status--ok';
        case 'FAILED':
        case 'ERROR':
        case 'FAILED_STRAVA_PROCESSING':
            return 'fg-status--failed';
        case 'RUNNING':
        case 'STARTED':
            return 'fg-status--running';
        case 'SKIPPED':
            return 'fg-status--skipped';
        case 'QUEUED':
        case 'PENDING':
        case 'WAITING':
        case 'LAGGED':
        case 'LAGGED_RETRY':
        case 'STALLED':
        case 'AWAITING_INPUT':
            return 'fg-status--queued';
        case 'RETRIED':
            return 'fg-status--retried';
        default:
            return 'fg-status--skipped';
    }
};

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    const norm = status.toUpperCase().replace(/^STATUS_/, '');
    return (
        <span className={`fg-status ${getStatusClass(norm)}`}>{norm}</span>
    );
};

export default StatusPill;
