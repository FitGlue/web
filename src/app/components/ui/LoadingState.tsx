import React from 'react';

interface LoadingStateProps {
    /** Message to display below spinner */
    message?: string;
}

/**
 * LoadingState displays a consistent loading spinner with optional message.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...'
}) => {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>{message}</p>
        </div>
    );
};
