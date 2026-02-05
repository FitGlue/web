import React from 'react';
import { MultiRingSpinner } from './MultiRingSpinner';
import './LoadingState.css';

interface LoadingStateProps {
    /** Message to display below spinner */
    message?: string;
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * LoadingState displays a beautiful multi-ring loading spinner with optional message.
 * Use this for inline loading states within cards and sections.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    size = 'md'
}) => {
    return (
        <div className="loading-state">
            <MultiRingSpinner size={size} />
            {message && <p className="loading-state__message">{message}</p>}
        </div>
    );
};
