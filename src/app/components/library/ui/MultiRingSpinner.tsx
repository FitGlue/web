import React from 'react';
import './MultiRingSpinner.css';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface MultiRingSpinnerProps {
    /** Size of the spinner */
    size?: SpinnerSize;
    /** Optional CSS class name */
    className?: string;
}

/**
 * A beautiful multi-ring spinner with brand colors.
 * Features three concentric rings spinning at different speeds.
 */
export const MultiRingSpinner: React.FC<MultiRingSpinnerProps> = ({
    size = 'md',
    className = ''
}) => {
    return (
        <div className={`multi-ring-spinner multi-ring-spinner--${size} ${className}`}>
            <div className="multi-ring-spinner__ring" />
            <div className="multi-ring-spinner__ring multi-ring-spinner__ring--2" />
            <div className="multi-ring-spinner__ring multi-ring-spinner__ring--3" />
        </div>
    );
};
