import React from 'react';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    actionLabel,
    onAction
}) => {
    return (
        <div className="empty-state-card">
            <div className="empty-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{message}</p>
            {actionLabel && onAction && (
                <button className="btn primary" onClick={onAction} style={{ maxWidth: '200px' }}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
