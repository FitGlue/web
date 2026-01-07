import React, { ReactNode } from 'react';
import { LoadingState } from '../ui/LoadingState';

interface DataListProps<T> {
    /** Items to render */
    items: T[];
    /** Render function for each item */
    renderItem: (item: T, index: number) => ReactNode;
    /** Key extractor for items */
    keyExtractor?: (item: T, index: number) => string | number;
    /** Loading state */
    loading?: boolean;
    /** Loading message */
    loadingMessage?: string;
    /** Empty state component */
    emptyState?: ReactNode;
    /** Container className */
    className?: string;
}

/**
 * DataList renders a list of items with loading and empty states.
 */
export function DataList<T>({
    items,
    renderItem,
    keyExtractor,
    loading = false,
    loadingMessage = 'Loading...',
    emptyState,
    className = 'inputs-list',
}: DataListProps<T>) {
    if (loading && items.length === 0) {
        return <LoadingState message={loadingMessage} />;
    }

    if (items.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <div className={className}>
            {items.map((item, index) => (
                <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
                    {renderItem(item, index)}
                </React.Fragment>
            ))}
        </div>
    );
}
