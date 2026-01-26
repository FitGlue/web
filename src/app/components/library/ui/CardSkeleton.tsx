import React from 'react';
import './CardSkeleton.css';

interface CardSkeletonProps {
    /** Variant determines the skeleton structure */
    variant?: 'default' | 'connections' | 'pipelines' | 'actions' | 'activity' | 'pipeline-full' | 'integration' | 'activity-detail';
    /** Number of items to show in list variants */
    itemCount?: number;
}

/**
 * CardSkeleton provides shimmer loading placeholders for dashboard cards and page content
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
    variant = 'default',
    itemCount = 3,
}) => {
    if (variant === 'connections') {
        return (
            <div>
                <div>
                    <div />
                    <div />
                </div>
                <div>
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i}>
                            <div />
                            <div />
                            <div />
                        </div>
                    ))}
                </div>
                <div>
                    <div />
                </div>
            </div>
        );
    }

    if (variant === 'pipelines') {
        return (
            <div>
                <div>
                    <div />
                    <div />
                </div>
                <div>
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i}>
                            <div />
                        </div>
                    ))}
                </div>
                <div>
                    <div />
                </div>
            </div>
        );
    }

    if (variant === 'actions') {
        return (
            <div>
                <div>
                    <div />
                </div>
                <div>
                    {Array.from({ length: Math.min(itemCount, 2) }).map((_, i) => (
                        <div key={i}>
                            <div />
                            <div>
                                <div />
                                <div />
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <div />
                </div>
            </div>
        );
    }

    if (variant === 'activity') {
        return (
            <div>
                <div>
                    <div />
                    <div />
                    <div />
                </div>
                <div>
                    <div />
                    <div />
                    <div>
                        <div />
                        <div />
                    </div>
                    <div />
                    <div />
                </div>
            </div>
        );
    }

    // Full pipeline card skeleton (for PipelinesPage)
    if (variant === 'pipeline-full') {
        return (
            <div>
                <div>
                    <div />
                    <div />
                    <div>
                        <div />
                        <div />
                    </div>
                    <div />
                    <div />
                </div>
                <div>
                    <div />
                    <div>
                        <div />
                        <div />
                    </div>
                </div>
            </div>
        );
    }

    // Integration/Connection card skeleton
    if (variant === 'integration') {
        return (
            <div>
                <div>
                    <div />
                    <div>
                        <div />
                        <div />
                    </div>
                </div>
                <div>
                    <div />
                </div>
                <div>
                    <div />
                </div>
            </div>
        );
    }

    // Activity detail page skeleton
    if (variant === 'activity-detail') {
        return (
            <div>
                {/* Hero header */}
                <div>
                    <div>
                        <div />
                        <div />
                    </div>
                    <div style={{ marginTop: '1rem' }} />
                    {/* Flow visualization */}
                    <div>
                        <div />
                        <div />
                        <div>
                            <div />
                            <div>
                                <div />
                                <div />
                            </div>
                        </div>
                        <div />
                        <div />
                    </div>
                </div>
                {/* Destinations card */}
                <div>
                    <div />
                    <div>
                        <div>
                            <div />
                            <div />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default skeleton
    return (
        <div>
            <div />
            <div />
            <div />
        </div>
    );
};
