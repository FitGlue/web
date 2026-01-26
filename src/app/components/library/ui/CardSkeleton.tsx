import React from 'react';
import './CardSkeleton.css';

interface CardSkeletonProps {
    /** Variant determines the skeleton structure */
    variant?: 'default' | 'connections' | 'pipelines' | 'actions' | 'activity' | 'pipeline-full' | 'integration' | 'activity-detail' | 'subscription' | 'file-upload';
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
    // Connections: icon + name + checkmark (matches ConnectionStatusItem)
    if (variant === 'connections') {
        return (
            <div className="card-skeleton__list">
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className="card-skeleton__connection-item">
                        <div className="skeleton-icon skeleton-icon--small" />
                        <div className="skeleton-line skeleton-line--name" />
                        <div className="skeleton-line skeleton-line--checkmark" />
                    </div>
                ))}
            </div>
        );
    }

    // Pipelines: title + subtitle + booster pill (matches SummaryListItem with status pill)
    if (variant === 'pipelines') {
        return (
            <div className="card-skeleton__list">
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className="card-skeleton__pipeline-item">
                        <div className="card-skeleton__pipeline-text">
                            <div className="skeleton-line skeleton-line--title-sm" />
                            <div className="skeleton-line skeleton-line--subtitle" />
                        </div>
                        <div className="skeleton-line skeleton-line--pill" />
                    </div>
                ))}
            </div>
        );
    }

    // Actions: square icon + title with badge + subtitle + arrow (matches PendingInputItem)
    if (variant === 'actions') {
        return (
            <div className="card-skeleton__list">
                {Array.from({ length: Math.min(itemCount, 3) }).map((_, i) => (
                    <div key={i} className="card-skeleton__action-item">
                        <div className="skeleton-icon skeleton-icon--square" />
                        <div className="card-skeleton__action-text">
                            <div className="card-skeleton__action-title-row">
                                <div className="skeleton-line skeleton-line--action-title" />
                                <div className="skeleton-line skeleton-line--badge-sm" />
                            </div>
                            <div className="skeleton-line skeleton-line--subtitle" />
                        </div>
                        <div className="skeleton-line skeleton-line--arrow-icon" />
                    </div>
                ))}
            </div>
        );
    }

    // Activity card: gradient header with title + date, then horizontal booster pills
    if (variant === 'activity') {
        return (
            <div className="card-skeleton card-skeleton--activity">
                <div className="card-skeleton__activity-header">
                    <div className="card-skeleton__activity-header-left">
                        <div className="skeleton-line skeleton-line--badge-sm" />
                        <div className="skeleton-line skeleton-line--activity-title" />
                    </div>
                    <div className="skeleton-line skeleton-line--date" />
                </div>
                <div className="card-skeleton__activity-body">
                    <div className="card-skeleton__boosters-row">
                        <div className="skeleton-line skeleton-line--booster" />
                        <div className="skeleton-line skeleton-line--booster" />
                        <div className="skeleton-line skeleton-line--booster" />
                        <div className="skeleton-line skeleton-line--booster" />
                    </div>
                    <div className="card-skeleton__boosters-row">
                        <div className="skeleton-line skeleton-line--booster" />
                        <div className="skeleton-line skeleton-line--booster" />
                        <div className="skeleton-line skeleton-line--booster" />
                    </div>
                </div>
            </div>
        );
    }

    // File upload panel: two-column layout with dropzone and form
    if (variant === 'file-upload') {
        return (
            <div className="card-skeleton card-skeleton--file-upload">
                <div className="card-skeleton__upload-header">
                    <div className="skeleton-line skeleton-line--icon" />
                    <div className="skeleton-line skeleton-line--title" />
                </div>
                <div className="card-skeleton__upload-grid">
                    {/* Left: Dropzone */}
                    <div className="card-skeleton__upload-left">
                        <div className="skeleton-line skeleton-line--label-sm" />
                        <div className="skeleton-box skeleton-box--dropzone" />
                    </div>
                    {/* Right: Form fields */}
                    <div className="card-skeleton__upload-right">
                        <div className="skeleton-line skeleton-line--label-sm" />
                        <div className="card-skeleton__upload-fields">
                            <div className="skeleton-line skeleton-line--label-xs" />
                            <div className="skeleton-box skeleton-box--input" />
                            <div className="skeleton-line skeleton-line--label-xs" />
                            <div className="skeleton-box skeleton-box--textarea" />
                        </div>
                    </div>
                </div>
                <div className="skeleton-box skeleton-box--button-full" />
            </div>
        );
    }

    // Full pipeline card skeleton (for PipelinesPage)
    if (variant === 'pipeline-full') {
        return (
            <div className="card-skeleton">
                <div className="card-skeleton__header">
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line skeleton-line--link" />
                </div>
                <div className="card-skeleton__flow">
                    <div className="skeleton-icon" />
                    <div className="skeleton-line skeleton-line--arrow" />
                    <div className="card-skeleton__boosters-row">
                        <div className="skeleton-line skeleton-line--booster" />
                        <div className="skeleton-line skeleton-line--booster" />
                    </div>
                    <div className="skeleton-line skeleton-line--arrow" />
                    <div className="skeleton-icon" />
                </div>
                <div className="card-skeleton__footer">
                    <div className="skeleton-line skeleton-line--stat" />
                </div>
            </div>
        );
    }

    // Integration/Connection card skeleton
    if (variant === 'integration') {
        return (
            <div className="card-skeleton">
                <div className="card-skeleton__header">
                    <div className="skeleton-icon" />
                    <div className="card-skeleton__text-group">
                        <div className="skeleton-line skeleton-line--title" />
                        <div className="skeleton-line skeleton-line--subtext" />
                    </div>
                </div>
                <div className="card-skeleton__body">
                    <div className="skeleton-line skeleton-line--text" />
                </div>
                <div className="card-skeleton__footer">
                    <div className="skeleton-line skeleton-line--button" />
                </div>
            </div>
        );
    }

    // Activity detail page skeleton
    if (variant === 'activity-detail') {
        return (
            <div className="card-skeleton card-skeleton--detail">
                {/* Hero header */}
                <div className="card-skeleton__hero">
                    <div className="card-skeleton__header">
                        <div className="skeleton-line skeleton-line--badge-sm" />
                        <div className="skeleton-line skeleton-line--title skeleton-line--title-lg" />
                    </div>
                    <div className="skeleton-line skeleton-line--text" style={{ marginTop: '1rem' }} />
                    {/* Flow visualization */}
                    <div className="card-skeleton__flow">
                        <div className="skeleton-icon" />
                        <div className="skeleton-line skeleton-line--arrow" />
                        <div className="card-skeleton__boosters-row">
                            <div className="skeleton-line skeleton-line--booster" />
                            <div className="skeleton-line skeleton-line--booster" />
                            <div className="skeleton-line skeleton-line--booster" />
                        </div>
                        <div className="skeleton-line skeleton-line--arrow" />
                        <div className="skeleton-icon" />
                    </div>
                </div>
                {/* Destinations card */}
                <div className="card-skeleton" style={{ marginTop: '1rem' }}>
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="card-skeleton__list">
                        <div className="card-skeleton__connection-item">
                            <div className="skeleton-icon skeleton-icon--small" />
                            <div className="skeleton-line skeleton-line--name" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Subscription banner skeleton
    if (variant === 'subscription') {
        return (
            <div className="card-skeleton card-skeleton--subscription">
                <div className="skeleton-line skeleton-line--badge" />
                <div className="card-skeleton__subscription-right">
                    <div className="skeleton-line skeleton-line--stat" />
                    <div className="skeleton-line skeleton-line--button" />
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
