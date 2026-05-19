import React, { ReactNode } from 'react';
import './DataList.css';

interface DataListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    keyExtractor?: (item: T, index: number) => string | number;
    loading?: boolean;
    loadingMessage?: string;
    emptyState?: ReactNode;
    /** Number of skeleton items to show when loading (default: 3) */
    skeletonCount?: number;
}

/**
 * DataList — Brutal × Aurora reskin
 * Flat row list with hairline dividers, ink-2 surface
 */
export function DataList<T>({
    items,
    renderItem,
    keyExtractor,
    loading = false,
    emptyState,
    skeletonCount = 3,
}: DataListProps<T>) {
    if (loading && items.length === 0) {
        return (
            <div className="ba-data-list">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <div key={i} className="ba-data-list__skeleton" />
                ))}
            </div>
        );
    }

    if (items.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <div className="ba-data-list">
            {items.map((item, index) => (
                <div key={keyExtractor ? keyExtractor(item, index) : index} className="ba-data-list__row">
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    );
}
