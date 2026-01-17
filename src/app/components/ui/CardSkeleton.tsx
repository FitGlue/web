import React from 'react';
import './CardSkeleton.css';

interface CardSkeletonProps {
    /** Variant determines the skeleton structure */
    variant?: 'default' | 'connections' | 'pipelines' | 'actions' | 'activity';
    /** Number of items to show in list variants */
    itemCount?: number;
}

/**
 * CardSkeleton provides shimmer loading placeholders for dashboard cards
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
    variant = 'default',
    itemCount = 3,
}) => {
    if (variant === 'connections') {
        return (
            <div className="card-skeleton card-skeleton--connections">
                <div className="card-skeleton__header">
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line skeleton-line--link" />
                </div>
                <div className="card-skeleton__list">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="card-skeleton__item">
                            <div className="skeleton-circle" />
                            <div className="skeleton-line skeleton-line--text" />
                            <div className="skeleton-circle skeleton-circle--small" />
                        </div>
                    ))}
                </div>
                <div className="card-skeleton__footer">
                    <div className="skeleton-line skeleton-line--stat" />
                </div>
            </div>
        );
    }

    if (variant === 'pipelines') {
        return (
            <div className="card-skeleton card-skeleton--pipelines">
                <div className="card-skeleton__header">
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line skeleton-line--link" />
                </div>
                <div className="card-skeleton__list">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="card-skeleton__item card-skeleton__item--flow">
                            <div className="skeleton-line skeleton-line--flow" />
                        </div>
                    ))}
                </div>
                <div className="card-skeleton__footer">
                    <div className="skeleton-line skeleton-line--stat" />
                </div>
            </div>
        );
    }

    if (variant === 'actions') {
        return (
            <div className="card-skeleton card-skeleton--actions">
                <div className="card-skeleton__header">
                    <div className="skeleton-line skeleton-line--title" />
                </div>
                <div className="card-skeleton__list">
                    {Array.from({ length: Math.min(itemCount, 2) }).map((_, i) => (
                        <div key={i} className="card-skeleton__item card-skeleton__item--action">
                            <div className="skeleton-circle" />
                            <div className="card-skeleton__action-text">
                                <div className="skeleton-line skeleton-line--text" />
                                <div className="skeleton-line skeleton-line--subtext" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card-skeleton__footer">
                    <div className="skeleton-line skeleton-line--stat" />
                </div>
            </div>
        );
    }

    if (variant === 'activity') {
        return (
            <div className="card-skeleton card-skeleton--activity">
                <div className="card-skeleton__activity-header">
                    <div className="skeleton-line skeleton-line--badge" />
                    <div className="skeleton-line skeleton-line--title-wide" />
                    <div className="skeleton-line skeleton-line--date" />
                </div>
                <div className="card-skeleton__activity-flow">
                    <div className="skeleton-line skeleton-line--node" />
                    <div className="skeleton-line skeleton-line--arrow" />
                    <div className="card-skeleton__activity-boosters">
                        <div className="skeleton-line skeleton-line--booster" />
                        <div className="skeleton-line skeleton-line--booster" />
                    </div>
                    <div className="skeleton-line skeleton-line--arrow" />
                    <div className="skeleton-line skeleton-line--node" />
                </div>
            </div>
        );
    }

    // Default skeleton
    return (
        <div className="card-skeleton">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--text" />
            <div className="skeleton-line skeleton-line--text skeleton-line--short" />
        </div>
    );
};
