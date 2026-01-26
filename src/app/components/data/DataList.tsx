import React, { ReactNode } from 'react';
import { CardSkeleton } from '../library/ui/CardSkeleton';
import '../library/ui/CardSkeleton.css';
import { Stack } from '../library/layout';

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
            <Stack gap="md">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <CardSkeleton key={i} variant="activity" />
                ))}
            </Stack>
        );
    }

    if (items.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <Stack gap="sm">
            {items.map((item, index) => (
                <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
                    {renderItem(item, index)}
                </React.Fragment>
            ))}
        </Stack>
    );
}
