import React from 'react';

interface TourTargetProps {
    /** Tour step identifier — matches the `targetSelector` in tour step definitions */
    id: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * TourTarget — wraps content with a `data-tour` attribute so the GuidedTour
 * spotlight can locate and highlight it.
 */
export const TourTarget: React.FC<TourTargetProps> = ({ id, children, className }) => (
    <div data-tour={id} className={className}>
        {children}
    </div>
);
